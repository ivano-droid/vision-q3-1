"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useShell } from "@/lib/filter-context";

/**
 * "Top 10 Casino Games" — horizontal rail where each item pairs a big
 * outlined yellow numeral (1..10) with a square game tile to its right.
 *
 *   ┌────────────────────────────────────────────┐
 *   │ ╔═╗ ▢▢▢   ╔═╗ ▢▢▢   ╔═╗ ▢▢▢   ╔═╗ ▢▢▢ … │
 *   │ ║1║ ▢▢▢   ║2║ ▢▢▢   ║3║ ▢▢▢   ║4║ ▢▢▢   │
 *   │ ╚═╝       ╚═╝       ╚═╝       ╚═╝         │
 *   └────────────────────────────────────────────┘
 *
 * Numerals use Anton (condensed, heavy) with a yellow stroke + the
 * lobby's pale background showing through, mirroring the Netflix-style
 * "top 10" treatment from the Figma reference. Tap target is the
 * paired tile + numeral as a single button so the whole unit feels
 * like one game.
 */

export type Top10Tile = { src: string; alt: string };

export function Top10Rail({
  title = "Top 10 Casino Games",
  tiles,
}: {
  title?: string;
  tiles: Top10Tile[];
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.18, delay: reduce ? 0 : 0.25 },
    },
  };

  const rowVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: reduce ? 0 : 0.35,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Clamp to ten — extras are dropped so the rail always reads as a
  // proper Top 10 list, not a Top-N.
  const top10 = tiles.slice(0, 10);

  return (
    <motion.section
      aria-label={title}
      className="pt-[8px] pb-[10px]"
      initial={reduce ? false : "hidden"}
      animate={reduce || bootDone ? "visible" : "hidden"}
    >
      {/* Centred title, no "See all" — matches the Figma where Top 10
          reads as a curated showcase, not a row that drills into a
          larger list. */}
      <motion.div
        className="px-[16px] pb-[10px]"
        variants={titleVariants}
      >
        <h2 className="text-center text-[18px] font-extrabold text-[var(--mrq-blue)]">
          {title}
        </h2>
      </motion.div>

      <motion.div
        ref={railRef}
        className="no-scrollbar flex items-end gap-[4px] overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px] pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
        variants={rowVariants}
      >
        {top10.map((tile, i) => (
          <motion.div key={`${tile.src}-${i}`} variants={itemVariants} className="shrink-0">
            <Top10Item rank={i + 1} tile={tile} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

function Top10Item({ rank, tile }: { rank: number; tile: Top10Tile }) {
  return (
    <button
      type="button"
      aria-label={`#${rank} ${tile.alt}`}
      className="flex items-end shrink-0 active:scale-[0.99] transition-transform"
    >
      <RankNumeral rank={rank} />
      <span
        className="relative shrink-0 overflow-hidden rounded-[12px] -ml-[14px]"
        style={{
          width: "109px",
          height: "109px",
          boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.2)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.src}
          alt={tile.alt}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          draggable={false}
        />
      </span>
    </button>
  );
}

/**
 * Big numeral solid-filled in brand/blue/100 (#CED5F5) — matches the
 * Figma reference where the rank reads as a pale tinted backdrop next
 * to the tile rather than a punchy outlined badge. SVG `<text>` is
 * used so the glyph stays crisp at any density.
 *
 * "10" is wider than 1-9, so the SVG viewBox flexes to fit it without
 * the digits getting horizontally squashed.
 */
function RankNumeral({ rank }: { rank: number }) {
  const isTen = rank === 10;
  // Width swap accommodates the wider "10" glyph without distorting
  // the single-digit numerals.
  const width = isTen ? 86 : 60;

  return (
    <span
      aria-hidden
      className="shrink-0 grid place-items-center"
      style={{
        width: `${width}px`,
        height: "100px",
      }}
    >
      <svg
        viewBox={`0 0 ${width} 100`}
        width={width}
        height={100}
        style={{ overflow: "visible" }}
      >
        <text
          x={width / 2}
          y="86"
          textAnchor="middle"
          // Gilroy ExtraBold (the Manrope variable) instead of Anton —
          // matches the Figma which uses the brand body font at huge
          // size, not the condensed promo font.
          fontFamily="var(--font-manrope), Manrope, Gilroy, sans-serif"
          fontSize="108"
          fontWeight={800}
          fill="#CED5F5"
          style={{ letterSpacing: "-0.02em" }}
        >
          {rank}
        </text>
      </svg>
    </span>
  );
}
