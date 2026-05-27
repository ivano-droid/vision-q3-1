"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useShell } from "@/lib/filter-context";

/**
 * Category mega-cards — a horizontal snap rail of large white cards
 * (Casino, Live Casino, Bingo, Arena), each carrying its category
 * sticker + a "Hot right now" sub-block of 6 game thumbnails inside.
 *
 *   ┌────────────────────────────┐ ┌────────
 *   │ [7] Casino       See all  │ │ [A] Liv
 *   │     Hot right now         │ │     Ho
 *   │  ▢ ▢ ▢                    │ │   ▢ ▢
 *   │  ▢ ▢ ▢                    │ │   ▢ ▢
 *   └────────────────────────────┘ └────────
 *
 * Cards snap-anchor to the 16px page gutter (via scroll-padding-left)
 * just like the hero carousel. Each card's internal grid is a fixed
 * 2-row × 3-col 72px tile arrangement so the cards land at a
 * consistent height regardless of which category they represent.
 */

export type MegaCardCategory = {
  key: string;
  title: string;
  subtitle: string;
  sticker: string;
  /** Up to 6 tiles — the layout reserves space for 2×3. */
  tiles: Array<{ src: string; alt: string }>;
  /** Optional href for "See all" navigation. */
  seeAllHref?: string;
};

export function CategoryMegaCardsRail({
  categories,
}: {
  categories: MegaCardCategory[];
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  return (
    <motion.section
      aria-label="Browse by category"
      className="pt-2 pb-3"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={
        reduce || bootDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[12px] overflow-x-auto pl-[16px] pr-[16px] snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          // Match the hero carousel's snap-padding trick so every
          // category card lands its left on the 16px gutter.
          scrollPaddingLeft: "16px",
        }}
      >
        {categories.map((cat) => (
          <MegaCard key={cat.key} category={cat} />
        ))}
      </div>
    </motion.section>
  );
}

function MegaCard({ category }: { category: MegaCardCategory }) {
  return (
    <div
      className="shrink-0 snap-start overflow-hidden rounded-[14px] bg-white"
      style={{
        // ~82% of viewport so a sliver of the next card peeks on
        // the right edge.
        width: "min(82%, calc(var(--mobile-width) - 60px))",
        boxShadow: "0 6px 16px -8px rgba(10, 46, 203, 0.18)",
      }}
    >
      {/* Header row: sticker + title block + See all */}
      <div className="flex items-center px-[14px] pt-[12px] pb-[10px] gap-[10px]">
        {/* Sticker — uses the same PNGs as the Start Browsing
            tiles but un-tilted, sized to the card's header. */}
        <div className="shrink-0 size-[40px] grid place-items-center">
          <Image
            src={category.sticker}
            alt=""
            width={48}
            height={48}
            className="size-[40px] object-contain"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-extrabold leading-tight text-[var(--mrq-blue)]">
            {category.title}
          </p>
          <p className="text-[12px] font-bold leading-tight text-[var(--mrq-blue-dark)] opacity-70">
            {category.subtitle}
          </p>
        </div>
        <button
          type="button"
          className="text-[13px] font-extrabold text-[var(--mrq-blue)] shrink-0"
        >
          See all
        </button>
      </div>

      {/* 2 × 3 game tile grid */}
      <div className="grid grid-cols-3 gap-[8px] px-[14px] pb-[14px]">
        {Array.from({ length: 6 }).map((_, i) => {
          const tile = category.tiles[i];
          if (!tile) {
            return (
              <span
                key={i}
                aria-hidden
                className="aspect-square rounded-[10px] bg-[#f5f5f5]"
              />
            );
          }
          return (
            <button
              key={`${tile.src}-${i}`}
              type="button"
              aria-label={tile.alt}
              className="relative aspect-square overflow-hidden rounded-[10px] active:scale-[0.98] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.src}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
