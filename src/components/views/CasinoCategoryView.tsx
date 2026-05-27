"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useShell } from "@/lib/filter-context";
import { CategoriesSheet } from "../CategoriesSheet";
import {
  CATEGORIES,
  CATEGORY_GRID_TILES,
} from "@/lib/casino-categories";

/**
 * Per-category Casino page, e.g. `/casino/jackpot` or `/casino/new`.
 *
 *   ┌──────────────────────────────────────┐
 *   │  ←                          £113.59 ▢│  ← BrandBar (back arrow only)
 *   ├──────────────────────────────────────┤
 *   │  Casino                 Jackpots+    │  ← In-page header
 *   │  Browse all Jackpot games            │  ← Sub-line names category
 *   ├──────────────────────────────────────┤
 *   │  ▢▢▢ ▢▢▢ ▢▢▢                        │  ← 3-col tile grid
 *   │  ▢▢▢ ▢▢▢ ▢▢▢                        │
 *   │  ▢▢▢ ▢▢▢ ▢▢▢                        │
 *   └──────────────────────────────────────┘
 *
 * Title stays "Casino" so the user always knows which vertical they're
 * inside; the active sub-category is communicated by (a) the pluralised
 * CTA pill on the right ("Jackpots+", "Tables+"), and (b) the
 * "Browse all X games" sub-line below the title.
 *
 * Tapping the pill opens the same CategoriesSheet as /casino, letting
 * the user hop between sub-categories without going back to the main
 * page. Selecting "All games" returns to the /casino feed.
 */

function labelFor(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function ctaLabelForCategory(key: string): string {
  const label = labelFor(key);
  const plural = label.endsWith("s") ? label : `${label}s`;
  return `${plural}+`;
}

export function CasinoCategoryView({ category }: { category: string }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  const label = useMemo(() => labelFor(category), [category]);
  const ctaLabel = useMemo(() => ctaLabelForCategory(category), [category]);
  const tiles = CATEGORY_GRID_TILES[category] ?? [];

  // Hop to another sub-category page from the sheet. Picking "All
  // games" (key === null) goes back to the main /casino feed.
  const handleSelect = (key: string | null) => {
    if (key === null) router.push("/casino");
    else if (key !== category) router.push(`/casino/${key}`);
  };

  // Per-card deal-in (shared timing with GameRail).
  const gridVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: reduce ? 0 : 0.35,
      },
    },
  };
  const tileVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      {/* In-page header. Title + CTA pill, same pattern as /casino. */}
      <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[6px]">
        <h1 className="text-[28px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
          Casino
        </h1>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          // Matches Figma 177:35024: pale blue/200 4px-rounded rect.
          className="h-[30px] px-[14px] rounded-[4px] text-[16px] font-extrabold text-white active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "#9DABEA" }}
        >
          {ctaLabel}
        </button>
      </div>
      <p className="px-[16px] pb-[12px] text-[14px] font-bold text-[var(--mrq-blue-dark)] opacity-70">
        Browse all {label} games
      </p>

      {/* 3-column tile grid. Tiles match the GameRail dimensions
          (square, ~109px wide on a 375px viewport) for visual
          continuity with the main feed. */}
      <motion.div
        className="grid grid-cols-3 gap-[8px] px-[16px] pb-[24px]"
        initial={reduce ? false : "hidden"}
        animate={reduce || bootDone ? "visible" : "hidden"}
        variants={gridVariants}
      >
        {tiles.map((tile, i) => (
          <motion.button
            key={`${tile.src}-${i}`}
            type="button"
            variants={tileVariants}
            aria-label={tile.alt}
            className="relative aspect-square overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.2)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            />
          </motion.button>
        ))}
      </motion.div>

      <CategoriesSheet
        open={sheetOpen}
        selected={category}
        categories={CATEGORIES}
        onSelect={handleSelect}
        onClose={() => setSheetOpen(false)}
        title="Casino categories"
      />
    </>
  );
}
