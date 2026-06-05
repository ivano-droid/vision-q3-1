"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { getGameDetails } from "@/lib/games-catalogue";

/**
 * Generic horizontal-scroll game tile rail — matches the structure of every
 * non-hero row on the home + casino feeds.
 *
 * Entrance: simple fade-up on mount. Earlier versions gated on
 * `bootDone` from the shell context so the deal-in waited for the
 * splash to dissolve, but a dev-mode HMR quirk meant the context value
 * sometimes split between two module instances — the provider's
 * bootDone would flip true but the consumer's stayed false, leaving
 * the rail parked at opacity 0. The splash is opaque while it's up,
 * so animating on mount is visually equivalent and far more robust.
 */
export function GameRail({
  title,
  tiles,
  tileWidth,
  tileHeight,
  showSeeAll = true,
  onSeeAll,
}: {
  title: string;
  tiles: { src: string; alt: string }[];
  tileWidth: number;
  tileHeight: number;
  showSeeAll?: boolean;
  /** Optional click handler for the "See all" button. When omitted the
   *  button is still rendered (if `showSeeAll`) but does nothing —
   *  useful for prototype rails without dedicated landing pages. */
  onSeeAll?: () => void;
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      // Compact vertical padding so adjacent rails stack tightly.
      className="pt-[8px] pb-[10px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-[16px] pb-[10px]">
        <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">{title}</h2>
        {showSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[14px] font-extrabold text-[var(--mrq-blue)]"
          >
            See all
          </button>
        )}
      </div>

      {/* Tile rail */}
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[8px] overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px] pb-2"
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
    </motion.section>
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
  const router = useRouter();
  const details = getGameDetails(alt, src);

  return (
    <button
      type="button"
      aria-label={alt}
      onClick={() => {
        // Tap the tile → launch the game (when we know how) or
        // log a stub for games that aren't wired up yet. The "i"
        // chip below opens the quick-look sheet separately.
        if (details.href) {
          router.push(details.href);
          return;
        }
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[GameRail] open game →", alt);
        }
      }}
      className="relative shrink-0 overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.2)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        draggable={false}
      />
    </button>
  );
}
