"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/**
 * Live Casino rail — square 109×109 lobby tiles (same footprint as the
 * editorial / Bingo rails) with a live player-count badge overlaid in
 * the top-right corner. Used on the Explore page.
 *
 *   ┌────────────┐
 *   │       15 👤 │  ← live player-count badge
 *   │ [table art]│
 *   └────────────┘
 *
 * Inert prototype tiles — tapping logs a stub (no live-table route yet).
 */

export type LiveTable = {
  name: string;
  /** Cover photo for the table. */
  img: string;
  /** Live player count shown in the top-right badge. */
  players: number;
};

// Default table set used by the Explore "Live Casino" rail.
const DEFAULT_TABLES: LiveTable[] = [
  { name: "MrQ Roulette",       img: "/assets/live/popular-01.png", players: 15 },
  { name: "MrQ Auto Roulette",  img: "/assets/live/table-04.png",   players: 526 },
  { name: "MrQ Speed Baccarat", img: "/assets/live/popular-03.png", players: 170 },
  { name: "Lightning Roulette", img: "/assets/live/popular-01.png", players: 1284 },
  { name: "Blackjack VIP",      img: "/assets/live/table-02.png",   players: 42 },
  { name: "Immersive Roulette", img: "/assets/live/table-05.png",   players: 408 },
];

// "Continue Playing Live Casino" set — the lobby variant (Home tab),
// ordered as the user's recent live tables.
export const CONTINUE_PLAYING_TABLES: LiveTable[] = [
  { name: "Lightning Roulette",   img: "/assets/live/popular-01.png", players: 1284 },
  { name: "Crazy Time",           img: "/assets/live/popular-02.png", players: 12837 },
  { name: "Blackjack VIP",        img: "/assets/live/table-02.png",   players: 42 },
  { name: "MrQ Speed Baccarat",   img: "/assets/live/popular-03.png", players: 170 },
  { name: "Treasure Island Live", img: "/assets/live/popular-04.png", players: 896 },
  { name: "Immersive Roulette",   img: "/assets/live/table-05.png",   players: 408 },
];

export function LiveCasinoRail({
  title = "Live Casino",
  tables = DEFAULT_TABLES,
  showSeeAll = true,
}: {
  title?: string;
  tables?: LiveTable[];
  showSeeAll?: boolean;
} = {}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      className="pt-[8px] pb-[10px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header row */}
      <div className="flex items-baseline justify-between px-[16px] pb-[10px]">
        <h2
          data-component="Typography"
          className="text-[18px] font-extrabold text-[var(--mrq-blue)]"
        >
          {title}
        </h2>
        {showSeeAll && (
          <button
            data-component="Button"
            type="button"
            className="text-[14px] font-bold text-[var(--mrq-blue)] active:opacity-70"
          >
            <span data-component="Typography">See all</span>
          </button>
        )}
      </div>

      {/* Tile rail */}
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[8px] overflow-x-auto pl-[16px] pr-[16px] pb-[4px]"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {tables.map((t, i) => (
          <LiveTableTile key={`${t.name}-${i}`} table={t} />
        ))}
      </div>
    </motion.section>
  );
}

function LiveTableTile({ table }: { table: LiveTable }) {
  const { name, img, players } = table;

  return (
    <button
      data-component="Card"
      type="button"
      aria-label={`Play ${name}`}
      onClick={() => {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[LiveCasinoRail] open table →", name);
        }
      }}
      className="relative shrink-0 overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform"
      style={{
        width: 109,
        height: 109,
        boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.2)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />

      {/* Live player-count badge */}
      <span
        data-component="Badge"
        className="absolute top-[8px] right-[8px] inline-flex items-center gap-[4px] rounded-full bg-white pl-[8px] pr-[8px] py-[2px] text-[10px] font-extrabold text-[var(--mrq-blue-dark)]"
        style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)" }}
      >
        <span data-component="Typography" className="text-[12px]">{players}</span>
        <PersonIcon className="size-[16px]" />
      </span>
    </button>
  );
}

/* ---------------- Icons ---------------- */

function PersonIcon({ className }: { className?: string }) {
  // User glyph — Figma 2525:54574. Inherits the badge colour via
  // currentColor.
  return (
    <svg
      data-component="Icon"
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M8.25 4.125C8.25 5.36764 7.24264 6.375 6 6.375C4.75736 6.375 3.75 5.36764 3.75 4.125C3.75 2.88236 4.75736 1.875 6 1.875C7.24264 1.875 8.25 2.88236 8.25 4.125Z" />
      <path d="M8.96745 10.125H3.03255C2.73843 10.125 2.5 9.88657 2.5 9.59245V9.27639C2.5 8.85165 2.62572 8.43642 2.86132 8.08301C3.26033 7.4845 3.93206 7.125 4.65139 7.125H7.34861C8.06793 7.125 8.73967 7.4845 9.13867 8.08301C9.37428 8.43642 9.5 8.85165 9.5 9.27639V9.59245C9.5 9.88657 9.26157 10.125 8.96745 10.125Z" />
    </svg>
  );
}
