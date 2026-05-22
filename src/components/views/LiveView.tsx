"use client";

import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { LiveTabs } from "./LiveTabs";

/**
 * Live casino view — modelled on vision-01.vercel.app's Live screen.
 *
 * Sections:
 *   1. Contextual-nav tab bar (Featured / New / Game shows / Blackjack /
 *      Roulette / Tables / …) — same component shape as the Casino tabs.
 *   2. "Most popular" — horizontal-scroll rail of large live table cards
 *      (264×264 source PNGs from the Vercel deploy, downscaled to 168×168).
 *      Each card shows: seat count chip, table image, game name, provider,
 *      stake / seats info, live dealer name.
 *   3. "Blackjack tables" — vertical list of smaller list-style rows. Each
 *      row: thumbnail on the left, game info in the middle, dealer name on
 *      the right.
 *
 * All assets are local — pulled from /public/assets/live/.
 */

type Table = {
  src: string;
  name: string;
  provider: string;
  minBet?: string;
  maxBet?: string;
  seats?: string;
  players?: number;
  dealer?: string;
};

const MOST_POPULAR: Table[] = [
  { src: "/assets/live/popular-01.png", name: "Monopoly Live", provider: "Evolution", players: 2955, minBet: "Min 10p", seats: "Live now" },
  { src: "/assets/live/popular-02.png", name: "Crazy Time", provider: "Evolution", players: 4120, minBet: "Min 10p", seats: "Live now" },
  { src: "/assets/live/popular-03.png", name: "Lightning Roulette", provider: "Evolution", players: 1850, minBet: "Min 20p", seats: "Live now" },
  { src: "/assets/live/popular-04.png", name: "Dream Catcher", provider: "Evolution", players: 980, minBet: "Min 10p", seats: "Live now" },
];

const BLACKJACK_TABLES: Table[] = [
  { src: "/assets/live/table-01.png", name: "One Blackjack", provider: "Pragmatic Play", minBet: "Min 10p", seats: "Seats 6/8", dealer: "Bruno" },
  { src: "/assets/live/table-02.png", name: "One Blackjack", provider: "Pragmatic Play", minBet: "Min 10p", seats: "Seats 6/8", dealer: "Francesca" },
  { src: "/assets/live/table-03.png", name: "Blackjack London", provider: "Evolution", minBet: "Min 50p", seats: "Seats 4/7", dealer: "Anya" },
  { src: "/assets/live/table-04.png", name: "Blackjack Lobby", provider: "Pragmatic Play", minBet: "Min £1", seats: "Seats 2/7", dealer: "Mark" },
  { src: "/assets/live/table-05.png", name: "Speed Blackjack", provider: "Evolution", minBet: "Min 25p", seats: "Seats 5/7", dealer: "Sofia" },
];

export function LiveView() {
  return (
    <>
      <LiveTabs />
      <MostPopularRail tables={MOST_POPULAR} />
      <BlackjackTablesList tables={BLACKJACK_TABLES} />
    </>
  );
}

/* --------- Most popular (horizontal rail of large cards) --------- */

function MostPopularRail({ tables }: { tables: Table[] }) {
  const railRef = useDraggableScroll<HTMLDivElement>();

  return (
    <section aria-label="Most popular" className="py-3">
      <div className="flex items-center justify-between px-[16px] pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">Most popular</h2>
        <button type="button" className="text-[14px] font-extrabold text-[var(--mrq-blue)]">
          See all
        </button>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex gap-[12px] overflow-x-auto pl-[16px] pr-[16px] pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tables.map((t, i) => (
          <LiveTableCard key={`${t.name}-${i}`} table={t} />
        ))}
      </div>
    </section>
  );
}

function LiveTableCard({ table }: { table: Table }) {
  return (
    <button
      type="button"
      className="relative shrink-0 overflow-hidden rounded-[14px] bg-white text-left active:scale-[0.98] transition-transform"
      style={{
        width: "200px",
        boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.18)",
      }}
    >
      {/* Image area with seat-count chip overlay */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={table.src} alt={table.name} className="block w-full h-[200px] object-cover" draggable={false} />
        {typeof table.players === "number" && (
          <div
            className="absolute top-[10px] left-[10px] flex items-center gap-[4px] rounded-full bg-white/90 backdrop-blur px-[8px] py-[3px]"
            style={{ boxShadow: "0 2px 6px rgba(10, 46, 203, 0.1)" }}
          >
            <PersonIcon className="size-[12px] text-[var(--mrq-blue-dark)]" />
            <span className="text-[12px] font-extrabold text-[var(--mrq-blue-dark)] leading-none">
              {table.players.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-[10px]">
        <p className="text-[14px] font-extrabold text-[var(--mrq-blue-dark)] truncate">
          {table.name}
        </p>
        <p className="text-[12px] font-semibold text-[#6c7080] truncate mt-[2px]">{table.provider}</p>
        <p className="text-[12px] font-bold text-[var(--mrq-blue-dark)] mt-[6px]">{table.minBet}</p>
      </div>
    </button>
  );
}

/* --------- Blackjack tables (vertical list of row cards) --------- */

function BlackjackTablesList({ tables }: { tables: Table[] }) {
  return (
    <section aria-label="Blackjack tables" className="py-3">
      <div className="flex items-center justify-between px-[16px] pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">Blackjack tables</h2>
        <button type="button" className="text-[14px] font-extrabold text-[var(--mrq-blue)]">
          See all
        </button>
      </div>

      <div className="flex flex-col gap-[10px] px-[16px]">
        {tables.map((t, i) => (
          <BlackjackRow key={`${t.name}-${i}`} table={t} />
        ))}
      </div>
    </section>
  );
}

function BlackjackRow({ table }: { table: Table }) {
  return (
    <button
      type="button"
      className="flex items-center gap-[12px] rounded-[14px] bg-white p-[10px] text-left active:scale-[0.99] transition-transform"
      style={{ boxShadow: "0 4px 12px -6px rgba(10, 46, 203, 0.18)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={table.src}
        alt={table.name}
        className="size-[64px] rounded-[10px] object-cover shrink-0"
        draggable={false}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-extrabold text-[var(--mrq-blue-dark)] truncate">{table.name}</p>
        <p className="text-[12px] font-semibold text-[#6c7080] truncate">{table.provider}</p>
        <div className="flex items-center gap-[10px] mt-[4px] text-[12px] font-bold text-[var(--mrq-blue-dark)]">
          <span>{table.minBet}</span>
          <span className="opacity-50">·</span>
          <span>{table.seats}</span>
        </div>
      </div>
      {table.dealer && (
        <div className="flex items-center gap-[4px] rounded-full bg-[#f2f3f3] px-[10px] py-[5px] shrink-0">
          <span className="size-[6px] rounded-full bg-[#22c55e]" aria-hidden />
          <span className="text-[12px] font-extrabold text-[var(--mrq-blue-dark)] leading-none">
            {table.dealer}
          </span>
        </div>
      )}
    </button>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className} aria-hidden>
      <circle cx="6" cy="3.5" r="2" />
      <path d="M1.5 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4v.5h-9V11Z" />
    </svg>
  );
}
