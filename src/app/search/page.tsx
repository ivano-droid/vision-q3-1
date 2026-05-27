"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  CategoryMegaCardsRail,
  type MegaCardCategory,
} from "@/components/rails/CategoryMegaCardsRail";
import { GameRail } from "@/components/rails/GameRail";
import { ThemesGrid, type Theme } from "@/components/rails/ThemesGrid";

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

// Each tile's sticker is built from one or more PNG layers, drawn
// bottom-up (first item = back of the stack). The "flattened" SVG
// exports from Figma turned out to be just the dark navy outline
// layers, so we layer the colour body + details ourselves.
//
// Layers are positioned in PERCENTAGES of the sticker bounding box
// so the same spec works at any rendered size — width:auto on each
// layer preserves its native aspect ratio (so the crown gem doesn't
// stretch into a fat ellipse, etc).
type StickerLayer = {
  src: string;
  /** Horizontal anchor as % of the sticker bounding box width. */
  leftPct: number;
  /** Vertical anchor as % of the sticker bounding box height. */
  topPct: number;
  /** Layer width as % of the sticker bounding box width. */
  widthPct: number;
  /** Optional explicit height; if omitted, height: auto (image
   *  keeps its native aspect ratio). */
  heightPct?: number;
};
type TileSpec = {
  label: string;
  href: string;
  stickerW: number;
  stickerH: number;
  stickerRight: number;
  stickerTop: number;
  stickerRotate: number;
  layers: StickerLayer[];
  bingoText?: boolean;
};

const BROWSE: TileSpec[] = [
  {
    label: "Casino",
    href: "/casino",
    stickerW: 60,
    stickerH: 60,
    stickerRight: -4,
    stickerTop: -4,
    stickerRotate: 14,
    // Single layer — the 7 SVG already has the pink fill + white
    // outline + dark details baked in.
    layers: [
      { src: "/assets/search/sticker-casino.png", leftPct: 0, topPct: 0, widthPct: 100, heightPct: 100 },
    ],
  },
  {
    label: "Live Casino",
    href: "/live",
    stickerW: 70,
    stickerH: 58,
    stickerRight: -2,
    stickerTop: -2,
    stickerRotate: -9,
    // Bottom → top: shadow → yellow crown body → white highlights →
    // dark navy gem ellipse pinned at the top centre.
    layers: [
      { src: "/assets/search/crown-shadow.png", leftPct: 8,  topPct: 76, widthPct: 78 },
      { src: "/assets/search/crown-body.png",   leftPct: 0,  topPct: 8,  widthPct: 100 },
      { src: "/assets/search/crown-hi.png",     leftPct: 0,  topPct: 8,  widthPct: 100 },
      { src: "/assets/search/crown-gem.png",    leftPct: 20, topPct: 6,  widthPct: 60 },
    ],
  },
  {
    label: "Bingo",
    href: "/bingo",
    stickerW: 54,
    stickerH: 54,
    stickerRight: 4,
    stickerTop: 2,
    stickerRotate: -17,
    bingoText: true,
    layers: [
      { src: "/assets/search/bingo-ball.png",  leftPct: 0,  topPct: 0,  widthPct: 100, heightPct: 100 },
      { src: "/assets/search/bingo-inner.png", leftPct: 18, topPct: 18, widthPct: 64,  heightPct: 64 },
      { src: "/assets/search/bingo-hi.png",    leftPct: 25, topPct: 32, widthPct: 38 },
    ],
  },
  {
    label: "Arena",
    href: "/arena",
    stickerW: 40,
    stickerH: 68,
    stickerRight: 6,
    stickerTop: -6,
    stickerRotate: 32,
    // Body: pink fist. Detail: navy fingernails/cuff lines on top.
    layers: [
      { src: "/assets/search/fist-body.png",   leftPct: 0, topPct: 0, widthPct: 100, heightPct: 100 },
      { src: "/assets/search/fist-detail.png", leftPct: 0, topPct: 0, widthPct: 100, heightPct: 100 },
    ],
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

const TILES_SLOTS = [
  G(4, "Jewel Stepper"),
  G(8, "Tiki Tumble"),
  G(13, "Snake Arena"),
  G(11, "Maze Escape"),
  G(1, "Buffalo Bills"),
  G(7, "Mummy Mania"),
];

const TILES_QUICK = [
  G(13, "Snake Arena"),
  G(11, "Maze Escape"),
  G(1, "Buffalo Bills"),
  G(4, "Jewel Stepper"),
  G(8, "Tiki Tumble"),
  G(7, "Mummy Mania"),
];

const TILES_LIVE = [
  G(8, "Tiki Tumble"),
  G(11, "Maze Escape"),
  G(1, "Buffalo Bills"),
  G(13, "Snake Arena"),
  G(7, "Mummy Mania"),
  G(4, "Jewel Stepper"),
];

// Category mega-cards (Casino, Live Casino, Bingo, Arena) — each is
// a wide card with a category sticker + a small embedded grid of 6
// games. Stickers reuse the single-layer PNGs already exported from
// Figma; multi-layer compositing (gem/shadow/highlight) is reserved
// for the Start Browsing tiles where the sticker is the focal point.
const MEGA_CATEGORIES: MegaCardCategory[] = [
  {
    key: "casino",
    title: "Casino",
    subtitle: "Hot right now",
    sticker: "/assets/search/sticker-casino.png",
    tiles: TILES_HOT.slice(0, 6),
  },
  {
    key: "live",
    title: "Live Casino",
    subtitle: "Hot right now",
    sticker: "/assets/search/crown-body.png",
    tiles: TILES_LIVE.slice(0, 6),
  },
  {
    key: "bingo",
    title: "Bingo",
    subtitle: "Hot right now",
    sticker: "/assets/search/bingo-ball.png",
    tiles: TILES_SLOTS.slice(0, 6),
  },
  {
    key: "arena",
    title: "Arena",
    subtitle: "Hot right now",
    sticker: "/assets/search/fist-body.png",
    tiles: TILES_QUICK.slice(0, 6),
  },
];

// Browse all themes — 8 themed entry points, 2 columns. Each card
// shows a fan of 3 thumbnails as a tease for the theme's content.
const THEMES: Theme[] = [
  { key: "animal",  label: "Animal",  thumbs: ["/assets/games/slot-08.png", "/assets/games/slot-04.png", "/assets/games/slot-13.png"] },
  { key: "fishing", label: "Fishing", thumbs: ["/assets/games/slot-13.png", "/assets/games/slot-08.png", "/assets/games/slot-11.png"] },
  { key: "history", label: "History", thumbs: ["/assets/games/slot-07.png", "/assets/games/slot-01.png", "/assets/games/slot-04.png"] },
  { key: "jungle",  label: "Jungle",  thumbs: ["/assets/games/slot-11.png", "/assets/games/slot-13.png", "/assets/games/slot-08.png"] },
  { key: "west",    label: "West",    thumbs: ["/assets/games/slot-01.png", "/assets/games/slot-04.png", "/assets/games/slot-07.png"] },
  { key: "dragons", label: "Dragons", thumbs: ["/assets/games/slot-13.png", "/assets/games/slot-11.png", "/assets/games/slot-01.png"] },
  { key: "horror",  label: "Horror",  thumbs: ["/assets/games/slot-07.png", "/assets/games/slot-13.png", "/assets/games/slot-08.png"] },
  { key: "aliens",  label: "Aliens",  thumbs: ["/assets/games/slot-04.png", "/assets/games/slot-08.png", "/assets/games/slot-11.png"] },
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
            className="flex flex-col pt-[14px]"
          >
            <StartBrowsing items={BROWSE} />
            <CategoryMegaCardsRail categories={MEGA_CATEGORIES} />
            <GameRail title="Slots" tiles={TILES_SLOTS} tileWidth={109} tileHeight={109} />
            <GameRail title="Quick games" tiles={TILES_QUICK} tileWidth={109} tileHeight={109} />
            <GameRail title="Live Casino tables" tiles={TILES_LIVE} tileWidth={109} tileHeight={109} />
            <ThemesGrid items={THEMES} />
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

function BrowseTile({ item }: { item: TileSpec }) {
  return (
    <Link
      href={item.href}
      className="relative h-[58px] overflow-hidden rounded-[10px] active:scale-[0.98] transition-transform"
      style={{ backgroundColor: "#0322ac" }}
    >
      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[13px] font-extrabold text-white z-10">
        {item.label}
      </span>
      {/* Sticker bounding box. Layers inside use percentage
          positioning so the layout scales cleanly at any size; the
          tile's overflow-hidden clips anything bleeding past the
          rounded-rect (mirrors the Figma mask group). */}
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
        {item.layers.map((layer, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${layer.src}-${i}`}
            src={layer.src}
            alt=""
            draggable={false}
            className="absolute select-none"
            style={{
              left: `${layer.leftPct}%`,
              top: `${layer.topPct}%`,
              width: `${layer.widthPct}%`,
              // No height → height:auto so the layer keeps its native
              // aspect ratio. Explicit height only when the layer is
              // square-ish and we want it constrained.
              height: layer.heightPct ? `${layer.heightPct}%` : "auto",
            }}
          />
        ))}
        {item.bingoText && (
          <span
            className="absolute font-extrabold leading-none"
            style={{
              top: "37%",
              left: "32%",
              color: "#0B2595",
              fontSize: "16px",
              transform: "rotate(-14deg)",
              fontFamily: "var(--font-headline)",
              letterSpacing: "0.5px",
            }}
          >
            22
          </span>
        )}
      </span>
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
