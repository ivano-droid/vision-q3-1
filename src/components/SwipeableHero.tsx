"use client";

import {
  animate,
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Tinder-style swipeable hero card.
 *
 * Card is full mobile-frame width (minus a 16px gutter each side) so
 * the artwork dominates. The card surface carries:
 *
 *   • Full-bleed game artwork (object-cover)
 *   • Yellow "exclusive" sticker top-left (optional)
 *   • Two stacked action buttons on the right edge:
 *       — Info  (toggles the expanded details overlay)
 *       — Play  (launches the game — stub)
 *   • Title + RTP block at the bottom-left (or the full details list
 *     while the info overlay is open)
 *
 * Info overlay:
 *   Tapping the "i" button blurs the artwork, swaps the title-only
 *   text block for the full game-details list (RTP, Volatility, Max
 *   win, Min/max bet, Game type, Provider) and replaces the info
 *   icon with an "X" close icon. Drag is disabled while the overlay
 *   is open so reading details doesn't accidentally fire a swipe.
 *
 * Swipe hint:
 *   The very first card to mount runs a subtle wobble (~30px right
 *   → ~20px left → settle) after a short delay, so the user can
 *   see the deck is interactive. Honours prefers-reduced-motion via
 *   the SHIP_HINT_ENABLED flag below — only the very first mount
 *   does it (subsequent swipes don't repeat the hint).
 *
 * Drag physics:
 *   • Tap (no drag)        → open game (stub: console.log)
 *   • Drag past +100px     → "play" (advance deck for now)
 *   • Drag past -100px     → "skip" (advance deck)
 *   • Action buttons use onPointerDownCapture + stopPropagation so
 *     they don't kick off a drag-or-tap on the parent motion.div.
 *
 * Snap-back spring on cancel is softer (stiffness 300, damping 38)
 * so the card settles gracefully when the user releases under the
 * threshold.
 */

export type HeroGame = {
  src: string;
  alt: string;
  title: string;
  rtp: string;
  /** Yellow "Exclusive" sticker top-left of the artwork. */
  exclusive?: boolean;
  /** Optional destination — when set, tapping the card OR the play
   *  button drops the user into that route (e.g. the Buffalo Bills
   *  hero links to /play/buffalo-bills). Cards without an href stay
   *  on the stub console.log behaviour. */
  href?: string;
  /** Optional metadata surfaced by the info overlay. Falls back to
   *  sensible defaults when omitted so old data still renders. */
  volatility?: string;
  maxWin?: string;
  betRange?: string;
  gameType?: string;
  provider?: string;
};

const SWIPE_THRESHOLD = 100;
// Bigger than the card width so the card flies fully off-screen before
// the next one swaps in.
const SWIPE_EXIT_DISTANCE = 700;

export function SwipeableHero({ games }: { games: HeroGame[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const current = games[index % games.length];
  const next = games[(index + 1) % games.length];

  // Tap-to-open behaviour: when the active card has an `href`, route
  // there; otherwise stay on the stub console.log for cards that
  // haven't been wired to game pages yet.
  const openCurrent = () => {
    if (current.href) {
      router.push(current.href);
      return;
    }
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.log("[SwipeableHero] open game →", current.title);
    }
  };

  // Shared MotionValue. SwipeCard binds its drag to this; kept at the
  // parent so future siblings (e.g. progress dots) could read it.
  const x = useMotionValue(0);

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
          drag transform starts cleanly at the centre. The very first
          card (index 0) gets a one-shot swipe-hint wobble. */}
      <SwipeCard
        key={`top-${index}`}
        x={x}
        game={current}
        isFirst={index === 0}
        onSwiped={() => setIndex((i) => i + 1)}
        onTap={openCurrent}
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
      {/* Peek card never shows the expanded info overlay — it's
          decorative, so we pass infoOpen=false unconditionally. */}
      <CardSurface game={game} infoOpen={false} />
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
  isFirst,
  onSwiped,
  onTap,
}: {
  game: HeroGame;
  x: MotionValue<number>;
  isFirst: boolean;
  onSwiped: () => void;
  onTap: () => void;
}) {
  const router = useRouter();
  const [infoOpen, setInfoOpen] = useState(false);
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const opacity = useTransform(x, [-300, -50, 0, 50, 300], [0.5, 1, 1, 1, 0.5]);

  // Reset x to 0 whenever a fresh card mounts (post-swipe). Without
  // this the new card would inherit the previous card's exit position.
  useEffect(() => {
    x.set(0);
  }, [x]);

  // First-mount swipe hint — a one-shot wobble (~600ms after mount) so
  // the user knows the card is draggable. Only fires on the very first
  // card; subsequent swipes don't repeat the hint since the user has
  // already engaged with the gesture.
  useEffect(() => {
    if (!isFirst) return;
    // Respect prefers-reduced-motion — skip the hint entirely.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const t = window.setTimeout(() => {
      // Sequence: right 30px → left 20px → centre. Soft ease so it
      // reads as a hint rather than an animation.
      animate(x, [0, 30, -20, 0], {
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.35, 0.7, 1],
      });
    }, 650);
    return () => window.clearTimeout(t);
  }, [isFirst, x]);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      // Drag is locked while the info overlay is open — reading
      // details shouldn't trigger an accidental swipe. Closing the
      // overlay re-enables drag instantly.
      drag={infoOpen ? false : "x"}
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
          // previous 420 / 32 — feels more elastic.
          animate(x, 0, { type: "spring", stiffness: 300, damping: 38 });
        }
      }}
    >
      <CardSurface
        game={game}
        infoOpen={infoOpen}
        onToggleInfo={() => setInfoOpen((open) => !open)}
        onPlay={() => {
          // Play button shares the card's destination — same route
          // as a card tap, just from a more deliberate target.
          if (game.href) {
            router.push(game.href);
            return;
          }
          if (typeof window !== "undefined") {
            // eslint-disable-next-line no-console
            console.log("[SwipeableHero] play →", game.title);
          }
        }}
      />
    </motion.div>
  );
}

function CardSurface({
  game,
  infoOpen,
  onToggleInfo,
  onPlay,
}: {
  game: HeroGame;
  infoOpen: boolean;
  onToggleInfo?: () => void;
  onPlay?: () => void;
}) {
  const interactive = !!onToggleInfo;

  // Detail rows displayed inside the info overlay. The labels are
  // fixed; values come from the HeroGame or sensible defaults so
  // older data without these fields still renders.
  const detailRows: Array<[string, string]> = [
    ["RTP", game.rtp],
    ["Volatility", game.volatility ?? "Medium"],
    ["Max win", game.maxWin ?? "5,000x"],
    ["Min/max bet", game.betRange ?? "£0.10–£100"],
    ["Game type", game.gameType ?? "Slot"],
    ["Provider", game.provider ?? "Example Studios"],
  ];

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[18px]"
      style={{
        // Softer than before — the previous two-layer brand-blue
        // shadow felt too heavy under the artwork. Single lighter
        // layer (0.4 → 0.22 alpha) lifts the card off the page
        // without dominating it.
        boxShadow: "0 10px 24px -14px rgba(10, 46, 203, 0.22)",
      }}
    >
      {/* Artwork. Blurred + dimmed when the info overlay is open so
          the long-form text reads clearly against it. The transition
          on filter+brightness gives a buttery "frosted glass" feel. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={game.src}
        alt={game.alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        style={{
          filter: infoOpen ? "blur(10px) brightness(0.6)" : "none",
          transform: infoOpen ? "scale(1.06)" : "scale(1)", // hide blur edges
          transition: "filter 220ms ease, transform 220ms ease",
        }}
      />

      {/* Yellow "exclusive" burst sticker top-left. Hidden while the
          info overlay is open so it doesn't conflict with the text. */}
      {game.exclusive && !infoOpen && (
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

      {/* Action button stack on the right edge.
          When `interactive` is false (peek card) the stack is decorative
          (pointer-events: none) — taps fall through to the parent.
          When `interactive` is true (front card) each button captures
          its own pointer events so the toggle / play actions fire
          without triggering a drag or a card-level tap. */}
      <div
        className="absolute bottom-[16px] right-[14px] flex flex-col items-center gap-[10px]"
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      >
        <ActionButton
          aria-label={infoOpen ? "Close game info" : "Open game info"}
          variant="info"
          interactive={interactive}
          onClick={onToggleInfo}
        >
          {infoOpen ? (
            <CloseIcon className="size-[16px] text-white" />
          ) : (
            <InfoIcon className="size-[18px] text-white" />
          )}
        </ActionButton>
        <ActionButton
          aria-label={`Play ${game.title}`}
          variant="play"
          interactive={interactive}
          onClick={onPlay}
        >
          <PlayIcon className="size-[20px] text-white translate-x-[1px]" />
        </ActionButton>
      </div>

      {/* Bottom-left text block — title only when collapsed, full
          details list when the info overlay is open. AnimatePresence
          gives both states a smooth opacity/translate crossfade. */}
      <div
        className="absolute bottom-[16px] left-[16px] text-white pointer-events-none"
        style={{
          right: 80, // keep clear of the action stack
          textShadow: infoOpen
            ? "0 1px 4px rgba(0, 0, 0, 0.45)"
            : "0 2px 8px rgba(0, 0, 0, 0.55)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {infoOpen ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3
                className="text-[20px] font-extrabold leading-tight"
                style={{ marginBottom: 8 }}
              >
                {game.title}
              </h3>
              <ul
                className="flex flex-col"
                style={{ gap: 4 }}
              >
                {detailRows.map(([label, value]) => (
                  <li
                    key={label}
                    className="text-[15px] font-bold leading-snug"
                  >
                    {label}: {value}
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="title-only"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-[2px]"
            >
              <h3 className="text-[20px] font-extrabold leading-tight">
                {game.title}
              </h3>
              <p className="text-[13px] font-extrabold opacity-95">
                RTP: {game.rtp}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================
   Action button — single component for both Info and Play.
   Renders a real <button> when interactive (front card) or a
   non-interactive <span> when decorative (peek card).
   ============================================================ */
function ActionButton({
  variant,
  interactive,
  children,
  onClick,
  ...rest
}: {
  variant: "info" | "play";
  interactive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
} & React.HTMLAttributes<HTMLElement>) {
  // Sizing + colour by variant.
  const size = variant === "play" ? 48 : 40;
  const style: React.CSSProperties =
    variant === "play"
      ? {
          width: size,
          height: size,
          backgroundColor: "var(--mrq-blue)",
          boxShadow:
            "0 8px 18px -6px rgba(10, 46, 203, 0.55), 0 2px 6px -2px rgba(10, 46, 203, 0.22)",
        }
      : {
          width: size,
          height: size,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.22)",
        };

  if (!interactive) {
    return (
      <span
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
        className="grid place-items-center rounded-full pointer-events-none"
        style={style}
      >
        {children}
      </span>
    );
  }

  // Real button on the front card. We stop pointer events from
  // bubbling up to the parent motion.div so the swipe drag and
  // onTap handlers don't fire when the user taps a button.
  return (
    <button
      type="button"
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="grid place-items-center rounded-full active:scale-[0.94] transition-transform"
      style={style}
    >
      {children}
    </button>
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
