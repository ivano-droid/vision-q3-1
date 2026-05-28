"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/**
 * "Recently played" 2-column grid — a different layout to the
 * horizontal scrolling GameRails above and below it on the home feed.
 *
 *   ┌─────────────────────┬─────────────────────┐
 *   │  [thumb] Jewel S.   │  [thumb] Tiki T.    │
 *   ├─────────────────────┼─────────────────────┤
 *   │  [thumb] Buffalo B. │  [thumb] Big Bass   │
 *   └─────────────────────┴─────────────────────┘
 *
 * Each card is a horizontal pill: small square thumbnail on the left,
 * game name on the right. Two cards per row. White card surface so the
 * grid pops against the #f5f5f5 page canvas. Matches the deal-in entry
 * pattern of the surrounding rails — title fades first, then the four
 * cards stagger in left-to-right / top-to-bottom.
 *
 * The grid is content-driven (a list of `RecentlyPlayedGame`s), so the
 * caller controls how many rows appear. Defaults to a single row of 2
 * if fewer than 4 items are passed; otherwise renders all four.
 */

export type RecentlyPlayedGame = {
  src: string;
  name: string;
  /** Optional destination for the tile. When set the card renders as
   *  a Link instead of a button. Used to drop the user into a game
   *  page (e.g. Buffalo Bills → /play/buffalo-bills). */
  href?: string;
};

export function RecentlyPlayedGrid({
  items,
  title = "Recently Played",
  seeAllLabel = "Show All",
  showSeeAll = true,
}: {
  items: RecentlyPlayedGame[];
  title?: string;
  seeAllLabel?: string;
  showSeeAll?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      className="px-[16px] py-3"
      initial={false}
      animate={reduce ? undefined : { opacity: [0, 1], y: [6, 0] }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header row — same typography as GameRail's so the page rhythm
          stays consistent. */}
      <div className="flex items-center justify-between pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">
          {title}
        </h2>
        {showSeeAll && (
          <button
            type="button"
            className="text-[14px] font-extrabold text-[var(--mrq-blue)]"
          >
            {seeAllLabel}
          </button>
        )}
      </div>

      {/* 2-column grid. `gap-x-[10px] gap-y-[10px]` keeps the rhythm
          tight without crowding the cards. */}
      <div className="grid grid-cols-2 gap-[10px]">
        {items.map((item, i) => (
          <RecentlyPlayedCard key={`${item.src}-${i}`} game={item} />
        ))}
      </div>
    </motion.section>
  );
}

function RecentlyPlayedCard({ game }: { game: RecentlyPlayedGame }) {
  // Subtle elevation so each tile reads as a distinct surface above
  // the page canvas, matching the small card shadow the existing
  // rails use under their tiles.
  const cardClasses =
    "flex items-center gap-[10px] rounded-[14px] bg-white pl-[6px] pr-[12px] py-[6px] text-left active:scale-[0.985] transition-transform";
  const cardStyle = {
    boxShadow: "0 2px 8px -4px rgba(10, 46, 203, 0.16)",
  } as const;
  const inner = (
    <>
      <span
        className="relative size-[52px] shrink-0 overflow-hidden rounded-[10px]"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(10, 46, 203, 0.05)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold leading-tight text-[var(--mrq-blue-dark)]">
        {game.name}
      </span>
    </>
  );

  // Tiles with an href become real navigation Links so the prototype
  // can drop into game pages. Tiles without one stay inert buttons
  // for the games that haven't been built out yet.
  if (game.href) {
    return (
      <Link
        href={game.href}
        aria-label={`Play ${game.name}`}
        className={cardClasses}
        style={cardStyle}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Play ${game.name}`}
      className={cardClasses}
      style={cardStyle}
    >
      {inner}
    </button>
  );
}
