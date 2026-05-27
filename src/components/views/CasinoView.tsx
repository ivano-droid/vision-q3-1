"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SwipeableHero, type HeroGame } from "../SwipeableHero";
import { GameRail } from "@/components/rails/GameRail";
import { Top10Rail } from "@/components/rails/Top10Rail";
import { CategoriesSheet } from "../CategoriesSheet";
import {
  CATEGORIES,
  CATEGORY_RAIL_TILES,
  ctaLabelFor,
  tileSet,
} from "@/lib/casino-categories";

/**
 * Casino category page.
 *
 *   ┌──────────────────────────────────────┐
 *   │  ←                          £113.59 ▢│  ← BrandBar (back arrow only)
 *   ├──────────────────────────────────────┤
 *   │  Casino                 Categories+  │  ← In-page header
 *   ├──────────────────────────────────────┤
 *   │  ┌────────────────────────────────┐  │
 *   │  │  [hero artwork]                │  │  ← Swipeable hero
 *   │  └────────────────────────────────┘  │
 *   ├──────────────────────────────────────┤
 *   │  Top 10 Casino Games      See all    │
 *   │  ⓵▢ ⓶▢ ⓷▢ ⓸▢ ⓹▢ …                  │  ← Top 10 rail
 *   │  New                      See all    │
 *   │  ▢▢▢▢▢▢…                            │  ← Sub-category rails
 *   │  Jackpot                  See all    │
 *   │  ▢▢▢▢▢▢…                            │
 *   │  Megaways                 See all    │
 *   │  ▢▢▢▢▢▢…                            │
 *   │  Slingo                   See all    │
 *   │  ▢▢▢▢▢▢…                            │
 *   └──────────────────────────────────────┘
 *
 * The "Categories+" pill opens the CategoriesSheet bottom sheet, which
 * filters the rails to the chosen sub-category (e.g. "Jackpots+") while
 * keeping the user on `/casino`. Each rail's "See all" link still takes
 * the user to the dedicated /casino/[category] page.
 *
 * Selecting "All games" from the sheet clears the filter, returning to
 * the full multi-rail feed.
 */

const HERO_DECK: HeroGame[] = [
  {
    src: "/assets/games/birds-on-a-wire.png",
    alt: "Birds on a Wire",
    title: "Birds on a Wire",
    rtp: "96.91%",
    exclusive: true,
  },
  {
    src: "/assets/games/south-park.png",
    alt: "South Park",
    title: "South Park",
    rtp: "96.55%",
  },
  {
    src: "/assets/games/fruit-warp.png",
    alt: "Fruit Warp",
    title: "Fruit Warp",
    rtp: "97%",
    exclusive: true,
  },
  {
    src: "/assets/games/wild-swarm.png",
    alt: "Wild Swarm",
    title: "Wild Swarm",
    rtp: "96.32%",
  },
];

// Top 10 is a cross-category curated feed, independent of the filter.
const TOP_10 = tileSet([1, 4, 7, 2, 9, 11, 13, 5, 8, 3], "Top 10");

export function CasinoView() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const ctaLabel = useMemo(() => ctaLabelFor(selected), [selected]);

  // When a sub-category is active, show only that rail. Otherwise show
  // all of them in CATEGORIES order. Top 10 is shown either way.
  const visibleCategories = selected
    ? CATEGORIES.filter((c) => c.key === selected)
    : CATEGORIES;

  return (
    <>
      {/* In-page header: title on the left, Categories CTA on the right.
          Lives in the white content area (not the blue brand bar) so it
          reads as a section heading on the page itself. */}
      <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[18px]">
        <h1 className="text-[28px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
          Casino
        </h1>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          // Matches Figma 177:35024: 30px tall, 4px rounded rect (NOT
          // a pill), pale blue/200 fill, white extrabold label.
          className="h-[30px] px-[14px] rounded-[4px] text-[16px] font-extrabold text-white active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "#9DABEA" }}
        >
          {ctaLabel}
        </button>
      </div>

      <div className="flex flex-col">
        {/* Tinder-style swipeable hero (always on, regardless of filter).
            pb-[24px] gives the hero breathing room above the next
            section title; previously it was crashing into "Top 10". */}
        <div className="pb-[24px]">
          <SwipeableHero games={HERO_DECK} />
        </div>

        {/* Top 10 — present whether or not a category is filtered. */}
        <Top10Rail tiles={TOP_10} />

        {/* Per-category rails. When a sub-category is selected the rest
            collapse away; when none is selected all six show. Each row
            navigates to /casino/[key] via the See all link. */}
        {visibleCategories.map((cat) => (
          <GameRail
            key={cat.key}
            title={cat.label}
            tiles={CATEGORY_RAIL_TILES[cat.key] ?? []}
            tileWidth={109}
            tileHeight={109}
            onSeeAll={() => router.push(`/casino/${cat.key}`)}
          />
        ))}
      </div>

      <CategoriesSheet
        open={sheetOpen}
        selected={selected}
        categories={CATEGORIES}
        onSelect={setSelected}
        onClose={() => setSheetOpen(false)}
        title="Casino categories"
      />
    </>
  );
}
