"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { SuggestionCard } from "@/components/discover/SuggestionCard";
import {
  ArenaPromoSlide,
  FreeSpinsPromoSlide,
} from "@/components/discover/PromoSlides";
import { useShell } from "@/lib/filter-context";
import { getGameDetails } from "@/lib/games-catalogue";

/**
 * For You / Discover — vertical-snap reels feed (TikTok / Reels style).
 *
 * Performance + UX contract:
 *
 *   1. Video starts playing instantly — no poster image flashes
 *      before the first frame. The active reel uses preload="auto"
 *      so the first frame is decoded and ready by the time the
 *      page mounts; off-screen reels stay at preload="none".
 *   2. The reel column extends UP under the brand bar's rounded
 *      bottom corners (-mt-[24px]) so the page's #f5f5f5 bg can't
 *      peek through the corner cutouts of the brand bar — only
 *      the black video shows through.
 *   3. Title + action stack live OUTSIDE the per-reel <article>,
 *      fixed-positioned over the reel feed. They stay anchored in
 *      the same screen position as the user flicks between reels;
 *      only their content updates (title crossfades to the new
 *      reel's metadata, action stack persists as-is).
 *   4. Every UI element clears the bottom nav via --bottom-nav-h
 *      (defined in globals.css), so layout is identical in mobile
 *      Safari and PWA standalone mode.
 *
 * IntersectionObserver per reel: only the reel ≥60% in view plays.
 * Off-screen reels are paused, currentTime reset, src detached
 * + reattached so the browser releases the decoded-frame buffer.
 *
 * Source video re-encode recipe (apply before shipping — 8–15 MB
 * raw files are too heavy for cellular):
 *
 *   ffmpeg -i input.mp4 \
 *     -c:v libx264 -profile:v main -level 4.0 -pix_fmt yuv420p \
 *     -vf "scale='min(720,iw)':-2,fps=30" \
 *     -preset slow -b:v 1500k -maxrate 1800k -bufsize 3M \
 *     -g 48 -keyint_min 48 -sc_threshold 0 \
 *     -c:a aac -b:a 96k -ac 2 -ar 44100 \
 *     -movflags +faststart \
 *     output.mp4
 */

type Reel = {
  id: string;
  game: string;
  studio: string;
  video: string;
  /** Square thumbnail for the title row chrome — sits to the left of
   *  the game name so the user sees the actual game art alongside
   *  the metadata. */
  thumb: string;
  /** Display RTP, e.g. "96.5%". Surfaced in the chrome's subtitle
   *  slot (replaces the previous studio-name line, which was less
   *  useful to a player choosing what to play next). */
  rtp: string;
  /** Marks a brand/sponsorship slot. Ad reels render the video full-
   *  bleed with NO chrome — no studio/title meta, no action stack,
   *  no sound toggle button. The reel is the creative. */
  ad?: boolean;
};

const REELS: Reel[] = [
  {
    id: "v1",
    game: "Buffalo Bills",
    studio: "Big Time Gaming",
    video: "/assets/videos/video1.mp4",
    thumb: "/assets/games/slot-01.png",
    rtp: "94%",
  },
  {
    id: "v2",
    game: "Tiki Tumble",
    studio: "Quickspin",
    video: "/assets/videos/video2.mp4",
    thumb: "/assets/games/slot-08.png",
    rtp: "96.55%",
  },
  {
    id: "v3",
    game: "Jewel Stepper",
    studio: "Microgaming",
    video: "/assets/videos/video3.mp4",
    thumb: "/assets/games/slot-04.png",
    rtp: "96.30%",
  },
  {
    id: "v4",
    game: "Maze Escape",
    studio: "Hacksaw Gaming",
    video: "/assets/videos/video4.mp4",
    thumb: "/assets/games/slot-11.png",
    rtp: "96.20%",
  },
  {
    id: "v5",
    game: "Snake Arena",
    studio: "Relax Gaming",
    video: "/assets/videos/video5.mp4",
    thumb: "/assets/games/slot-13.png",
    rtp: "95.80%",
  },
  {
    id: "v6",
    game: "Mummy Mania",
    studio: "Yggdrasil",
    video: "/assets/videos/video6.mp4",
    thumb: "/assets/games/slot-07.png",
    rtp: "96.10%",
  },
];

// How many reels to render in the very first batch. Each loop is
// a full pass of the source clips (6 clips), so 2 loops = 12
// articles up front.
const INITIAL_LOOPS = 2;
// When the active reel is within this many of the rendered end,
// extend the feed by another loop. Two-ahead so the next loop's
// articles are mounted + start loading well before the user
// arrives — otherwise the first scroll past the end of the
// rendered feed lands on an article that hasn't decoded its
// first frame yet, which reads as a black screen.
const PREFETCH_AHEAD = 2;
// Hard cap on the loop count. Was unbounded — every prefetch
// trigger appended another 4 articles, so after a long scroll
// session the DOM had 30+ <article> elements each with a <video>
// child. iOS Safari starts dropping frames around 6-8 concurrent
// videos and the feed visibly bogged down. 6 loops = 24 reels =
// ~24 vertical screens, more than any one session realistically
// burns through. Past that, the feed simply stops extending and
// the user hits the natural end.
const MAX_LOOPS = 6;
// Only mount the actual <video> element for reels within this
// distance of the active index. Reels outside the window render
// as black-bg <article> placeholders so the snap-scroll geometry
// is preserved, but no decoder is allocated for them. Keeps
// concurrent <video> count to at most (BEFORE+1+AFTER) = 5 at any
// time — well under Safari's cap.
const VIDEO_WINDOW_BEFORE = 1;
const VIDEO_WINDOW_AFTER = 3;

export default function DiscoverPage() {
  // Each "loop" is a full pass of REELS (6 source clips). Bumping
  // `loops` appends another full pass to the rendered feed, giving
  // the user an effectively infinite scroll — REELS[0] → REELS[5]
  // → REELS[0] → REELS[5] → ... — until MAX_LOOPS is hit.
  const [loops, setLoops] = useState(INITIAL_LOOPS);
  const [activeIndex, setActiveIndex] = useState(0);
  // Music ON by default. Browser autoplay policy will block this
  // on a cold load (no user gesture yet) — the <video> elements
  // start muted by hardware default, but the user toggles via the
  // speaker icon and the page-level `muted` state flips to false on
  // first interaction. Setting initial state to `false` means the
  // first tap (and any future tap-to-mute) lines up with the
  // page's intent — and once the page has a gesture, subsequent
  // reels play with audio without needing a second tap.
  const [muted, setMuted] = useState(false);
  // Suggestion card visibility — when its IntersectionObserver
  // promotes it to active (≥60% in view), we suppress the reel
  // chrome (title + action stack) so the SuggestionCard's own UI
  // can breathe.
  const [suggestionActive, setSuggestionActive] = useState(false);
  // Promo slides (Arena recruiter after video 8, Free Spins after
  // video 10). Same active-state treatment as the suggestion card —
  // when one is in view we hide the reel chrome and force-pause
  // reels so audio doesn't leak under a static promo screen.
  const [arenaPromoActive, setArenaPromoActive] = useState(false);
  const [freeSpinsPromoActive, setFreeSpinsPromoActive] = useState(false);
  const overlayActive =
    suggestionActive || arenaPromoActive || freeSpinsPromoActive;

  // Materialise the rendered feed by cycling REELS. Each rendered
  // article gets a unique `key` (sourceId + position in the feed)
  // so React doesn't try to reuse <video> elements across the
  // boundary — every loop iteration is a fresh mount of its own
  // video, which keeps the playhead and buffer behaviour correct.
  const reels = useMemo(() => {
    const out: Array<Reel & { key: string; sourceIndex: number }> = [];
    const total = loops * REELS.length;
    for (let i = 0; i < total; i++) {
      const sourceIndex = i % REELS.length;
      const r = REELS[sourceIndex];
      out.push({ ...r, sourceIndex, key: `${r.id}-${i}` });
    }
    return out;
  }, [loops]);

  // Append another loop when the user gets close to the end of the
  // currently rendered feed — capped at MAX_LOOPS so the DOM
  // doesn't balloon. Beyond the cap the feed simply stops growing.
  useEffect(() => {
    if (activeIndex >= reels.length - PREFETCH_AHEAD) {
      setLoops((n) => (n < MAX_LOOPS ? n + 1 : n));
    }
  }, [activeIndex, reels.length]);

  const active = reels[activeIndex] ?? reels[0];

  return (
    <div className="relative">
      {/* Reel column — extends ~24px up under the brand bar's
          20px rounded bottom corners so the page's white bg can't
          peek through the corner cutouts. The brand bar is z-30
          and stays on top visually. */}
      <div
        className="relative h-[100dvh] -mt-[24px] overflow-y-auto overflow-x-hidden snap-y snap-mandatory overscroll-contain bg-black"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {reels.map((reel, i) => {
          const distance = i - activeIndex;
          const mountVideo =
            distance >= -VIDEO_WINDOW_BEFORE && distance <= VIDEO_WINDOW_AFTER;
          return (
          <Fragment key={reel.key}>
            <ReelArticle
              reel={reel}
              index={i}
              activeIndex={activeIndex}
              muted={muted}
              forcePause={overlayActive}
              mountVideo={mountVideo}
              onEnter={() => setActiveIndex(i)}
              onTapVideo={() => setMuted((m) => !m)}
            />
            {/* After the 2nd reel (index 1) drop in a single
                "More games" suggestion slide — full-height snap
                target with a sideways-swipeable carousel of Casino
                / Live / Bingo / Arena game tiles. Lands as the
                3rd screen in the feed so the user hits it early
                in the scroll session. Rendered once per feed (not
                per loop). */}
            {/* Three blue interstitial slides interleaved into the
                feed at every-4th-video positions (after reels 4, 8,
                12 → zero-indexed i === 3, 7, 11). Reads as a steady
                rhythm rather than two bunched-up slides early on. */}
            {i === 3 && (
              <SuggestionCard
                muted={muted}
                onActiveChange={setSuggestionActive}
              />
            )}
            {i === 7 && (
              <ArenaPromoSlide onActiveChange={setArenaPromoActive} />
            )}
            {i === 11 && (
              <FreeSpinsPromoSlide
                onActiveChange={setFreeSpinsPromoActive}
              />
            )}
          </Fragment>
          );
        })}
      </div>

      {/* Fixed UI — title (bottom-left) + action stack (bottom-right).
          Sit OUTSIDE the per-reel <article> so they stay anchored on
          screen while the reels scroll past behind them. Width
          clamped to the mobile-frame's column via the same
          --frame-right-offset CSS var the rest of the app uses, so
          on desktop the UI sits over the 375px column instead of
          the whole monitor. */}
      {/* FixedReelChrome is hidden whenever any non-reel slide is
          in view (SuggestionCard, ArenaPromoSlide, FreeSpinsPromoSlide).
          Those slides own their full screen and we don't want the
          reel chrome bleeding through with stale metadata for the
          last reel the user saw. */}
      {!overlayActive && (
        <FixedReelChrome
          reel={active}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />
      )}
    </div>
  );
}

function ReelArticle({
  reel,
  index,
  activeIndex,
  muted,
  forcePause,
  mountVideo,
  onEnter,
  onTapVideo,
}: {
  reel: Reel;
  index: number;
  activeIndex: number;
  muted: boolean;
  /** When the SuggestionCard is in view it owns the audio channel
   *  (plays its own bg music). Force-pausing the reel here keeps the
   *  reel video's audio from leaking through underneath, and stops
   *  the playhead drifting while the slide is on screen. */
  forcePause?: boolean;
  /** Only mount the actual <video> element when this article is
   *  within the active window (parent computes via VIDEO_WINDOW_*).
   *  Outside the window we render just the black <article> snap
   *  target — no decoder, no buffer, no audio context. Keeps
   *  concurrent <video> count down so iOS Safari doesn't choke
   *  during long scroll sessions. */
  mountVideo: boolean;
  onEnter: () => void;
  onTapVideo: () => void;
}) {
  const articleRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isActive = index === activeIndex;
  // Preload strategy — three tiers:
  //   • active and the next reel:  "auto"     — fetch the whole file
  //   • prior reel + 2 reels out:  "metadata" — fetch headers only
  //                                              so the file handle
  //                                              is warm if the user
  //                                              scrolls back, and
  //                                              the duration is
  //                                              known up front
  //   • everything else:           "metadata" — same; the browser
  //                                              still pulls only
  //                                              ~10s of header
  //                                              bytes
  // Earlier `"none"` for off-screen reels meant the browser threw
  // away even the file handle, so coming back to a reel required a
  // cold network fetch. With "metadata" the disk cache handles the
  // re-entry instantly.
  const preload =
    index === activeIndex || index === activeIndex + 1 ? "auto" : "metadata";

  // Sync up which reel is in view via IntersectionObserver. The
  // ≥60% threshold matches the moment the reel snaps into place.
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            onEnter();
          }
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onEnter]);

  // Play/pause on active toggle — buffer stays mounted across
  // scroll-away. The earlier version detached and reattached the
  // src on every off-screen, which forced a cold network fetch
  // when the user scrolled back. With the src left in place the
  // browser keeps the decoded-frame buffer (small) and we trade
  // a little memory for instant re-entry to any reel.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive && !forcePause) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* not seekable yet */
      }
    }
  }, [isActive, forcePause, reel.video]);

  // Reflect the page-level `muted` flag onto the actual <video>
  // element imperatively. React's `muted` prop only writes the
  // attribute on initial mount; subsequent renders don't update the
  // DOM property reliably (a long-standing React quirk). Setting
  // .muted directly is the only way to get audio to start when the
  // user taps the sound toggle. Also kick play() again — if the
  // browser had this reel paused waiting for a gesture, unmuting via
  // a user tap counts as activation and the playback resumes with
  // audio.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (isActive && !muted && !forcePause) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [muted, isActive, forcePause]);

  return (
    <article
      ref={articleRef}
      className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
    >
      {/* Video only mounts when this article is within the active
          window (mountVideo prop, computed by the parent). When
          outside, the <article> still acts as the snap target with
          its black bg, but no decoder / buffer / audio is allocated
          — keeps Safari happy during long scroll sessions.

          No poster image overlay — we want the first video frame on
          screen instantly, not a static placeholder that crossfades
          out. The <video> element's own `poster` attribute is also
          intentionally omitted: the browser shows a black frame for
          the millisecond before decode catches up, which reads as a
          clean "loading into video" instead of a flash of a
          different game's still image. */}
      {mountVideo && (
      <video
        ref={videoRef}
        src={reel.video}
        autoPlay={isActive}
        // `muted` is set to the current page-level flag so the
        // initial DOM property matches (and muted-autoplay works on
        // first paint). React's `muted` prop is one-shot for
        // subsequent renders, so the useEffect above mirrors the
        // flag onto the DOM imperatively when the user toggles.
        muted={muted}
        loop
        playsInline
        // eslint-disable-next-line react/no-unknown-property
        disableRemotePlayback
        // eslint-disable-next-line react/no-unknown-property
        disablePictureInPicture
        controls={false}
        preload={preload}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none bg-black"
        // GPU-accelerated compositor layer so the page scrolls
        // without re-rasterising the frames.
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      />
      )}

      {/* Tap-anywhere-on-the-reel sound toggle. Sits above the video
          and below the fixed chrome (title / action stack), so a tap
          on the reel body toggles audio while taps on the buttons
          still hit their own handlers. */}
      <button
        type="button"
        aria-label={muted ? "Unmute video" : "Mute video"}
        onClick={onTapVideo}
        className="absolute inset-0 w-full h-full z-10 cursor-pointer"
        style={{ background: "transparent" }}
      />

      {/* Soft bottom gradient so the white title + action stack reads
          on top of the video regardless of frame brightness. Skipped
          on ad reels — there's no overlaid UI to legibility-protect,
          and the creative should fill edge-to-edge with no darkening. */}
      {!reel.ad && (
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 100%)",
          }}
          aria-hidden
        />
      )}
    </article>
  );
}

/**
 * Title + action stack — fixed over the reel feed, NOT inside each
 * article, so the UI stays put while the user flicks between reels.
 * Title content crossfades to the new reel's metadata on each
 * activeIndex change (key on the reel id).
 */
function FixedReelChrome({
  reel,
  muted,
  onToggleMute,
}: {
  reel: Reel;
  muted: boolean;
  onToggleMute: () => void;
}) {
  // Tapping the (i) action button opens the global GameDetailsSheet
  // with the active reel's full game record. Looks up via the same
  // games-catalogue helper every other tile uses, so the sheet
  // shows real provider/RTP/volatility/min-bet/preview data rather
  // than just the reel's slim metadata.
  const { openGameDetails } = useShell();
  const openInfo = () =>
    openGameDetails(getGameDetails(reel.game, reel.thumb));

  // Brand spot — render nothing on top of the video. The creative is
  // the whole experience: no studio meta, no game title, no action
  // stack, no sound toggle. Tap-to-mute on the video itself still
  // works (the transparent overlay inside <ReelArticle>), so the
  // user can silence the ad even without a visible button.
  if (reel.ad) return null;

  return (
    <>
      {/* Bottom-left meta: square game thumbnail + (game title +
          RTP subtitle). Anchored to var(--bottom-nav-h) so it sits
          the same visual distance above the bottom nav across
          browser and PWA standalone modes.
          Keyed on reel.id so React unmounts/remounts the whole row
          when the active reel changes — gives the crossfade between
          metadata sets for free. */}
      <div
        className="fixed left-0 px-[18px] z-30 flex items-center gap-[12px] text-white pointer-events-none"
        style={{
          left: "var(--frame-right-offset)",
          right: "calc(var(--frame-right-offset) + 88px)",
          bottom: "calc(var(--bottom-nav-h) + 32px)",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        key={reel.id}
      >
        {/* Square 48px game thumbnail with rounded corners + soft
            shadow so it pops off the video frame regardless of the
            scene's lightness. */}
        <span
          className="block shrink-0 size-[48px] rounded-[10px] overflow-hidden"
          style={{
            boxShadow: "0 4px 14px -4px rgba(0, 0, 0, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={reel.thumb}
            alt=""
            draggable={false}
            className="size-full object-cover"
          />
        </span>
        <div className="flex min-w-0 flex-col">
          <h2 className="text-[20px] font-extrabold leading-tight truncate">
            {reel.game}
          </h2>
          <p
            className="text-[13px] font-bold leading-tight opacity-90"
            style={{ letterSpacing: 0.1 }}
          >
            RTP {reel.rtp}
          </p>
        </div>
      </div>

      {/* Right-edge action stack — Sound / Info / Play (primary).
          The sound toggle sits at the top so it's the first thing
          the user sees in the stack — easy to reach and the obvious
          place to look when wondering "where do I turn on audio?". */}
      <div
        className="fixed z-30 flex flex-col items-center gap-[14px]"
        style={{
          right: "calc(var(--frame-right-offset) + 12px)",
          bottom: "calc(var(--bottom-nav-h) + 72px)",
        }}
      >
        <ActionButton
          aria={muted ? "Unmute video" : "Mute video"}
          onClick={onToggleMute}
        >
          {muted ? (
            <SpeakerMutedIcon className="size-[22px] text-white" />
          ) : (
            <SpeakerOnIcon className="size-[22px] text-white" />
          )}
        </ActionButton>
        <ActionButton aria="Game info" onClick={openInfo}>
          <InfoIcon className="size-[22px] text-white" />
        </ActionButton>
        <PlayButton aria={`Play ${reel.game}`}>
          <PlayIcon className="size-[22px] text-white translate-x-[2px]" />
        </PlayButton>
      </div>
    </>
  );
}

function ActionButton({
  children,
  aria,
  onClick,
}: {
  children: React.ReactNode;
  aria: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={aria}
      onClick={onClick}
      className="grid size-[46px] place-items-center rounded-full text-white active:scale-[0.9] transition-transform"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.32)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      {children}
    </button>
  );
}

function PlayButton({
  children,
  aria,
}: {
  children: React.ReactNode;
  aria: string;
}) {
  return (
    <button
      type="button"
      aria-label={aria}
      className="grid size-[56px] place-items-center rounded-full active:scale-[0.92] transition-transform"
      style={{
        backgroundColor: "var(--mrq-blue)",
        boxShadow:
          "0 10px 22px -8px rgba(10, 46, 203, 0.6), 0 2px 6px -2px rgba(10, 46, 203, 0.22)",
      }}
    >
      {children}
    </button>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M4 2.5v11l10-5.5-10-5.5Z" />
    </svg>
  );
}

function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      {/* Speaker cone */}
      <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
      {/* Sound waves */}
      <path d="M16 8.5a4 4 0 0 1 0 7" />
      <path d="M19 5.5a8 8 0 0 1 0 13" />
    </svg>
  );
}

function SpeakerMutedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      {/* Speaker cone */}
      <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
      {/* Cross-out */}
      <path d="m16 9 5 6M21 9l-5 6" />
    </svg>
  );
}
