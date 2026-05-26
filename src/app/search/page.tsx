"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

/**
 * Search page — full route.
 *
 * Has two visual states driven entirely by whether the input is the
 * active focus / has a value:
 *
 *   Default state (unfocused, empty input)
 *   ┌─ White search input pill (left-aligned placeholder) ─────┐
 *   ├─ Start Browsing (4 dark-blue tiles + sticker)            │
 *   ├─ Recent big wins (horizontal scroll)                     │
 *   └─ Recommended for you (vertical list)                     │
 *
 *   Active state (focused OR has a query)
 *   ┌─ Search input (with optional clear button) ──────────────┐
 *   ├─ "Recently searched" header                              │
 *   └─ List of recent search rows (small thumb + name + ╳ icon)│
 *
 * The state swap is page-takeover-style — the three default sections
 * disappear and the recent-searches list takes the whole content area.
 * No actual route change (deep links to /search still land on the
 * default state with the input auto-focused).
 *
 * Bottom nav is unchanged per the brief.
 */

const BROWSE: Array<{
  label: string;
  href: string;
  sticker: string;
  stickerW: number;
  stickerH: number;
  stickerRight: number;
  stickerTop: number;
  stickerRotate: number;
}> = [
  {
    label: "Casino",
    href: "/casino",
    // PNG export of the Figma sticker (rendered via `sharp` from the
    // exported SVG). The SVGs had complex masked compositions that
    // didn't render correctly standalone, so flat PNGs are simpler
    // and they look identical to the design.
    sticker: "/assets/search/sticker-7.png",
    stickerW: 60,
    stickerH: 60,
    stickerRight: -2,
    stickerTop: -3,
    stickerRotate: 14,
  },
  {
    label: "Live Casino",
    href: "/live",
    sticker: "/assets/search/sticker-crown-a.png",
    stickerW: 64,
    stickerH: 52,
    stickerRight: 0,
    stickerTop: -4,
    stickerRotate: -9,
  },
  {
    label: "Bingo",
    href: "/bingo",
    sticker: "/assets/search/sticker-bingo-ball.png",
    stickerW: 56,
    stickerH: 56,
    stickerRight: 4,
    stickerTop: 4,
    stickerRotate: -17,
  },
  {
    label: "Arena",
    href: "/arena",
    sticker: "/assets/search/sticker-fist.png",
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

// Stub data for the "Recently searched" takeover state — would be
// driven by real user history once we have one.
const RECENTLY_SEARCHED: Array<{ src: string; name: string }> = [
  { src: "/assets/games/slot-01.png", name: "Buffalo Bills" },
  { src: "/assets/games/slot-04.png", name: "Jewel Stepper" },
  { src: "/assets/games/slot-08.png", name: "Tiki Tumble" },
  { src: "/assets/games/slot-13.png", name: "Big Bass Real Repeat" },
  { src: "/assets/games/slot-11.png", name: "Maze Escape" },
  { src: "/assets/games/slot-03.png", name: "Snake Arena" },
  { src: "/assets/games/slot-05.png", name: "Western Gold" },
  { src: "/assets/games/slot-07.png", name: "Golden Catch" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Note: no auto-focus on mount. The user should LAND on the
  // default state — the 4 Start Browsing cards + Recent big wins +
  // Recommended sections — and only enter the search modal when
  // they tap the input.

  // "Active" state — either the user is focused or has typed.
  // Switching off requires both: focus loss AND empty input. That way
  // tapping a result row doesn't snap back to the default sections
  // before the next page loads.
  const isActive = focused || query.length > 0;

  return (
    <>
      {/* Search input pill — sticky under the brand bar on the blue
          band, so the blue header reads as one continuous panel. */}
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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            // Left-aligned (matches normal input behaviour). The
            // previous centered placeholder felt floaty against a
            // left-aligned cursor once typing started.
            className="flex-1 bg-transparent text-[15px] font-bold text-[#0322ac] placeholder:text-[#0322ac] outline-none text-left"
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

      {/* Default state ↔ active "modal" state — crossfade so the
          transition feels deliberate (matches the modal-style swap
          rather than a hard cut). mode="wait" keeps them from
          briefly stacking. */}
      <AnimatePresence mode="wait" initial={false}>
        {isActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <RecentlySearched
              items={RECENTLY_SEARCHED}
              onRemove={(name) => {
                // Stub — in a real build this would drop the item
                // from the user's search history.
                // eslint-disable-next-line no-console
                console.log("[Search] remove from history →", name);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-[20px] pt-[14px]"
          >
            <StartBrowsing items={BROWSE} />
            <RecentBigWins items={RECENT_BIG_WINS} />
            <RecommendedForYou items={RECOMMENDED} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- Active-state takeover ---------------- */

function RecentlySearched({
  items,
  onRemove,
}: {
  items: typeof RECENTLY_SEARCHED;
  onRemove: (name: string) => void;
}) {
  return (
    <section className="pt-[16px] pb-[6px]">
      <h2 className="px-[16px] pb-[12px] text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">
        Recently searched
      </h2>
      <ul className="flex flex-col gap-[10px] px-[16px]">
        {items.map((rec, i) => (
          <li key={`${rec.name}-${i}`}>
            <div
              className="flex w-full items-center gap-[14px] rounded-[8px] bg-white pl-[6px] pr-[10px] h-[45px]"
            >
              <button
                type="button"
                className="flex flex-1 items-center gap-[14px] text-left active:scale-[0.99] transition-transform min-w-0"
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
              </button>
              <button
                type="button"
                aria-label={`Remove ${rec.name} from recent searches`}
                onClick={() => onRemove(rec.name)}
                className="grid size-[28px] place-items-center rounded-full text-[var(--mrq-blue)] opacity-50 hover:opacity-100 active:scale-[0.9] transition-all"
              >
                <CloseIcon className="size-[12px]" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Default-state sections ---------------- */

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
      {/* Decorative sticker positioned per-tile so the heads/tips
          don't crop off; overflow-hidden on the tile clips the bottom
          edge cleanly to mirror the masked composition in Figma. */}
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
          className="h-full w-full select-none object-contain"
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
      <div
        className="no-scrollbar flex gap-[12px] overflow-x-auto pl-[16px] pr-[16px] pb-[14px]"
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
