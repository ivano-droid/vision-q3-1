"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { getGameDetails } from "@/lib/games-catalogue";

/**
 * "Top 10 Casino Games" — horizontal rail where each item pairs a big
 * pale-blue numeral (1..10) with a square game tile to its right.
 *
 *   ┌────────────────────────────────────────────┐
 *   │  Top 10 Casino games                       │
 *   │ ╔═╗ ▢▢▢   ╔═╗ ▢▢▢   ╔═╗ ▢▢▢   ╔═╗ ▢▢▢ … │
 *   │ ║1║ ▢▢▢   ║2║ ▢▢▢   ║3║ ▢▢▢   ║4║ ▢▢▢   │
 *   │ ╚═╝       ╚═╝       ╚═╝       ╚═╝         │
 *   └────────────────────────────────────────────┘
 *
 * Numerals are solid #CED5F5 Gilroy ExtraBold at huge size — they
 * read as a pale ranked backdrop rather than an outlined badge. Tap
 * target is the paired numeral + tile as a single button so the
 * whole unit feels like one game.
 *
 * Entrance is a single section-level fade-up (same pattern as
 * ThemesGrid + the mega-cards rail) so the whole page animates in
 * consistently. Earlier versions used Framer's variant-name
 * propagation for per-card stagger, but variants sometimes failed to
 * propagate to children and the rail rendered at opacity 0.
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

  // Clamp to ten — extras are dropped so the rail always reads as a
  // proper Top 10 list, not a Top-N.
  const top10 = tiles.slice(0, 10);

  return (
    <motion.section
      aria-label={title}
      className="pt-[8px] pb-[10px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left-aligned title, no "See all" — Top 10 reads as a curated
          showcase rather than a row that drills into a larger list. */}
      <div className="px-[16px] pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">
          {title}
        </h2>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex items-end gap-[4px] overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px] pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {top10.map((tile, i) => (
          <Top10Item key={`${tile.src}-${i}`} rank={i + 1} tile={tile} />
        ))}
      </div>
    </motion.section>
  );
}

function Top10Item({ rank, tile }: { rank: number; tile: Top10Tile }) {
  const router = useRouter();
  const details = getGameDetails(tile.alt, tile.src);

  return (
    <button
      type="button"
      aria-label={`#${rank} ${tile.alt}`}
      onClick={() => {
        if (details.href) {
          router.push(details.href);
          return;
        }
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[Top10] open game →", tile.alt);
        }
      }}
      className="flex items-end shrink-0 active:scale-[0.98] transition-transform"
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
  const width = isTen ? 86 : 60;

  return (
    <span
      aria-hidden
      className="shrink-0 grid place-items-center"
      style={{ width: `${width}px`, height: "100px" }}
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
