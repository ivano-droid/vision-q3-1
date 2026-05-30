"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/**
 * Live Casino game rail.
 *
 * Cards are richer than the Casino square tiles — each one carries:
 *   • Hero artwork with the game branding baked in
 *   • Top-right player-count badge (live concurrency)
 *   • Optional bottom-left spin-history overlay (Roulette tables only)
 *   • Title + provider line
 *   • Minimum bet
 *   • Dealer chip (broadcast icon + name) — Auto- dealers show
 *     "Auto" rather than a person name
 *
 * The rail is a horizontal scroller (no scrollbar) of ~180px-wide
 * cards. Two cards + a peek of a third fit a 375px viewport so the
 * user knows there's more to scroll.
 */

export type LiveGame = {
  name: string;
  provider: string;
  /** Hero image filling the top of the card. */
  src: string;
  /** Min-bet display, e.g. "10p", "20p", "£1". */
  minBet: string;
  /** Live dealer name, or "Auto" for non-dealer auto-tables. */
  dealer: string;
  /** Live concurrent-player count, shown in the top-right badge. */
  players: number;
  /** Last few spin results (Roulette tables only). Drawn as small
   *  numbered chips along the bottom edge of the hero image. */
  recentResults?: number[];
  href?: string;
};

export function LiveGameRail({
  title,
  games,
  onSeeAll,
}: {
  title: string;
  games: LiveGame[];
  onSeeAll?: () => void;
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      className="pt-3 pb-[18px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-baseline justify-between px-[16px] pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue-dark)]">
          {title}
        </h2>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[14px] font-bold text-[var(--mrq-blue)] active:opacity-70"
          >
            See all
          </button>
        )}
      </div>
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[12px] overflow-x-auto pl-[16px] pr-[16px] pb-[4px]"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {games.map((game, i) => (
          <LiveGameCard key={`${game.name}-${i}`} game={game} />
        ))}
      </div>
    </motion.section>
  );
}

/* Single rich card. Fixed 180px width so multiple are predictable
   per viewport, but the content height varies a touch with the
   optional recentResults strip. */
function LiveGameCard({ game }: { game: LiveGame }) {
  return (
    <button
      type="button"
      aria-label={`Play ${game.name}`}
      onClick={() => {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[LiveGameRail] open game →", game.name);
        }
      }}
      className="shrink-0 flex flex-col rounded-[14px] bg-white overflow-hidden text-left active:scale-[0.98] transition-transform"
      style={{
        width: 180,
        boxShadow: "0 6px 18px -10px rgba(10, 46, 203, 0.22)",
      }}
    >
      {/* Hero image — 5:4 aspect, baked-in branding. */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "5 / 4", backgroundColor: "#101626" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />

        {/* Player-count badge — top-right. White pill with the live
            concurrent count + a small person glyph. */}
        <span
          className="absolute top-[10px] right-[10px] inline-flex items-center gap-[4px] rounded-full bg-white pl-[8px] pr-[7px] py-[3px] text-[11px] font-extrabold text-[var(--mrq-blue-dark)]"
          style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)" }}
        >
          <span>{game.players}</span>
          <PersonIcon className="size-[10px]" />
        </span>

        {/* Spin-history overlay — Roulette tables only. Sits along
            the bottom of the hero image with the latest result on
            the left (in a numbered circle) followed by the previous
            results trailing right. */}
        {game.recentResults && game.recentResults.length > 0 && (
          <div className="absolute bottom-[8px] left-[8px] right-[8px] flex items-center gap-[6px]">
            <span
              className="inline-flex items-center justify-center rounded-full bg-white text-[var(--mrq-blue-dark)] font-extrabold"
              style={{ width: 22, height: 22, fontSize: 11 }}
            >
              {game.recentResults[0]}
            </span>
            {game.recentResults.slice(1).map((n, i) => (
              <span
                key={i}
                className="text-[12px] font-extrabold text-white"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
              >
                {n}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metadata stack */}
      <div className="px-[12px] pt-[10px] pb-[10px] flex flex-col gap-[2px]">
        <p className="text-[14px] font-extrabold leading-tight text-[var(--mrq-blue-dark)] truncate">
          {game.name}
        </p>
        <p className="text-[12px] font-bold leading-tight text-[var(--mrq-blue-dark)] opacity-70 truncate">
          {game.provider}
        </p>
        <p className="text-[12px] font-bold leading-tight text-[var(--mrq-blue-dark)] opacity-90 pt-[8px]">
          Min {game.minBet}
        </p>

        {/* Dealer chip — pill with a broadcast icon + dealer name. */}
        <div
          className="mt-[10px] inline-flex items-center gap-[6px] self-start rounded-full px-[8px] py-[3px]"
          style={{ backgroundColor: "rgba(10, 46, 203, 0.06)" }}
        >
          <BroadcastIcon className="size-[11px] text-[var(--mrq-blue)]" />
          <span className="text-[12px] font-extrabold text-[var(--mrq-blue-dark)]">
            {game.dealer}
          </span>
        </div>
      </div>
    </button>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
    </svg>
  );
}

function BroadcastIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M7.5 7.5a6 6 0 0 0 0 9M16.5 7.5a6 6 0 0 1 0 9" />
    </svg>
  );
}
