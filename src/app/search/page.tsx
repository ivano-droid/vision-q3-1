"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameRail } from "@/components/rails/GameRail";
import { LiveCasinoRail } from "@/components/rails/LiveCasinoRail";
import { ThemesGrid, type Theme } from "@/components/rails/ThemesGrid";
import { CATEGORIES as CASINO_SUBCATEGORIES } from "@/lib/casino-categories";
import {
  SEARCHABLE_GAMES,
  getAllProviders,
  type SearchableGame,
} from "@/lib/searchable-games";
import {
  applyFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  type GameFilters,
  type SortKey,
} from "@/lib/game-filters";
import { FilterBar } from "@/components/search/FilterBar";
import { haptics } from "@/lib/haptics";

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

// All four Figma SVGs share the same 65×45 viewBox, so each tile
// gets the same icon footprint. Tile height is 54px — small enough
// that the sticker doesn't crash into the label on the left.
const TILE_H = 54;
const ICON_RATIO = 65 / 45; // viewBox width / height
const ICON_H = TILE_H;
const ICON_W = Math.round(ICON_H * ICON_RATIO); // 78

const BROWSE: TileSpec[] = [
  {
    label: "Casino",
    href: "/casino",
    icon: "/assets/search/casino.svg",
    iconW: ICON_W,
    iconH: ICON_H,
    iconRight: 0,
    iconTop: 0,
    iconRotate: 0,
  },
  {
    label: "Live Casino",
    href: "/live",
    icon: "/assets/search/live.svg",
    iconW: ICON_W,
    iconH: ICON_H,
    iconRight: 0,
    iconTop: 0,
    iconRotate: 0,
  },
  {
    label: "Bingo",
    href: "/bingo",
    icon: "/assets/search/bingo.svg",
    iconW: ICON_W,
    iconH: ICON_H,
    iconRight: 0,
    iconTop: 0,
    iconRotate: 0,
  },
  {
    label: "Arena",
    href: "/arena",
    icon: "/assets/search/arena.svg",
    iconW: ICON_W,
    iconH: ICON_H,
    iconRight: 0,
    iconTop: 0,
    iconRotate: 0,
  },
];

// Game tile pools — small re-usable arrays for the Hot Right Now,
// Slots, Quick games and Live Casino rails. Tiles are 109×109
// square (matches the lobby's "Hot right now" rail).
const G = (i: number, alt: string) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt,
});

// Three side-scrolling rails that sit between the Casino mega-card
// and Browse all categories. Same slot-NN art pool, just sequenced
// differently so each rail feels distinct.
const TILES_EXCLUSIVE = [
  G(7, "Mummy Mania"),
  G(11, "Maze Escape"),
  G(1, "Buffalo Bills"),
  G(13, "Snake Arena"),
  G(4, "Jewel Stepper"),
  G(8, "Tiki Tumble"),
  G(3, "Big Bass Splash"),
];

const TILES_TOP_PICKS = [
  G(13, "Snake Arena"),
  G(1, "Buffalo Bills"),
  G(8, "Tiki Tumble"),
  G(11, "Maze Escape"),
  G(7, "Mummy Mania"),
  G(4, "Jewel Stepper"),
  G(12, "Western Gold"),
];

const TILES_PICKED_BY_Q = [
  G(4, "Jewel Stepper"),
  G(8, "Tiki Tumble"),
  G(11, "Maze Escape"),
  G(13, "Snake Arena"),
  G(1, "Buffalo Bills"),
  G(7, "Mummy Mania"),
  G(5, "Golden Catch"),
];

// Bingo rail — 109×109 lobby art (same square-tile rail as the
// editorial rows above). Tile names mirror the live MrQ bingo rooms.
const TILES_BINGO = [
  { src: "/assets/bingo/lobby-tropic-like-its-hot.png", alt: "Tropic Like It's Hot" },
  { src: "/assets/bingo/lobby-cheap-as-chips.png", alt: "Cheap As Chips" },
  { src: "/assets/bingo/lobby-dab-and-disco.png", alt: "Dab And Disco" },
  { src: "/assets/bingo/lobby-on-the-house.png", alt: "On The House" },
  { src: "/assets/bingo/lobby-pinch-a-penny.png", alt: "Pinch A Penny" },
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

// Group 3 — closing verticals. Bingo (violet) + Arena (amber).
//
// Previous bright pink (#DB2777) + bright red (#DC2626) jumped out
// of the blue brand palette above them — they read as "this used
// to be a different design" rather than "next vertical". The new
// pair stays on-brand:
//
//   • Bingo  → #7C3AED  Violet 600 — purple is the natural sibling
//                       of brand blue (analogous on the wheel),
//                       reads playful + complements rather than
//                       fights the brand-blue Casino cards above.
//   • Arena  → #B45309  Amber 700 — warm complement to the cool
//                       blue palette, ties back to the splash
//                       gate's yellow brand accent (#ffd400). The
//                       warmth signals "competition / prizes",
//                       differentiating Arena from the cool
//                       lobby browsing verticals.
//
// Both still link to their dedicated lobby pages.
const VERTICAL_CARDS: Theme[] = [
  { key: "bingo", label: "Bingo", color: "#7C3AED", href: "/bingo", thumbs: CATEGORY_THUMBS.bingo },
  { key: "arena", label: "Arena", color: "#B45309", href: "/arena", thumbs: CATEGORY_THUMBS.arena },
];

const BROWSE_CATEGORIES: Theme[] = [
  ...CASINO_CARDS,
  ...LIVE_CASINO_CARDS,
  ...VERTICAL_CARDS,
];

// Stub data for the "Recently searched" takeover state — would be
// driven by real user history once we have one.
const RECENTLY_SEARCHED: Array<{ src: string; name: string; href?: string }> = [
  { src: "/assets/games/slot-01.png", name: "Buffalo Bills", href: "/play/buffalo-bills" },
  { src: "/assets/games/slot-04.png", name: "Jewel Stepper" },
  { src: "/assets/games/slot-08.png", name: "Tiki Tumble" },
  { src: "/assets/games/slot-13.png", name: "Big Bass Real Repeat" },
  { src: "/assets/games/slot-11.png", name: "Maze Escape" },
  { src: "/assets/games/slot-03.png", name: "Snake Arena" },
  { src: "/assets/games/slot-05.png", name: "Western Gold" },
  { src: "/assets/games/slot-07.png", name: "Golden Catch" },
];

// The searchable catalogue now lives in `games-catalogue.ts` as full
// GameDetails records (name, src, rtp, volatility, provider, numeric
// rtpValue/minBet/maxBet, …). The page reads it via `getAllGames()` so
// the search modal can filter & sort on those facets — see SearchPage.

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ----- Filtering state -----
  const [filters, setFilters] = useState<GameFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("relevance");

  // Static catalogue-derived data (stable across renders).
  const allGames = useMemo<SearchableGame[]>(() => SEARCHABLE_GAMES, []);
  const providers = useMemo(() => getAllProviders(), []);

  const hasQueryOrFilters =
    query.trim().length > 0 || countActiveFilters(filters) > 0;

  // The composed result set: text query + facets + sort. Updates live
  // as the user taps a chip — no apply step.
  const results = useMemo(
    () => applyFilters(allGames, query, filters, sort),
    [allGames, query, filters, sort],
  );

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
    haptics.selection();
    setQuery("");
    setFocused(false);
    setFilters(EMPTY_FILTERS);
    setSort("relevance");
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
          onClick={() => {
            haptics.tap();
            setFocused(true);
          }}
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
        {/* Three editorial rails — promotional rows that sit between
            the category mega-card and the full Browse-all-categories
            grid. Reuses GameRail (same component the lobby + Casino
            page use), 109×109 square tiles. */}
        <GameRail
          title="Exclusive to Mr Q"
          tiles={TILES_EXCLUSIVE}
          tileWidth={109}
          tileHeight={109}
        />
        <GameRail
          title="Top Picks"
          tiles={TILES_TOP_PICKS}
          tileWidth={109}
          tileHeight={109}
        />
        <GameRail
          title="Bingo"
          tiles={TILES_BINGO}
          tileWidth={109}
          tileHeight={109}
        />
        <GameRail
          title="Picked For You, By Q"
          tiles={TILES_PICKED_BY_Q}
          tileWidth={109}
          tileHeight={109}
        />
        <LiveCasinoRail />

        <ThemesGrid title="Browse All Categories" items={BROWSE_CATEGORIES} />
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
              className="flex items-center gap-[10px] px-[16px] pb-[12px]"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 14px)",
              }}
            >
              {/* Input pill — magnifying glass + text input. The
                  pill has no inline clear-X (close-modal X outside
                  the pill handles dismissal; the OS keyboard's own
                  clear button covers wiping the text). */}
              <div
                className="flex flex-1 items-center gap-[10px] rounded-full bg-white h-[48px] px-[18px]"
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
                  // No onBlur — losing input focus must NOT close the
                  // modal. On mobile, tapping any non-input element
                  // (a filter chip, a result row, the X button, the
                  // facet dropdown backdrop, etc.) blurs the input.
                  // If we tied modal lifecycle to input focus the
                  // modal would unmount on the first chip tap and the
                  // dropdown would never get to render. The modal
                  // closes only via explicit dismissal: X button, Esc
                  // key, or selecting a result row.
                  className="flex-1 bg-transparent text-[15px] font-bold text-[#0322ac] placeholder:text-[#0322ac] outline-none text-left"
                />
              </div>

              {/* Close-modal X — sits OUTSIDE the input pill so it
                  reads as a separate action. Same brand-blue
                  surface as the pill border for visual coherence. */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close search"
                className="grid size-[40px] place-items-center rounded-full shrink-0 active:scale-[0.92] transition-transform"
                style={{
                  backgroundColor: "rgba(10, 46, 203, 0.10)",
                }}
              >
                <CloseIcon className="size-[16px] text-[var(--mrq-blue)]" />
              </button>
            </div>

            {/* Inline facet bar — one scrollable line of filter chips.
                Tapping a chip expands its options just below; picking a
                value filters the list live (no sheet, no apply step). */}
            <FilterBar
              filters={filters}
              onChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              providers={providers}
              canSort={hasQueryOrFilters}
            />

            <div className="flex-1 overflow-y-auto">
              {/* No query AND no filters → Recently Searched history
                  fallback. Otherwise show the composed (filtered +
                  sorted) results list — updates live as chips change. */}
              {!hasQueryOrFilters ? (
                <RecentlySearched
                  items={RECENTLY_SEARCHED}
                  onRemove={(name) => {
                    // Stub — in a real build this would drop the item
                    // from the user's search history.
                    // eslint-disable-next-line no-console
                    console.log("[Search] remove from history →", name);
                  }}
                />
              ) : (
                <SearchResults
                  query={query}
                  results={results}
                  onSelect={closeModal}
                />
              )}
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
            <div className="flex w-full items-center gap-[14px] rounded-[8px] bg-white pl-[6px] pr-[10px] h-[45px]">
              <ResultBody src={rec.src} name={rec.name} href={rec.href} />
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

/* Composed results list — receives the already filtered + sorted
   games from the page. Each row shows the thumb, name, and a metadata
   line (RTP · volatility · provider) so the filter facets the user
   picked are reflected back in the result. Cards with an `href` route
   when tapped; cards without one fire a console stub. */
function SearchResults({
  query,
  results,
  onSelect,
}: {
  query: string;
  results: SearchableGame[];
  onSelect?: () => void;
}) {
  const trimmed = query.trim();

  return (
    <section className="pt-[16px] pb-[6px]">
      <h2 className="px-[16px] pb-[12px] text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">
        {results.length} {results.length === 1 ? "result" : "results"}
        {trimmed.length > 0 && (
          <span
            className="ml-[6px] font-medium opacity-70"
            style={{ fontWeight: 500 }}
          >
            for &ldquo;{trimmed}&rdquo;
          </span>
        )}
      </h2>

      {results.length === 0 ? (
        <p className="px-[16px] text-[14px] text-[var(--mrq-blue-dark)] opacity-60">
          Nothing matches that — try loosening a filter or a different
          spelling.
        </p>
      ) : (
        <ul className="flex flex-col gap-[10px] px-[16px]">
          {results.map((game, i) => (
            <li key={`${game.name}-${i}`}>
              <div className="flex w-full items-center gap-[14px] rounded-[8px] bg-white pl-[6px] pr-[10px] h-[52px]">
                <ResultBody
                  src={game.src}
                  name={game.name}
                  href={game.href}
                  meta={metaLine(game)}
                  onClick={onSelect}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* Build the secondary line under a result. Adapts per vertical — RTP
   only shows where it exists (bingo has none), and the category is
   always surfaced so cross-vertical results stay legible. */
function metaLine(game: SearchableGame): string {
  const parts: string[] = [game.category];
  if (game.rtp) parts.push(`${game.rtp} RTP`);
  if (game.volatility) parts.push(game.volatility);
  parts.push(game.provider);
  return parts.join(" · ");
}

/* Shared cell body — thumb + name. Renders as a Link when an href
   is provided so the tap navigates; otherwise an inert button. */
function ResultBody({
  src,
  name,
  href,
  meta,
  onClick,
}: {
  src: string;
  name: string;
  href?: string;
  /** Optional secondary line (e.g. "96% RTP · Medium · Pragmatic Play"). */
  meta?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="relative h-[38px] w-[38px] shrink-0 overflow-hidden rounded-[4px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="min-w-0 truncate text-[13px] font-extrabold text-[#0e1120]">
          {name}
        </span>
        {meta && (
          <span className="min-w-0 truncate text-[11px] font-medium text-black/45">
            {meta}
          </span>
        )}
      </span>
    </>
  );
  const classes =
    "flex flex-1 items-center gap-[14px] text-left active:scale-[0.99] transition-transform min-w-0";

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick}>
      {inner}
    </button>
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
  // 54px tile height — small enough that the right-side sticker
  // (sized to fill the tile height) doesn't crash into the label
  // on the left at the narrow 2-column grid width.
  const className =
    "relative h-[54px] overflow-hidden rounded-[10px] active:scale-[0.98] transition-transform";
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

