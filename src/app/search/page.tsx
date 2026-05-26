"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Search page — full route (was previously a modal overlay).
 *
 * Layout (Figma node 125:27004):
 *
 *   ┌─ Brand bar (logo + balance pill, from AppShell) ────────┐
 *   ├─ Search input pill (sticky, on the blue header) ───────┤
 *   │   🔍 Search all games                                  │
 *   ├─ Start Browsing (2×2 dark-blue tiles + sticker art) ───┤
 *   │   [Casino  7]  [Live Casino  👑]                       │
 *   │   [Bingo  22]  [Arena   ✊]                            │
 *   ├─ Recent big wins (horizontal row of artwork + £ pill) ─┤
 *   ├─ Recommended for you (vertical list rows) ─────────────┤
 *   └─────────────────────────────────────────────────────────┘
 *
 * Bottom nav is unchanged (per the brief — keep it the way it is).
 *
 * The search bar lives at the top of the page content rather than in
 * AppShell, because only this route needs it sticking under the
 * BrandBar in the blue area. It uses the same blue (`bg-mrq-blue`) so
 * it visually extends the BrandBar's header into a single blue band.
 */

const BROWSE: Array<{
  label: string;
  href: string;
  sticker: string;
  /** Pixel size + offsets — each sticker has its own composition
   *  pulled from the Figma so we don't crop heads / tilts off. */
  stickerW: number;
  stickerH: number;
  stickerRight: number;
  stickerTop: number;
  stickerRotate: number;
}> = [
  {
    label: "Casino",
    href: "/casino",
    sticker: "/assets/search/sticker-7.svg",
    stickerW: 60,
    stickerH: 60,
    stickerRight: -2,
    stickerTop: -3,
    stickerRotate: 14,
  },
  {
    label: "Live Casino",
    href: "/live",
    sticker: "/assets/search/sticker-crown-a.svg",
    stickerW: 64,
    stickerH: 52,
    stickerRight: 0,
    stickerTop: -4,
    stickerRotate: -9,
  },
  {
    label: "Bingo",
    href: "/bingo",
    sticker: "/assets/search/sticker-bingo-ball.svg",
    stickerW: 56,
    stickerH: 56,
    stickerRight: 4,
    stickerTop: 4,
    stickerRotate: -17,
  },
  {
    label: "Arena",
    href: "/arena",
    sticker: "/assets/search/sticker-fist.svg",
    stickerW: 38,
    stickerH: 60,
    stickerRight: 8,
    stickerTop: -2,
    stickerRotate: 32,
  },
];

const RECENT_BIG_WINS: Array<{ src: string; alt: string; prize: string }> = [
  { src: "/assets/games/slot-04.png", alt: "Western Gold", prize: "£32.34" },
  { src: "/assets/games/slot-08.png", alt: "Golden Catch", prize: "£28.55" },
  { src: "/assets/games/slot-13.png", alt: "Snake Arena", prize: "£31.19" },
  { src: "/assets/games/slot-11.png", alt: "Maze Escape", prize: "£24.80" },
  { src: "/assets/games/slot-01.png", alt: "Buffalo Bills", prize: "£18.50" },
];

const RECOMMENDED: Array<{ src: string; name: string }> = [
  { src: "/assets/games/slot-04.png", name: "Jewel Stepper" },
  { src: "/assets/games/slot-08.png", name: "Tiki Tumble" },
  { src: "/assets/games/slot-13.png", name: "Big Bass Real Repeat" },
  { src: "/assets/games/slot-04.png", name: "Jewel Stepper" },
  { src: "/assets/games/slot-08.png", name: "Tiki Tumble" },
  { src: "/assets/games/slot-13.png", name: "Big Bass Real Repeat" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus the input on mount so the on-screen keyboard comes up when
  // the user lands on the page from the bottom-nav Search tab.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      {/* Search input pill — sits on the blue header below the brand
          bar. Sticky so it stays visible as the user scrolls through
          the sections below. The blue background extends the brand
          bar visually, so the two read as one continuous header. */}
      <div
        className="sticky top-[calc(env(safe-area-inset-top)+68px)] z-20 bg-mrq-blue px-[16px] pb-[14px] pt-[2px]"
      >
        <div
          className="flex items-center gap-[10px] rounded-full bg-white h-[43px] px-[18px]"
          style={{ border: "1px solid rgba(3, 34, 172, 0.3)" }}
        >
          <SearchIcon className="size-[18px] shrink-0 text-[#0322ac]" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Search all games"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[15px] font-bold text-[#0322ac] placeholder:text-[#0322ac] outline-none"
            // Centred placeholder to match the Figma design. Once the
            // user starts typing, the text aligns left (default).
            style={{ textAlign: query.length === 0 ? "center" : "left" }}
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="size-[22px] rounded-full grid place-items-center bg-mrq-blue/10 text-mrq-blue shrink-0"
            >
              <CloseIcon className="size-[12px]" />
            </button>
          )}
        </div>
      </div>

      {/* Content sections sit on the #f5f5f5 page canvas. */}
      <div className="flex flex-col gap-[20px] pt-[14px]">
        <StartBrowsing items={BROWSE} />
        <RecentBigWins items={RECENT_BIG_WINS} />
        <RecommendedForYou items={RECOMMENDED} />
      </div>
    </>
  );
}

/* ---------------- Sections ---------------- */

function StartBrowsing({ items }: { items: typeof BROWSE }) {
  return (
    <section className="px-[16px]">
      <h2 className="pb-[10px] text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">
        Start Browsing
      </h2>
      <div className="grid grid-cols-2 gap-[12px]">
        {items.map((item) => (
          <BrowseTile key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

function BrowseTile({ item }: { item: (typeof BROWSE)[number] }) {
  return (
    <Link
      href={item.href}
      className="relative h-[58px] overflow-hidden rounded-[10px] active:scale-[0.98] transition-transform"
      style={{ backgroundColor: "#0322ac" }}
    >
      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[13px] font-extrabold text-white">
        {item.label}
      </span>
      {/* Decorative sticker, anchored to the right edge of the tile.
          overflow-hidden on the tile clips any pieces that hang past
          the rounded-rect, mirroring the masked composition in the
          Figma design. */}
      <span
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: `${item.stickerRight}px`,
          top: `${item.stickerTop}px`,
          width: `${item.stickerW}px`,
          height: `${item.stickerH}px`,
          transform: `rotate(${item.stickerRotate}deg)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.sticker}
          alt=""
          draggable={false}
          className="h-full w-full select-none"
        />
      </span>
    </Link>
  );
}

function RecentBigWins({ items }: { items: typeof RECENT_BIG_WINS }) {
  return (
    <section>
      <h2 className="px-[16px] pb-[10px] text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">
        Recent big wins
      </h2>
      {/* Horizontal scroll row. no-scrollbar utility (defined in
          globals.css) hides the OS scrollbar on iOS / Chrome / FF. */}
      <div
        className="no-scrollbar flex gap-[12px] overflow-x-auto pl-[16px] pr-[16px] pb-[6px]"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((win, i) => (
          <WinCard key={`${win.alt}-${i}`} win={win} />
        ))}
      </div>
    </section>
  );
}

function WinCard({ win }: { win: (typeof RECENT_BIG_WINS)[number] }) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        className="block size-[109px] overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={win.src}
          alt={win.alt}
          draggable={false}
          className="h-full w-full object-cover pointer-events-none"
        />
      </button>
      {/* Prize pill — small white pill straddling the bottom edge of
          the artwork. centered horizontally; the negative bottom
          margin makes it pop slightly past the artwork's lower edge. */}
      <div
        className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 rounded-full bg-white px-[10px] py-[3px]"
        style={{ boxShadow: "0 4px 10px -4px rgba(10, 46, 203, 0.18)" }}
      >
        <span className="text-[13px] font-extrabold text-[var(--mrq-blue)]">
          {win.prize}
        </span>
      </div>
    </div>
  );
}

function RecommendedForYou({ items }: { items: typeof RECOMMENDED }) {
  return (
    <section className="pb-[6px]">
      <h2 className="px-[16px] pb-[10px] text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">
        Recommended for you
      </h2>
      <ul className="flex flex-col gap-[10px] px-[16px]">
        {items.map((rec, i) => (
          <li key={`${rec.name}-${i}`}>
            <button
              type="button"
              className="flex w-full items-center gap-[14px] rounded-[8px] bg-white pl-[6px] pr-[14px] h-[45px] text-left active:scale-[0.99] transition-transform"
            >
              <span className="relative h-[38px] w-[38px] shrink-0 overflow-hidden rounded-[4px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rec.src}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-[#0e1120]">
                {rec.name}
              </span>
              <span className="text-[14px] font-extrabold text-[var(--mrq-blue)]">
                Play
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Icons ---------------- */

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="m3 3 8 8M11 3l-8 8" />
    </svg>
  );
}
