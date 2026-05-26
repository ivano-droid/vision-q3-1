"use client";

import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Tinder-style swipeable hero card.
 *
 * Card is full mobile-frame width (minus a 16px gutter each side) so
 * the artwork dominates. The card surface carries:
 *
 *   • Full-bleed game artwork (object-cover)
 *   • Yellow "exclusive" sticker top-left (optional)
 *   • Decorative Info / Heart / Play action icons stacked on the right
 *     — pointer-events:none so they DON'T interfere with the drag;
 *     they're visual affordances, not buttons
 *   • Title + RTP block at the bottom-left
 *   • LIKE / NOPE stamps that appear during drag (Tinder style)
 *
 * Interactions:
 *   • Tap (no drag)        → open game (stub: console.log)
 *   • Drag past +100px     → "play" (advance deck for now)
 *   • Drag past -100px     → "skip" (advance deck)
 *
 * Implementation notes:
 *   • The drag MotionValue lives at the SwipeableHero level so the
 *     stamps inside the card can read it without prop-drilling through
 *     CardSurface — affordance opacity is computed once at the parent
 *     and passed in.
 *   • CardSurface internals are `pointer-events: none` everywhere
 *     except the motion.div itself, so the drag captures every touch
 *     on the card. The Info/Heart/Play icons are visual only.
 *   • The discoverability "pulse" on first mount is now ~2.5s (was
 *     1.6s) so the user has more time to register the affordances.
 *     `Math.max`-combined with the drag-tied opacity so dragging
 *     immediately overrides the pulse.
 *   • Snap-back spring on cancel is softer (stiffness 300, damping 38)
 *     so the stamps fade out more gracefully when the user releases
 *     under the threshold.
 */

export type HeroGame = {
  src: string;
  alt: string;
  title: string;
  rtp: string;
  /** Yellow "Exclusive" sticker top-left of the artwork. */
  exclusive?: boolean;
};

const SWIPE_THRESHOLD = 100;
// Bigger than the card width so the card flies fully off-screen before
// the next one swaps in.
const SWIPE_EXIT_DISTANCE = 700;

export function SwipeableHero({ games }: { games: HeroGame[] }) {
  const [index, setIndex] = useState(0);
  const current = games[index % games.length];
  const next = games[(index + 1) % games.length];

  // Shared MotionValue. SwipeCard binds its drag to this; the stamps
  // inside the card surface read from it via useTransform.
  const x = useMotionValue(0);

  // Drag-tied opacities for the LIKE/NOPE stamps on the card. Hit full
  // opacity right at the commit threshold so the stamp = clean promise
  // of what's about to happen on release.
  const playOpacityFromDrag = useTransform(x, [10, 100], [0, 1]);
  const nopeOpacityFromDrag = useTransform(x, [-100, -10], [1, 0]);

  // One-off discoverability pulse — only fires for the very first
  // card on mount. Both stamps fade in to ~40% over 2.5s so the user
  // has plenty of time to see "you can swipe left or right".
  const hintOpacity = useMotionValue(0);
  useEffect(() => {
    if (index !== 0) return;
    const controls = animate(hintOpacity, [0, 0.4, 0.4, 0], {
      duration: 2.5,
      times: [0, 0.15, 0.78, 1],
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [index, hintOpacity]);

  const playOpacity = useTransform(
    [playOpacityFromDrag, hintOpacity],
    ([drag, hint]) => Math.max(drag as number, hint as number),
  );
  const nopeOpacity = useTransform(
    [nopeOpacityFromDrag, hintOpacity],
    ([drag, hint]) => Math.max(drag as number, hint as number),
  );

  return (
    <div
      className="relative w-full"
      style={{
        // 5:4 — landscape but slightly taller than the previous 4:3
        // (per design feedback: "aspect ratio is good, could be a
        // little taller"). On a 375px viewport the card is ~343 × 274.
        aspectRatio: "5 / 4",
        // Full mobile-frame width with a 16px gutter each side, so the
        // card reads as full-bleed without touching the screen edge.
        maxWidth: "calc(100% - 32px)",
        margin: "0 auto",
      }}
    >
      {/* Underlay: the NEXT card peeking from behind. Dimmer + heavier
          scrim so it sits firmly behind the front card. */}
      <NextCardPreview key={`peek-${index}`} game={next} />

      {/* Front: active draggable card. Remounted on every swipe so its
          drag transform starts cleanly at the centre. */}
      <SwipeCard
        key={`top-${index}`}
        x={x}
        game={current}
        playOpacity={playOpacity}
        nopeOpacity={nopeOpacity}
        onSwiped={() => setIndex((i) => i + 1)}
        onTap={() => {
          if (typeof window !== "undefined") {
            // eslint-disable-next-line no-console
            console.log("[SwipeableHero] open game →", current.title);
          }
        }}
      />
    </div>
  );
}

/** The peek behind the active card. */
function NextCardPreview({ game }: { game: HeroGame }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      // Spring in slightly compressed.
      initial={{ scale: 0.94, y: 14, opacity: 0.45 }}
      // Resting peek: ~14px protrudes below the front card. Lower
      // opacity + heavier scrim so the back card reads firmly as
      // "behind" and doesn't compete with the front.
      animate={{ scale: 0.96, y: 14, opacity: 0.65 }}
      transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
      aria-hidden
    >
      <CardSurface game={game} />
      <div
        className="absolute inset-0 rounded-[18px] pointer-events-none"
        style={{ backgroundColor: "rgba(245, 245, 245, 0.5)" }}
      />
    </motion.div>
  );
}

function SwipeCard({
  game,
  x,
  playOpacity,
  nopeOpacity,
  onSwiped,
  onTap,
}: {
  game: HeroGame;
  x: MotionValue<number>;
  playOpacity: MotionValue<number>;
  nopeOpacity: MotionValue<number>;
  onSwiped: () => void;
  onTap: () => void;
}) {
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const opacity = useTransform(x, [-300, -50, 0, 50, 300], [0.5, 1, 1, 1, 0.5]);

  // Reset x to 0 whenever a fresh card mounts (post-swipe). Without
  // this the new card would inherit the previous card's exit position.
  useEffect(() => {
    x.set(0);
  }, [x]);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragElastic={0.7}
      dragMomentum={false}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      }}
      // onTap fires only on release WITHOUT crossing the drag
      // threshold. A real swipe is captured by onDragEnd below and
      // never accidentally fires tap-to-open.
      onTap={onTap}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
          const direction = info.offset.x > 0 ? 1 : -1;
          animate(x, direction * SWIPE_EXIT_DISTANCE, {
            duration: 0.32,
            ease: [0.22, 1, 0.36, 1],
            onComplete: onSwiped,
          });
        } else {
          // Snap back to centre. Softer spring (300 / 38) than the
          // previous 420 / 32 — feels more elastic and means the
          // stamps fade out a touch more gracefully.
          animate(x, 0, { type: "spring", stiffness: 300, damping: 38 });
        }
      }}
    >
      <CardSurface game={game} />

      {/* LIKE / NOPE stamps overlaid on the card. Tinder style: tilted,
          chunky outlined badges that pop in as the user drags. They
          rotate with the card (because they're children of the drag
          layer), reinforcing the "stamp on a moving card" effect. */}
      <Stamp side="left" opacity={nopeOpacity} ringColor="#ff4259">
        <CrossIcon className="size-[36px] text-[#ff4259]" />
      </Stamp>
      <Stamp side="right" opacity={playOpacity} ringColor="var(--mrq-blue)">
        <PlayIcon className="size-[34px] text-mrq-blue translate-x-[3px]" />
      </Stamp>
    </motion.div>
  );
}

function Stamp({
  side,
  opacity,
  ringColor,
  children,
}: {
  side: "left" | "right";
  opacity: MotionValue<number>;
  ringColor: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      aria-hidden
      className="absolute top-[20px] grid place-items-center pointer-events-none"
      style={{
        [side]: "20px",
        width: "80px",
        height: "80px",
        borderRadius: "9999px",
        backgroundColor: "rgba(255, 255, 255, 0.94)",
        border: `3px solid ${ringColor}`,
        boxShadow: "0 10px 24px -10px rgba(0, 0, 0, 0.35)",
        rotate: side === "left" ? "-14deg" : "14deg",
        opacity,
      }}
    >
      {children}
    </motion.div>
  );
}

function CardSurface({ game }: { game: HeroGame }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[18px]"
      style={{
        boxShadow:
          "0 14px 32px -16px rgba(10, 46, 203, 0.4), 0 2px 6px -2px rgba(10, 46, 203, 0.18)",
      }}
    >
      {/* Artwork. pointer-events:none so the parent motion.div gets
          every touch/click for dragging + tapping. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={game.src}
        alt={game.alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
      />

      {/* Yellow "exclusive" burst sticker top-left. */}
      {game.exclusive && (
        <div
          className="absolute left-[14px] top-[14px] grid place-items-center text-mrq-blue-dark pointer-events-none"
          style={{
            width: "68px",
            height: "68px",
            backgroundColor: "#ffd400",
            clipPath: generateStarClip(12, 0.5, 0.85),
            transform: "rotate(-8deg)",
            border: "2px solid #ffffff",
            boxShadow: "0 4px 10px -4px rgba(10, 46, 203, 0.35)",
          }}
        >
          <span
            className="text-[13px] font-extrabold leading-none"
            style={{ letterSpacing: "0.02em" }}
          >
            exclusive
          </span>
        </div>
      )}

      {/* Decorative action icon stack on the right edge. pointer-events:
          none on the wrapper AND each child so the drag layer above
          captures every touch. They're affordances, not buttons — the
          actual actions are tap (= open), swipe-right (= play),
          swipe-left (= skip). */}
      <div
        className="absolute bottom-[16px] right-[14px] flex flex-col items-center gap-[10px] pointer-events-none"
      >
        <DecorChip>
          <InfoIcon className="size-[18px] text-white" />
        </DecorChip>
        <DecorChip>
          <HeartIcon className="size-[18px] text-white" />
        </DecorChip>
        <DecorPlayChip>
          <PlayIcon className="size-[18px] text-white translate-x-[1px]" />
        </DecorPlayChip>
      </div>

      {/* Title + RTP at the bottom. Reserves room on the right for the
          action icon stack so the title doesn't crash into it. */}
      <div
        className="absolute bottom-[16px] left-[16px] right-[80px] flex flex-col gap-[2px] text-white pointer-events-none"
        style={{ textShadow: "0 2px 8px rgba(0, 0, 0, 0.55)" }}
      >
        <h3 className="text-[20px] font-extrabold leading-tight">
          {game.title}
        </h3>
        <p className="text-[13px] font-extrabold opacity-95">
          RTP: {game.rtp}
        </p>
      </div>
    </div>
  );
}

function DecorChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="grid size-[40px] place-items-center rounded-full pointer-events-none"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.22)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.22)",
      }}
    >
      {children}
    </span>
  );
}

function DecorPlayChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="grid size-[48px] place-items-center rounded-full pointer-events-none"
      style={{
        backgroundColor: "var(--mrq-blue)",
        boxShadow:
          "0 8px 18px -6px rgba(10, 46, 203, 0.55), 0 2px 6px -2px rgba(10, 46, 203, 0.22)",
      }}
    >
      {children}
    </span>
  );
}

// Generate a star clip-path with N points and given inner/outer radii
// in normalized 0..1 (centre at 50,50).
function generateStarClip(points: number, innerR: number, outerR: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const xv = 50 + Math.cos(a) * r * 50;
    const yv = 50 + Math.sin(a) * r * 50;
    pts.push(`${xv.toFixed(2)}% ${yv.toFixed(2)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

/* ----------- Inline icons ----------- */

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="m6 6 12 12M18 6 6 18" />
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
      strokeWidth="2.4"
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
