"use client";

import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/**
 * Generic horizontal-scroll game tile rail — matches the structure of every
 * non-hero row on vision-01.vercel.app (Picked For You, By Q / Recently
 * played / Fresh from Q / Explore gameplays).
 *
 * Layout:
 *   ┌───────────────────────────────────────────┐
 *   │  Section title                  See all → │
 *   │  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐ ...   │
 *   │  │  │  │  │  │  │  │  │  │  │  │  │       │
 *   │  └──┘  └──┘  └──┘  └──┘  └──┘  └──┘       │
 *   └───────────────────────────────────────────┘
 *
 * Behaviour:
 *   - Horizontal flick on touch (native via `overflow-x: auto`)
 *   - Click-and-drag on desktop (via `useDraggableScroll`)
 *   - Hidden scrollbar
 *   - `scroll-padding-left: 16px` so snap targets respect the rail's left
 *     padding — otherwise `snap-proximity` would pull the first tile flush
 *     against the screen edge, defeating the indent.
 *   - Tile dimensions come in via props so the same component handles
 *     109×164, 126×189, 57×85, etc.
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

  return (
    <section aria-label={title} className="py-3">
      {/* Header row */}
      <div className="flex items-center justify-between px-[16px] pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">{title}</h2>
        {showSeeAll && (
          <button
            type="button"
            className="text-[14px] font-extrabold text-[var(--mrq-blue)]"
          >
            See all
          </button>
        )}
      </div>

      {/* Tile rail — free scrolling, no snapping (mobile-app feel) */}
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[8px] overflow-x-auto pl-[16px] pr-[16px] pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tiles.map((tile, i) => (
          <GameTile
            key={`${tile.src}-${i}`}
            src={tile.src}
            alt={tile.alt}
            width={tileWidth}
            height={tileHeight}
          />
        ))}
      </div>
    </section>
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
      className="relative shrink-0 overflow-hidden rounded-[12px] active:scale-[0.97] transition-transform"
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
