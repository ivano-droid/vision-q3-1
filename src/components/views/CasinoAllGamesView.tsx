"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CategoriesSheet } from "../CategoriesSheet";
import { ChevronDownIcon } from "../CategoryChevron";
import { getGameDetails, type GameDetails } from "@/lib/games-catalogue";
import { ALL_GAMES_TILES, CATEGORIES } from "@/lib/casino-categories";

/**
 * Dedicated "All games" page — lives at /casino/games.
 *
 *   ┌──────────────────────────────────────┐
 *   │  ←                          £113.59 ▢│  ← BrandBar (back → /casino)
 *   ├──────────────────────────────────────┤
 *   │  Casino                  All games+  │  ← Header
 *   │  Browse all Casino games             │
 *   ├──────────────────────────────────────┤
 *   │  ▢▢▢ ▢▢▢ ▢▢▢                        │  ← 3-col grid of every game
 *   │  ▢▢▢ ▢▢▢ ▢▢▢                        │
 *   │  ▢▢▢ ▢▢▢ ▢▢▢                        │
 *   └──────────────────────────────────────┘
 *
 * Renders a flat 3-col grid of every game across all sub-categories.
 * The Categories+ pill opens the same bottom-sheet picker used on the
 * other Casino routes; selecting a sub-category hops to that
 * sub-category's page, and "All games" stays here.
 */
export function CasinoAllGamesView() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduce = useReducedMotion();

  const handleSelect = (key: string | null) => {
    if (key === null) {
      // Already here — just dismiss the sheet (handled by onClose).
      return;
    }
    router.push(`/casino/${key}`);
  };

  return (
    <>
      {/* In-page header. */}
      <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[6px]">
        <h1 className="text-[28px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
          Casino
        </h1>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          // Shared chevron-down pill — pale lavender bg, navy label,
          // chevron-down on the right. Matches /casino, /casino/[cat],
          // and Arena's Dashboard pill.
          className="inline-flex items-center gap-[6px] h-[30px] pl-[14px] pr-[12px] rounded-full text-[16px] font-extrabold active:scale-[0.97] transition-transform"
          style={{
            backgroundColor: "#dee3f7",
            color: "var(--mrq-blue-dark)",
          }}
        >
          <span>All games</span>
          <ChevronDownIcon size={14} />
        </button>
      </div>
      <p className="px-[16px] pb-[12px] text-[14px] font-bold text-[var(--mrq-blue-dark)] opacity-70">
        Browse all Casino games
      </p>

      {/* 3-col tile grid — same dimensions as the per-category page so
          the All games view feels like a longer scroll of the same
          family of tiles. */}
      <motion.div
        className="grid grid-cols-3 gap-[8px] px-[16px] pb-[24px]"
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {ALL_GAMES_TILES.map((tile, i) => (
          <AllGamesTile key={`${tile.src}-${i}`} tile={tile} />
        ))}
      </motion.div>

      <CategoriesSheet
        open={sheetOpen}
        // Pass null so "All games" reads as the active row in the
        // sheet — we're already on the all-games page.
        selected={null}
        categories={CATEGORIES}
        onSelect={handleSelect}
        onClose={() => setSheetOpen(false)}
        // Sub-route → offer a quick hop back to the curated /casino
        // homepage. Sheet handles closing itself after the tap.
        onHome={() => router.push("/casino")}
        title="Casino Categories"
      />
    </>
  );
}

/* All-games grid tile — tap launches the game (when known) or
   stubs; the i chip opens the quick-look sheet. */
function AllGamesTile({
  tile,
}: {
  tile: { src: string; alt: string };
}) {
  const router = useRouter();
  const details: GameDetails = getGameDetails(tile.alt, tile.src);

  return (
    <button
      type="button"
      aria-label={tile.alt}
      onClick={() => {
        if (details.href) {
          router.push(details.href);
          return;
        }
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[CasinoAllGames] open game →", tile.alt);
        }
      }}
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
    </button>
  );
}
