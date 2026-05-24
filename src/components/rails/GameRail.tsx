"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useMemo } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useFilter } from "@/lib/filter-context";

/**
 * Generic horizontal-scroll game tile rail — matches the structure of every
 * non-hero row on vision-01.vercel.app (Picked For You, By Q / Recently
 * played / Fresh from Q / Explore gameplays).
 *
 * Casino "deal-in" entrance:
 *   - The section title fades in first (~150ms)
 *   - Cards then animate one-by-one left-to-right with a 60ms stagger,
 *     coming in from x:-16, y:10, scale:0.95, with a small ±4° rotation
 *     baked in per-card so they feel like cards being dealt at a table
 *   - Each card takes ~280ms to settle
 *   - Respects prefers-reduced-motion (animations skipped entirely)
 */
export function GameRail({
  title,
  tiles,
  tileWidth,
  tileHeight,
  showSeeAll = true,
}: {
  title: string;
  tiles: { src: string; alt: string }[];
  tileWidth: number;
  tileHeight: number;
  showSeeAll?: boolean;
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();
  const { bootDone } = useFilter();

  // Stable per-card rotations between -4° and +4°. Memoised on the tile list
  // so the values don't churn on every render — each card keeps the same
  // "lean" through its entrance.
  const rotations = useMemo(
    () => tiles.map(() => (Math.random() - 0.5) * 8),
    [tiles],
  );

  // Entrance timing is offset from `bootDone` so the splash wrapper has
  // 250ms to fade away before any cards start moving. Without these
  // delays the tiles deal in behind an opaque-then-fading splash and the
  // user only sees the tail end as the splash unmounts.
  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.18, delay: reduce ? 0 : 0.25 } },
  };

  const dealRowVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        // Wait for the splash wrapper to clear (~250ms) + a beat for the
        // title to fade in (~100ms) before the first card starts.
        delayChildren: reduce ? 0 : 0.35,
      },
    },
  };

  return (
    <motion.section
      aria-label={title}
      className="py-3"
      // Hold the cards in their hidden variant until the loading splash flips
      // `bootDone`. Otherwise the entire deal-in plays out behind the splash
      // and the user never sees a single card actually arrive.
      initial={reduce ? false : "hidden"}
      animate={reduce || bootDone ? "visible" : "hidden"}
    >
      {/* Header row */}
      <motion.div
        className="flex items-center justify-between px-[16px] pb-[10px]"
        variants={titleVariants}
      >
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">{title}</h2>
        {showSeeAll && (
          <button
            type="button"
            className="text-[14px] font-extrabold text-[var(--mrq-blue)]"
          >
            See all
          </button>
        )}
      </motion.div>

      {/* Tile rail — staggered children */}
      <motion.div
        ref={railRef}
        className="no-scrollbar flex gap-[8px] overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px] pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
        variants={dealRowVariants}
      >
        {tiles.map((tile, i) => (
          <DealCard key={`${tile.src}-${i}`} rotation={rotations[i] ?? 0}>
            <GameTile src={tile.src} alt={tile.alt} width={tileWidth} height={tileHeight} />
          </DealCard>
        ))}
      </motion.div>
    </motion.section>
  );
}

/** Wrapper that gives a single tile its "dealt-in" entrance variant. */
function DealCard({ rotation, children }: { rotation: number; children: React.ReactNode }) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: -16,
      y: 10,
      scale: 0.95,
      rotate: rotation,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div variants={variants} className="shrink-0">
      {children}
    </motion.div>
  );
}

function GameTile({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <button
      type="button"
      className="relative shrink-0 overflow-hidden rounded-[12px] active:scale-[0.99] transition-transform"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.2)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        draggable={false}
      />
    </button>
  );
}
