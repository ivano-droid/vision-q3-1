"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useMemo } from "react";
import { useShell } from "@/lib/filter-context";

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
};

export function RecentlyPlayedGrid({
  items,
  title = "Recently played",
  seeAllLabel = "Show all",
  showSeeAll = true,
}: {
  items: RecentlyPlayedGame[];
  title?: string;
  seeAllLabel?: string;
  showSeeAll?: boolean;
}) {
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  // Staggered deal-in choreography matches the GameRail above and
  // below it — title fades quickly, then the four cards drop in.
  const titleVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 6 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.18, delay: reduce ? 0 : 0.25 },
      },
    }),
    [reduce],
  );

  const gridVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.07,
          delayChildren: reduce ? 0 : 0.35,
        },
      },
    }),
    [reduce],
  );

  const cardVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 8, scale: 0.97 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      },
    }),
    [],
  );

  return (
    <motion.section
      aria-label={title}
      className="px-[16px] py-3"
      initial={reduce ? false : "hidden"}
      animate={reduce || bootDone ? "visible" : "hidden"}
    >
      {/* Header row — same typography as GameRail's so the page rhythm
          stays consistent. */}
      <motion.div
        className="flex items-center justify-between pb-[10px]"
        variants={titleVariants}
      >
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
      </motion.div>

      {/* 2-column grid. `gap-x-[10px] gap-y-[10px]` keeps the rhythm
          tight without crowding the cards. */}
      <motion.div
        className="grid grid-cols-2 gap-[10px]"
        variants={gridVariants}
      >
        {items.map((item, i) => (
          <RecentlyPlayedCard
            key={`${item.src}-${i}`}
            game={item}
            variants={cardVariants}
          />
        ))}
      </motion.div>
    </motion.section>
  );
}

function RecentlyPlayedCard({
  game,
  variants,
}: {
  game: RecentlyPlayedGame;
  variants: Variants;
}) {
  return (
    <motion.button
      type="button"
      aria-label={`Play ${game.name}`}
      className="flex items-center gap-[10px] rounded-[14px] bg-white pl-[6px] pr-[12px] py-[6px] text-left active:scale-[0.985] transition-transform"
      style={{
        // Subtle elevation so each tile reads as a distinct surface
        // above the page canvas, matching the small card shadow the
        // existing rails use under their tiles.
        boxShadow: "0 2px 8px -4px rgba(10, 46, 203, 0.16)",
      }}
      variants={variants}
    >
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
      <span
        className="min-w-0 flex-1 truncate text-[15px] font-extrabold leading-tight text-[var(--mrq-blue-dark)]"
      >
        {game.name}
      </span>
    </motion.button>
  );
}
