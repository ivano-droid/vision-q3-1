"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  },
  {
    id: "v2",
    game: "Tiki Tumble",
    studio: "Quickspin",
    video: "/assets/videos/video2.mp4",
  },
  {
    id: "v3",
    game: "Jewel Stepper",
    studio: "Microgaming",
    video: "/assets/videos/video3.mp4",
  },
  {
    id: "v4",
    game: "Maze Escape",
    studio: "Hacksaw Gaming",
    video: "/assets/videos/video4.mp4",
  },
];

// How many reels to render in the very first batch. Each loop is
// a full pass of the source clips, so this is a *count of loops*
// not articles. Kept at 1 so the initial DOM has only ~5 <video>
// elements — browsers cap concurrent media requests around 6-8,
// and mounting 15 on first paint made some videos never finish
// loading because they got starved out.
const INITIAL_LOOPS = 1;
// When the active reel is within this many of the rendered end,
// extend the feed by another loop. One-ahead is enough because we
// keep prior reels mounted (with their buffers warm), so the
// IntersectionObserver always has the next article ready by the
// time the user reaches it.
const PREFETCH_AHEAD = 1;

export default function DiscoverPage() {
  // Each "loop" is a full pass of REELS (3 source clips). Bumping
  // `loops` appends another full pass to the rendered feed, giving
  // the user an effectively infinite scroll — REELS[0] → REELS[2]
  // → REELS[0] → REELS[2] → ... — without ever ending.
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
  // currently rendered feed.
  useEffect(() => {
    if (activeIndex >= reels.length - PREFETCH_AHEAD) {
      setLoops((n) => n + 1);
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
        {reels.map((reel, i) => (
          <ReelArticle
            key={reel.key}
            reel={reel}
            index={i}
            activeIndex={activeIndex}
            muted={muted}
            onEnter={() => setActiveIndex(i)}
            onTapVideo={() => setMuted((m) => !m)}
          />
        ))}
      </div>

      {/* Fixed UI — title (bottom-left) + action stack (bottom-right).
          Sit OUTSIDE the per-reel <article> so they stay anchored on
          screen while the reels scroll past behind them. Width
          clamped to the mobile-frame's column via the same
          --frame-right-offset CSS var the rest of the app uses, so
          on desktop the UI sits over the 375px column instead of
          the whole monitor. */}
      <FixedReelChrome
        reel={active}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
    </div>
  );
}

function ReelArticle({
  reel,
  index,
  activeIndex,
  muted,
  onEnter,
  onTapVideo,
}: {
  reel: Reel;
  index: number;
  activeIndex: number;
  muted: boolean;
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
    if (isActive) {
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
  }, [isActive, reel.video]);

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
    if (isActive && !muted) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [muted, isActive]);

  return (
    <article
      ref={articleRef}
      className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
    >
      {/* Just the video. No poster image overlay — we want the first
          video frame on screen instantly, not a static placeholder
          that crossfades out. The <video> element's own `poster`
          attribute is also intentionally omitted: the browser shows
          a black frame for the millisecond before decode catches up,
          which reads as a clean "loading into video" instead of a
          flash of a different game's still image. */}
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
  // Brand spot — render nothing on top of the video. The creative is
  // the whole experience: no studio meta, no game title, no action
  // stack, no sound toggle. Tap-to-mute on the video itself still
  // works (the transparent overlay inside <ReelArticle>), so the
  // user can silence the ad even without a visible button.
  if (reel.ad) return null;

  return (
    <>
      {/* Bottom-left meta: studio + game title.
          Anchored to var(--bottom-nav-h) so it sits the same visual
          distance above the bottom nav across browser mode and PWA
          standalone mode. */}
      <div
        className="fixed left-0 px-[18px] z-30 flex flex-col gap-[4px] text-white pointer-events-none"
        style={{
          left: "var(--frame-right-offset)",
          right: "calc(var(--frame-right-offset) + 88px)",
          bottom: "calc(var(--bottom-nav-h) + 32px)",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        key={reel.id}
      >
        <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] opacity-80">
          {reel.studio}
        </p>
        <h2 className="text-[22px] font-extrabold leading-tight">
          {reel.game}
        </h2>
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
        <ActionButton aria="Game info">
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
