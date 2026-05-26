"use client";

/**
 * Discover — vertical-snap reels of game previews (TikTok / Reels style).
 *
 * Each reel is a 100dvh card that auto-plays a looped, muted preview
 * video (placeholder content for now — pulled from Google's public
 * sample bucket so we can see real motion behind the chrome). The
 * existing slot artwork doubles as the video's `poster` so the reel
 * still shows the right art before the video stream is ready.
 *
 * Layout per reel:
 *   ┌────────────────────────────┐
 *   │     [auto-playing video]   │
 *   │                            │
 *   │ Studio                ⓘ    │
 *   │ Game name             ♡    │
 *   │                       ▶︎   │ ← action stack (Info / Heart / Play)
 *   └────────────────────────────┘
 *
 * The action stack mirrors the Casino tinder-card icons (Info, Heart,
 * Play). The Play button is the primary CTA — the user previously
 * reported it getting hidden behind the bottom nav, so it now sits
 * ~150px above the safe-area inset, clear of the floating tab bar.
 *
 * Native CSS scroll-snap handles the reel pagination (no Framer
 * pager) so iOS Safari's momentum + rubber-banding feel native.
 */

type Reel = {
  id: string;
  game: string;
  studio: string;
  /** Static art shown as the video's poster (and fallback if the
   *  stream fails to load). All assets are 2:3 portrait. */
  poster: string;
  /** MP4 source. Public sample videos from Google's GTV bucket —
   *  fine for a prototype, swap for real game-preview clips later. */
  video: string;
};

const REELS: Reel[] = [
  {
    id: "1",
    game: "Buffalo Bills",
    studio: "Big Time Gaming",
    poster: "/assets/games/slot-01.png",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "2",
    game: "Tiki Tumble",
    studio: "Quickspin",
    poster: "/assets/games/slot-08.png",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: "3",
    game: "Jewel Stepper",
    studio: "Microgaming",
    poster: "/assets/games/slot-04.png",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "4",
    game: "Maze Escape",
    studio: "Hacksaw",
    poster: "/assets/games/slot-11.png",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: "5",
    game: "Dragon Hoard",
    studio: "Pragmatic",
    poster: "/assets/games/slot-13.png",
    video:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
];

export default function DiscoverPage() {
  return (
    <div
      // overscroll-contain stops vertical scroll bubbling out of the
      // reel column to the page; mandatory snap keeps each reel locked
      // to viewport once flicked.
      className="-mt-px relative h-[100dvh] overflow-y-auto overflow-x-hidden snap-y snap-mandatory overscroll-contain bg-black"
      style={{ scrollbarWidth: "none" }}
    >
      {REELS.map((reel) => (
        <Reel key={reel.id} reel={reel} />
      ))}
    </div>
  );
}

function Reel({ reel }: { reel: Reel }) {
  return (
    <article className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black">
      {/* Auto-playing background video. Muted + playsInline so iOS
          honours the autoplay attribute without prompting the user.
          object-cover crops to fill; the slot poster artwork stays
          visible until the stream catches up. */}
      <video
        src={reel.video}
        poster={reel.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />

      {/* Soft bottom gradient so the white title + action stack reads
          on top of the video regardless of frame brightness. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden
      />

      {/* Bottom-left meta: studio + game title. Lifted off the bottom
          edge enough to clear the floating bottom nav AND leave room
          for the action stack on the right. */}
      <div
        className="absolute left-0 right-[88px] px-[18px] flex flex-col gap-[4px] text-white pointer-events-none"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 120px)",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
      >
        <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] opacity-80">
          {reel.studio}
        </p>
        <h2 className="text-[22px] font-extrabold leading-tight">
          {reel.game}
        </h2>
      </div>

      {/* Right-edge action stack. Same three actions as the casino
          tinder-card (Info / Heart / Play). The Play button is the
          PRIMARY CTA — solid MrQ blue — so the user knows tapping it
          will launch the game. Bottom edge sits 150px above the
          safe-area inset, comfortably clear of the floating tab bar
          (~80px tall) with breathing room. */}
      <div
        className="absolute right-[12px] flex flex-col items-center gap-[14px]"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 150px)",
        }}
      >
        <ActionButton aria="Game info">
          <InfoIcon className="size-[22px] text-white" />
        </ActionButton>
        <ActionButton aria="Favourite game">
          <HeartIcon className="size-[22px] text-white" />
        </ActionButton>
        <PlayButton aria={`Play ${reel.game}`}>
          <PlayIcon className="size-[22px] text-white translate-x-[2px]" />
        </PlayButton>
      </div>
    </article>
  );
}

function ActionButton({
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 6.5-7 11-7 11Z" />
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
