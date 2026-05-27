"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useShell } from "@/lib/filter-context";

/**
 * "Discover new games" — horizontal scrolling row of circular game
 * thumbnails. Each thumb is a ~65px round avatar with a thick white
 * border (so they read like Instagram stories chips), arranged side
 * by side and draggable left/right.
 *
 *   ┌──────────────────────────────────────────┐
 *   │  Discover new games                      │
 *   │  ◯ ◯ ◯ ◯ ◯ …                            │
 *   └──────────────────────────────────────────┘
 *
 * Entrance: the whole section fades + lifts in once `bootDone` flips
 * (matches the simple opacity-y animation used by ThemesGrid and the
 * mega-cards rail on the same page). The earlier draft used Framer's
 * variant-name propagation (`initial="hidden"` / `animate="visible"`)
 * but that left the children stuck at opacity 0 here — switching to a
 * direct object animation on the section is the same pattern that
 * works elsewhere on the page.
 */

export type DiscoverTile = { src: string; alt: string };

export function DiscoverNewGames({ tiles }: { tiles: DiscoverTile[] }) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  return (
    <motion.section
      aria-label="Discover new games"
      className="pt-[8px] pb-[12px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={
        reduce || bootDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="pb-[10px] px-[16px] text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">
        Discover new games
      </h2>

      <div
        ref={railRef}
        className="no-scrollbar flex gap-[8px] overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tiles.map((tile, i) => (
          <button
            key={`${tile.src}-${i}`}
            type="button"
            aria-label={tile.alt}
            className="relative shrink-0 size-[65px] rounded-full overflow-hidden active:scale-[0.95] transition-transform"
            style={{
              // Thick white frame ringed by the brand-blue gradient so
              // each thumb reads as a "story chip". Matches Figma
              // 177:35921 (68×65 frame with 57×57 tile inside, ~4px
              // visible white ring).
              border: "3px solid #ffffff",
              boxShadow:
                "0 0 0 1.5px var(--mrq-blue), 0 4px 10px -4px rgba(10, 46, 203, 0.25)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            />
          </button>
        ))}
      </div>
    </motion.section>
  );
}
