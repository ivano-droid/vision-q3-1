"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/**
 * Live Casino rail — horizontal scroll of richer "table" cards
 * (180px wide, 5:4 cover image) used on the Explore page.
 *
 *   ┌────────────────────────┐
 *   │ [table photo]      15👤 │  ← live player-count badge (top-right)
 *   │  7  4 10 10 3 4 27      │  ← recent-results strip (roulette only;
 *   │                        │     first number ringed = latest spin)
 *   ├────────────────────────┤
 *   │ MrQ Roulette           │  ← table name
 *   │ Pragmatic Play         │  ← provider
 *   │ Min 10p                │  ← minimum bet
 *   │ ◠ Glennis              │  ← dealer pill (wheel glyph + name)
 *   └────────────────────────┘
 *
 * Inert prototype tiles — tapping logs a stub (no live-table route yet).
 */

export type LiveTable = {
  name: string;
  /** Cover photo for the table. */
  img: string;
  /** Live player count shown in the top-right badge. */
  players: number;
  provider: string;
  /** Minimum stake, already formatted (e.g. "10p", "£5"). */
  minBet: string;
  /** Dealer name — or "Auto" for the automated tables. */
  dealer: string;
  /** Recent winning numbers (roulette tables only). First entry is the
   *  latest spin and gets ringed; omit for non-roulette tables. */
  numbers?: number[];
};

const TABLES: LiveTable[] = [
  { name: "MrQ Roulette",      img: "/assets/live/popular-01.png", players: 15,   provider: "Pragmatic Play", minBet: "10p", dealer: "Glennis", numbers: [7, 4, 10, 10, 3, 4, 27] },
  { name: "MrQ Auto Roulette", img: "/assets/live/table-04.png",   players: 526,  provider: "Pragmatic Play", minBet: "10p", dealer: "Auto",    numbers: [21, 32, 20, 7, 33, 29, 23] },
  { name: "MrQ Speed Baccarat", img: "/assets/live/popular-03.png", players: 170, provider: "Pragmatic Play", minBet: "20p", dealer: "Herta" },
  { name: "Lightning Roulette", img: "/assets/live/popular-01.png", players: 1284, provider: "Evolution",     minBet: "20p", dealer: "Imogen", numbers: [12, 19, 0, 3, 26, 5, 17] },
  { name: "Blackjack VIP",     img: "/assets/live/table-02.png",   players: 42,   provider: "Evolution",      minBet: "£5",  dealer: "Marko" },
  { name: "Immersive Roulette", img: "/assets/live/table-05.png",  players: 408,  provider: "Evolution",      minBet: "20p", dealer: "Petra", numbers: [22, 18, 9, 35, 14, 2, 11] },
];

export function LiveCasinoRail() {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label="Live Casino"
      className="pt-3 pb-[18px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header row */}
      <div className="flex items-baseline justify-between px-[16px] pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue-dark)]">
          Live Casino
        </h2>
        <button
          type="button"
          className="text-[14px] font-bold text-[var(--mrq-blue)] active:opacity-70"
        >
          See all
        </button>
      </div>

      {/* Tile rail */}
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[12px] overflow-x-auto pl-[16px] pr-[16px] pb-[4px]"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {TABLES.map((t, i) => (
          <LiveTableCard key={`${t.name}-${i}`} table={t} />
        ))}
      </div>
    </motion.section>
  );
}

function LiveTableCard({ table }: { table: LiveTable }) {
  const { name, img, players, provider, minBet, dealer, numbers } = table;

  return (
    <button
      type="button"
      aria-label={`Play ${name}`}
      onClick={() => {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[LiveCasinoRail] open table →", name);
        }
      }}
      className="flex flex-col rounded-[14px] bg-white overflow-hidden text-left active:scale-[0.98] transition-transform shrink-0"
      style={{ width: 180, boxShadow: "0 6px 18px -10px rgba(10, 46, 203, 0.22)" }}
    >
      {/* Cover image + overlays */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "5 / 4", backgroundColor: "#101626" }}
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
          className="absolute top-[10px] right-[10px] inline-flex items-center gap-[4px] rounded-full bg-white pl-[8px] pr-[7px] py-[3px] text-[11px] font-extrabold text-[var(--mrq-blue-dark)]"
          style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)" }}
        >
          <span>{players}</span>
          <PersonIcon className="size-[10px]" />
        </span>

        {/* Recent-results strip — roulette tables only. */}
        {numbers && numbers.length > 0 && (
          <div className="absolute bottom-[8px] left-[8px] right-[8px] flex items-center gap-[6px]">
            {numbers.map((n, i) =>
              i === 0 ? (
                <span
                  key={i}
                  className="inline-flex items-center justify-center rounded-full bg-white text-[var(--mrq-blue-dark)] font-extrabold"
                  style={{ width: 22, height: 22, fontSize: 11 }}
                >
                  {n}
                </span>
              ) : (
                <span
                  key={i}
                  className="text-[12px] font-extrabold text-white"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                >
                  {n}
                </span>
              ),
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-[12px] pt-[10px] pb-[10px] flex flex-col gap-[2px]">
        <p className="text-[14px] font-extrabold leading-tight text-[var(--mrq-blue-dark)] truncate">
          {name}
        </p>
        <p className="text-[12px] font-bold leading-tight text-[var(--mrq-blue-dark)] opacity-70 truncate">
          {provider}
        </p>
        <p className="text-[12px] font-bold leading-tight text-[var(--mrq-blue-dark)] opacity-90 pt-[8px]">
          Min {minBet}
        </p>
        <div
          className="mt-[10px] inline-flex items-center gap-[6px] self-start rounded-full px-[8px] py-[3px]"
          style={{ backgroundColor: "rgba(10, 46, 203, 0.06)" }}
        >
          <WheelIcon className="size-[11px] text-[var(--mrq-blue)]" />
          <span className="text-[12px] font-extrabold text-[var(--mrq-blue-dark)]">
            {dealer}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------------- Icons ---------------- */

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

function WheelIcon({ className }: { className?: string }) {
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
