"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { getGameDetails } from "@/lib/games-catalogue";

/**
 * "Recently played" — a mini side-scrolling rail of square game tiles.
 *
 *   Recently Played Games
 *   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ...→
 *   │ ▢ │ │ ▢ │ │ ▢ │ │ ▢ │ │ ▢ │ │ ▢ │ │ ▢ │
 *   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
 *
 * Tiles are 72×72 — a half-step smaller than the standard GameRail's
 * 109px so the rail reads as "mini". On a 375px mobile-frame you see
 * roughly 4 tiles + a peek of the 5th before scrolling kicks in.
 *
 * Per design feedback the rail dropped:
 *   • the white-card chrome around each tile
 *   • per-tile game name labels
 *   • the "Show all" header link
 *
 * Tapping a tile launches the game via the catalogue href (Buffalo
 * Bills → /play/buffalo-bills) or logs a stub for games that aren't
 * built out yet.
 */

const TILE_SIZE = 72;
const TILE_GAP = 8;

export type RecentlyPlayedGame = {
  src: string;
  name: string;
  /** Optional explicit destination; overrides the catalogue lookup. */
  href?: string;
};

export function RecentlyPlayedGrid({
  items,
  title = "Recently Played",
}: {
  items: RecentlyPlayedGame[];
  title?: string;
  /** Kept for back-compat with older callers. Currently the header
   *  is always title-only. */
  seeAllLabel?: string;
  showSeeAll?: boolean;
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      className="py-3"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header — same typography as the other rails. Page gutter
          (16px) lives on the header so the title aligns with the
          rest of the feed. */}
      <div className="px-[16px] pb-[10px]">
        <h2 data-component="Typography" className="text-[18px] font-extrabold text-[var(--mrq-blue)]">
          {title}
        </h2>
      </div>

      {/* Tile rail — overflow-x-auto with a draggable-scroll hook
          for mouse drag on desktop. Uses pl/pr 16px so the first
          tile lines up on the page gutter; subsequent tiles
          continue past the right edge for the side-scroll peek. */}
      <div
        ref={railRef}
        className="no-scrollbar flex overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px] pb-1"
        style={{ gap: TILE_GAP, WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item, i) => (
          <RecentlyPlayedTile key={`${item.src}-${i}`} game={item} />
        ))}
      </div>
    </motion.section>
  );
}

function RecentlyPlayedTile({ game }: { game: RecentlyPlayedGame }) {
  const router = useRouter();
  // Catalogue href as a fallback so titles in the catalogue route
  // even when the caller didn't pass an explicit href.
  const href = game.href ?? getGameDetails(game.name, game.src).href;

  return (
    <button
      data-component="Card"
      type="button"
      aria-label={game.name}
      onClick={() => {
        if (href) {
          router.push(href);
          return;
        }
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[RecentlyPlayed] open game →", game.name);
        }
      }}
      className="relative shrink-0 overflow-hidden rounded-[10px] active:scale-[0.98] transition-transform"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.18)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={game.src}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />
    </button>
  );
}
