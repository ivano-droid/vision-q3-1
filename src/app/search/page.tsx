"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CategoryMegaCardsRail,
  type MegaCardCategory,
} from "@/components/rails/CategoryMegaCardsRail";
import { ThemesGrid, type Theme } from "@/components/rails/ThemesGrid";
import { CATEGORIES as CASINO_SUBCATEGORIES } from "@/lib/casino-categories";

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

// Start Browsing tile spec. Each sticker is now a single self-contained
// SVG (Figma 216:46506) — the body fill, outline, and detail layers are
// all baked into the file, so the BrowseTile component just sets it as
// one positioned image on the right side of each tile.
type TileSpec = {
  label: string;
  /** Optional href. Tiles without one render as inert buttons — used
   *  while Live/Bingo/Arena pages are unbuilt so the tiles still show
   *  visually but don't navigate to a 404. */
  href?: string;
  /** SVG sticker dropped on the right of the tile. */
  icon: string;
  /** Sticker bounding-box width in px. */
  iconW: number;
  /** Sticker bounding-box height in px. */
  iconH: number;
  /** Offset from the right edge of the tile (px). Negative pushes
   *  the sticker outside the tile boundary so the playful "stuck on"
   *  feel survives. */
  iconRight: number;
  /** Offset from the top of the tile (px). */
  iconTop: number;
  /** Rotation in degrees. */
  iconRotate: number;
};

const BROWSE: TileSpec[] = [
  {
    label: "Casino",
    href: "/casino",
    icon: "/assets/search/casino.svg",
    iconW: 65,
    iconH: 45,
    iconRight: -6,
    iconTop: 4,
    iconRotate: 14,
  },
  {
    label: "Live Casino",
    icon: "/assets/search/live.svg",
    iconW: 65,
    iconH: 45,
    iconRight: -4,
    iconTop: 3,
    iconRotate: -9,
  },
  {
    label: "Bingo",
    icon: "/assets/search/bingo.svg",
    iconW: 56,
    iconH: 56,
    iconRight: 2,
    iconTop: 0,
    iconRotate: -17,
  },
  {
    label: "Arena",
    icon: "/assets/search/arena.svg",
    iconW: 50,
    iconH: 58,
    iconRight: 4,
    iconTop: -2,
    iconRotate: 32,
  },
];

// Game tile pools — small re-usable arrays for the Hot Right Now,
// Slots, Quick games and Live Casino rails. Tiles are 109×109
// square (matches the lobby's "Hot right now" rail).
const G = (i: number, alt: string) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt,
});

const TILES_HOT = [
  G(1, "Buffalo Bills"),
  G(7, "Mummy Mania"),
  G(11, "Maze Escape"),
  G(13, "Snake Arena"),
  G(4, "Jewel Stepper"),
  G(8, "Tiki Tumble"),
];

// Game tile pools used by the mega-cards rail. The standalone Slots /
// Quick games / Live Casino rails that used to live further down the
// page were removed (per the Explore redesign — Figma 133:39525) in
// favour of the Discover new games circular row up top + the Browse
// all categories grid at the bottom.
const TILES_LIVE_CASINO = [
  G(8, "Tiki Tumble"),
  G(11, "Maze Escape"),
  G(1, "Buffalo Bills"),
  G(13, "Snake Arena"),
  G(7, "Mummy Mania"),
  G(4, "Jewel Stepper"),
];

const TILES_BINGO = [
  G(4, "Jewel Stepper"),
  G(8, "Tiki Tumble"),
  G(13, "Snake Arena"),
  G(11, "Maze Escape"),
  G(1, "Buffalo Bills"),
  G(7, "Mummy Mania"),
];

const TILES_ARENA = [
  G(13, "Snake Arena"),
  G(11, "Maze Escape"),
  G(1, "Buffalo Bills"),
  G(4, "Jewel Stepper"),
  G(8, "Tiki Tumble"),
  G(7, "Mummy Mania"),
];

// Category mega-cards (Casino, Live Casino, Bingo, Arena) — each is
// a wide card with a category icon + a small embedded grid of 6
// games. Icons are the new flat MrQ-blue line/fill icons (Figma
// node 173:30744) — not the colourful "burst" illustration
// stickers used on the Start Browsing tiles. They're cleaner on a
// busy white card.
const MEGA_CATEGORIES: MegaCardCategory[] = [
  {
    key: "casino",
    title: "Casino",
    subtitle: "Hot right now",
    sticker: "/assets/mega/casino.svg",
    tiles: TILES_HOT.slice(0, 6),
  },
  {
    key: "live",
    title: "Live Casino",
    subtitle: "Hot right now",
    sticker: "/assets/mega/live.svg",
    tiles: TILES_LIVE_CASINO.slice(0, 6),
  },
  {
    key: "bingo",
    title: "Bingo",
    subtitle: "Hot right now",
    sticker: "/assets/mega/bingo.svg",
    tiles: TILES_BINGO.slice(0, 6),
  },
  {
    key: "arena",
    title: "Arena",
    subtitle: "Hot right now",
    sticker: "/assets/mega/arena.svg",
    tiles: TILES_ARENA.slice(0, 6),
  },
];

// Browse all categories — 2-col grid of navigation cards.
//
// Grid order (top → bottom):
//
//   1. Casino sub-categories (New, Jackpot, Megaways, Slingo, Tables,
//      Live) — brand-blue background, "Casino" sub-line, each links
//      to /casino/[key].
//
//   2. Live Casino sub-categories (Blackjack, Roulette, Baccarat,
//      Game Shows, Poker, Mega Wheel) — lighter brand blue so the
//      Live Casino group reads as a distinct second cluster while
//      still sitting in the blue family. "Live Casino" sub-line.
//      Inert for now (the dedicated /live page is gone).
//
//   3. Other verticals (Bingo, Arena) — closing the grid with two
//      distinctly-coloured single-line cards.
//
// Thumb cluster per card is a fanned trio of three game tile arts.
const CATEGORY_THUMBS: Record<string, [string, string, string]> = {
  // Casino sub-cats
  new:      ["/assets/games/slot-13.png", "/assets/games/slot-12.png", "/assets/games/slot-11.png"],
  jackpot:  ["/assets/games/slot-01.png", "/assets/games/slot-03.png", "/assets/games/slot-05.png"],
  megaways: ["/assets/games/slot-02.png", "/assets/games/slot-04.png", "/assets/games/slot-06.png"],
  slingo:   ["/assets/games/slot-03.png", "/assets/games/slot-06.png", "/assets/games/slot-09.png"],
  tables:   ["/assets/games/slot-04.png", "/assets/games/slot-08.png", "/assets/games/slot-12.png"],
  "casino-live": ["/assets/games/slot-05.png", "/assets/games/slot-10.png", "/assets/games/slot-07.png"],
  // Live Casino sub-cats
  blackjack:  ["/assets/games/slot-08.png", "/assets/games/slot-04.png", "/assets/games/slot-01.png"],
  roulette:   ["/assets/games/slot-11.png", "/assets/games/slot-13.png", "/assets/games/slot-07.png"],
  baccarat:   ["/assets/games/slot-05.png", "/assets/games/slot-08.png", "/assets/games/slot-10.png"],
  gameshows:  ["/assets/games/slot-12.png", "/assets/games/slot-03.png", "/assets/games/slot-06.png"],
  poker:      ["/assets/games/slot-09.png", "/assets/games/slot-02.png", "/assets/games/slot-04.png"],
  "mega-wheel": ["/assets/games/slot-13.png", "/assets/games/slot-11.png", "/assets/games/slot-08.png"],
  // Verticals
  bingo:      ["/assets/games/slot-08.png", "/assets/games/slot-04.png", "/assets/games/slot-11.png"],
  arena:      ["/assets/games/slot-13.png", "/assets/games/slot-11.png", "/assets/games/slot-03.png"],
};

// Group 1 — Casino sub-categories (brand blue, links to /casino/[key]).
const CASINO_CARDS: Theme[] = CASINO_SUBCATEGORIES.map((cat) => ({
  // Casino's own "Live" sub-category shares its key with what used to
  // be a top-level Live vertical — namespace it to keep React keys
  // unique inside the broader list.
  key: cat.key === "live" ? "casino-live" : cat.key,
  label: cat.label,
  subtitle: "Casino",
  href: `/casino/${cat.key}`,
  thumbs:
    CATEGORY_THUMBS[cat.key === "live" ? "casino-live" : cat.key] ?? [
      "/assets/games/slot-01.png",
      "/assets/games/slot-04.png",
      "/assets/games/slot-08.png",
    ],
}));

// Group 2 — Live Casino sub-categories. Mid-tone brand blue
// (#3D5BE0) so the row is visually a step lighter than the regular
// Casino group above. No href — the dedicated Live Casino routes
// haven't been built yet.
const LIVE_CASINO_BLUE = "#3D5BE0";
const LIVE_CASINO_CARDS: Theme[] = [
  { key: "blackjack",  label: "Blackjack",   subtitle: "Live Casino", color: LIVE_CASINO_BLUE, thumbs: CATEGORY_THUMBS.blackjack },
  { key: "roulette",   label: "Roulette",    subtitle: "Live Casino", color: LIVE_CASINO_BLUE, thumbs: CATEGORY_THUMBS.roulette },
  { key: "baccarat",   label: "Baccarat",    subtitle: "Live Casino", color: LIVE_CASINO_BLUE, thumbs: CATEGORY_THUMBS.baccarat },
  { key: "gameshows",  label: "Game Shows",  subtitle: "Live Casino", color: LIVE_CASINO_BLUE, thumbs: CATEGORY_THUMBS.gameshows },
  { key: "poker",      label: "Poker",       subtitle: "Live Casino", color: LIVE_CASINO_BLUE, thumbs: CATEGORY_THUMBS.poker },
  { key: "mega-wheel", label: "Mega Wheel",  subtitle: "Live Casino", color: LIVE_CASINO_BLUE, thumbs: CATEGORY_THUMBS["mega-wheel"] },
];

// Group 3 — closing verticals. Bingo (pink) + Arena (red) — both
// inert until those pages return.
const VERTICAL_CARDS: Theme[] = [
  { key: "bingo", label: "Bingo", color: "#DB2777", thumbs: CATEGORY_THUMBS.bingo },
  { key: "arena", label: "Arena", color: "#DC2626", thumbs: CATEGORY_THUMBS.arena },
];

const BROWSE_CATEGORIES: Theme[] = [
  ...CASINO_CARDS,
  ...LIVE_CASINO_CARDS,
  ...VERTICAL_CARDS,
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

  // Lock body scroll while the focused search modal is open so the
  // page underneath doesn't scroll behind the white overlay.
  useEffect(() => {
    if (!isActive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isActive]);

  // Auto-focus the modal's input when it appears so the keyboard
  // pops up immediately on the device.
  useEffect(() => {
    if (isActive) inputRef.current?.focus();
  }, [isActive]);

  // Close the search modal: clear query, drop focus, blur the real
  // input so the keyboard goes away.
  const closeModal = () => {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
  };

  // Esc closes the modal.
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // closeModal is stable enough; intentionally minimal deps so we
    // don't re-register on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <>
      {/* Sticky search-input shell. When the modal is open this gets
          hidden under the fullscreen overlay so a single in-view
          search field is visible at a time — but the shell stays
          mounted so the input ref + state are preserved. The button
          underneath is a tap target that just opens the modal; the
          real input lives below and gets focused once the modal is
          mounted. */}
      <div
        className="sticky top-[calc(env(safe-area-inset-top)+68px)] z-20 bg-mrq-blue px-[16px] pb-[14px] pt-[2px]"
        style={{
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => setFocused(true)}
          aria-label="Open search"
          className="flex w-full items-center gap-[10px] rounded-full bg-white h-[43px] px-[18px] text-left"
          style={{ border: "1px solid rgba(3, 34, 172, 0.3)" }}
        >
          <SearchIcon className="size-[18px] shrink-0 text-[#0322ac]" />
          <span className="flex-1 text-[15px] font-bold text-[#0322ac]">
            {query || "Search all games"}
          </span>
        </button>
      </div>

      {/* Default-state content under the input. Always mounted; the
          fullscreen overlay just covers it when the modal opens. */}
      <div className="flex flex-col pt-[14px]">
        <StartBrowsing items={BROWSE} />
        <CategoryMegaCardsRail categories={MEGA_CATEGORIES} />
        <ThemesGrid title="Browse all categories" items={BROWSE_CATEGORIES} />
      </div>

      {/* Fullscreen white search modal — fixed inset-0 z-[60] so it
          sits ABOVE the BrandBar (z-30) and the sticky input shell
          (z-20). The whole page goes solid white, the search field
          gets pinned to the top with an X close button, and the
          Recently Searched list takes over the body. */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="search-modal"
            // Constrained to the mobile-frame's column via
            // --frame-right-offset so it doesn't span the whole
            // desktop monitor.
            className="fixed inset-y-0 z-[60] bg-white flex flex-col"
            style={{
              left: "var(--frame-right-offset)",
              right: "var(--frame-right-offset)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Search games"
          >
            <div
              className="px-[16px] pb-[12px]"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 14px)",
              }}
            >
              <div
                className="flex items-center gap-[10px] rounded-full bg-white h-[48px] px-[18px]"
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
                  className="flex-1 bg-transparent text-[15px] font-bold text-[#0322ac] placeholder:text-[#0322ac] outline-none text-left"
                />
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close search"
                  className="grid size-[28px] place-items-center rounded-full shrink-0 active:scale-[0.9] transition-transform"
                  style={{ backgroundColor: "rgba(10, 46, 203, 0.10)" }}
                >
                  <CloseIcon className="size-[14px] text-[var(--mrq-blue)]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <RecentlySearched
                items={RECENTLY_SEARCHED}
                onRemove={(name) => {
                  // Stub — in a real build this would drop the item
                  // from the user's search history.
                  // eslint-disable-next-line no-console
                  console.log("[Search] remove from history →", name);
                }}
              />
            </div>
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
    // pb-[24px] separates the Start Browsing block from the
    // category mega-cards rail that follows — previously the
    // 4 dark-blue tiles were sitting right on top of the wide
    // Casino mega card.
    <section className="px-[16px] pb-[24px]">
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

function BrowseTile({ item }: { item: TileSpec }) {
  // Slightly taller (62px vs the previous 58px) so the bigger stickers
  // from Figma 216:46506 have room to breathe without clipping at the
  // top/bottom edges.
  const className =
    "relative h-[62px] overflow-hidden rounded-[10px] active:scale-[0.98] transition-transform";
  const style = { backgroundColor: "#0322ac" } as const;

  // Tile interior is identical for linked vs inert tiles — only the
  // wrapping element changes.
  const inner = (
    <>
      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[13px] font-extrabold text-white z-10">
        {item.label}
      </span>
      {/* Single flattened SVG sticker, rotated + offset per the
          per-tile spec. The Figma mask group is already baked in so
          there's no compositing left to do here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.icon}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute pointer-events-none select-none"
        style={{
          right: `${item.iconRight}px`,
          top: `${item.iconTop}px`,
          width: `${item.iconW}px`,
          height: `${item.iconH}px`,
          transform: `rotate(${item.iconRotate}deg)`,
        }}
      />
    </>
  );

  if (!item.href) {
    return (
      <button
        type="button"
        className={`${className} text-left`}
        style={style}
        aria-disabled
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href={item.href} className={className} style={style}>
      {inner}
    </Link>
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
