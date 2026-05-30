"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CategoriesSheet } from "../CategoriesSheet";
import { ChevronDownIcon } from "../CategoryChevron";
import { LiveGameRail } from "@/components/rails/LiveGameRail";
import {
  LIVE_CATEGORIES,
  LIVE_GAMES_BY_CATEGORY,
} from "@/lib/live-categories";

/**
 * Per-category Live Casino page, e.g. `/live/roulette`.
 *
 * Same header pattern as CasinoCategoryView (title + pluralised CTA
 * pill + "Browse all X games" sub-line), but the body is a single
 * full-width LiveGameRail listing every game in the category. Cards
 * are too information-dense (player count, dealer, min-bet, spin
 * history) for a 3-col grid like /casino/[category] — they need a
 * proper rail to breathe.
 */

function labelFor(key: string): string {
  return LIVE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function ctaLabelForCategory(key: string): string {
  const label = labelFor(key);
  // "Game Shows" is already plural; pass it through.
  if (label.toLowerCase().endsWith("s")) return label;
  return `${label}s`;
}

export function LiveCategoryView({ category }: { category: string }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduce = useReducedMotion();

  const label = useMemo(() => labelFor(category), [category]);
  const ctaLabel = useMemo(() => ctaLabelForCategory(category), [category]);
  const games = LIVE_GAMES_BY_CATEGORY[category] ?? [];

  const handleSelect = (key: string | null) => {
    if (key && key !== category) router.push(`/live/${key}`);
  };

  return (
    <>
      <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[6px]">
        <h1 className="text-[28px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
          Live Casino
        </h1>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          className="inline-flex items-center gap-[6px] h-[30px] pl-[14px] pr-[12px] rounded-full text-[16px] font-extrabold active:scale-[0.97] transition-transform"
          style={{
            backgroundColor: "#dee3f7",
            color: "var(--mrq-blue-dark)",
          }}
        >
          <span>{ctaLabel}</span>
          <ChevronDownIcon size={14} />
        </button>
      </div>
      <p className="px-[16px] pb-[6px] text-[14px] font-bold text-[var(--mrq-blue-dark)] opacity-70">
        Browse all {label} games
      </p>

      {/* Single full-width rail listing every game in this category.
          Identical card style to the /live homepage rails so the
          user reads the page as "the rail, but in full" rather than
          a new grid type. */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <LiveGameRail
          title={label === "Game Shows" ? "Live Gameshows" : label}
          games={games}
        />
      </motion.div>

      <CategoriesSheet
        open={sheetOpen}
        selected={category}
        categories={LIVE_CATEGORIES}
        onSelect={handleSelect}
        onClose={() => setSheetOpen(false)}
        onHome={() => router.push("/live")}
        title="Live Casino Categories"
        hideAllGames
      />
    </>
  );
}
