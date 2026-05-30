"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * "Suggested for you" interstitial slide for the Top Picks (/discover)
 * reels feed. Slots into the vertical-snap reel column the same way
 * an article does (full-height snap-start), and offers a sideways-
 * swipeable 4-page carousel — Casino → Live Casino → Bingo → Arena —
 * each with a 2×2 grid of game tiles.
 *
 * Inspired by Instagram's "Suggested for you" panel — the structure
 * (2×2 grid + dot indicator + page-specific subtitle) maps cleanly
 * onto our needs but with games instead of accounts, MrQ brand-blue
 * as the page surface, and Brand/900 as the tile surface.
 */

type Tile = {
  name: string;
  src: string;
  /** Optional route. When unset, tapping the tile just stubs out. */
  href?: string;
};

type Page = {
  id: "casino" | "live" | "bingo" | "arena";
  label: string;
  /** Always 4 — the 2×2 grid is hard-coded. */
  tiles: [Tile, Tile, Tile, Tile];
};

// Page-by-page tile sets. Reuses existing artwork from the rails.
const PAGES: ReadonlyArray<Page> = [
  {
    id: "casino",
    label: "Casino picks",
    tiles: [
      {
        name: "Buffalo Bills",
        src: "/assets/games/slot-01.png",
        href: "/play/buffalo-bills",
      },
      { name: "Tiki Tumble", src: "/assets/games/slot-08.png" },
      { name: "Snake Arena", src: "/assets/games/slot-13.png" },
      { name: "Jewel Stepper", src: "/assets/games/slot-04.png" },
    ],
  },
  {
    id: "live",
    label: "Live Casino picks",
    tiles: [
      { name: "Lightning Roulette", src: "/assets/live/popular-01.png" },
      { name: "Crazy Time", src: "/assets/live/popular-02.png" },
      { name: "Mega Wheel", src: "/assets/live/table-01.png" },
      { name: "Lightning Storm", src: "/assets/live/popular-03.png" },
    ],
  },
  {
    id: "bingo",
    label: "Bingo rooms",
    tiles: [
      {
        name: "Cheap as Chips",
        src: "/assets/bingo/lobby-cheap-as-chips.png",
        href: "/bingo",
      },
      {
        name: "Dab & Disco",
        src: "/assets/bingo/lobby-dab-and-disco.png",
        href: "/bingo",
      },
      {
        name: "On the House",
        src: "/assets/bingo/lobby-on-the-house.png",
        href: "/bingo",
      },
      {
        name: "Pinch a Penny",
        src: "/assets/bingo/lobby-pinch-a-penny.png",
        href: "/bingo",
      },
    ],
  },
  {
    id: "arena",
    label: "Arena tournaments",
    tiles: [
      {
        name: "Big Bass Prize",
        src: "/assets/arena/big-bass-prize.png",
        href: "/arena",
      },
      { name: "Today's Pick", src: "/assets/arena/play-1.png", href: "/arena" },
      {
        name: "Open Tournament",
        src: "/assets/arena/play-2.png",
        href: "/arena",
      },
      { name: "Climb the Board", src: "/assets/arena/play-3.png", href: "/arena" },
    ],
  },
];

const TILE_BG = "#0C2287"; // Brand/900 — the "dark blue for game tiles" spec.

export function SuggestionCard({
  onActiveChange,
}: {
  /** Fires whenever this slide enters / leaves the viewport at ≥60%
   *  intersection. Used by the parent (DiscoverPage) to hide the
   *  reel-feed's FixedReelChrome (mute / actions / title) while
   *  the suggestion card is in view. */
  onActiveChange?: (active: boolean) => void;
}) {
  const router = useRouter();
  const articleRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const x = useMotionValue(0);

  // Measure the swipe viewport so the snap distance matches the
  // mobile-frame column on desktop, not a hard-coded value.
  useEffect(() => {
    const measure = () => {
      if (viewportRef.current) {
        setPageWidth(viewportRef.current.clientWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Track visibility — same ≥60% threshold the ReelArticle uses to
  // promote a reel to "active". Bubbles up so the parent can hide
  // the reel chrome (which is otherwise still painted over the
  // suggestion card on top of reel 3's metadata).
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const active = entry.intersectionRatio >= 0.6;
          setIsActive(active);
          onActiveChange?.(active);
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onActiveChange]);

  // Snap to the active page on every change. Drag-end below also
  // calls setPageIndex, which re-triggers this effect — same path
  // for both tap-on-dot and swipe-release.
  useEffect(() => {
    if (pageWidth === 0) return;
    animate(x, -pageIndex * pageWidth, {
      type: "spring",
      stiffness: 360,
      damping: 36,
      mass: 0.8,
    });
  }, [pageIndex, pageWidth, x]);

  const currentPage = PAGES[pageIndex];

  return (
    <article
      ref={articleRef}
      className="relative w-full snap-start snap-always overflow-hidden"
      style={{
        height: "100dvh",
        backgroundColor: "var(--mrq-blue, #0a2ecb)",
      }}
    >
      {/* Blue scrim — fixed-positioned overlay that paints over the
          BottomNav's default black-on-/discover scrim while this
          slide is in view. Matches the BottomNav scrim's height +
          shape so the bottom of the suggestion card visually
          continues the mrq-blue surface right up to the nav row
          instead of fading into the reels' black. */}
      <motion.div
        aria-hidden
        className="fixed bottom-0 z-30 pointer-events-none"
        style={{
          left: "var(--frame-right-offset)",
          right: "var(--frame-right-offset)",
          height: "calc(var(--bottom-nav-h, 80px) + 80px)",
        }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[90px]"
          style={{
            background:
              "linear-gradient(to top, var(--mrq-blue, #0a2ecb) 30%, rgba(10, 46, 203, 0) 100%)",
          }}
        />
      </motion.div>

      <div
        className="flex flex-col h-full"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 64px)",
          // Bottom padding accounts for the BottomNav so the tile
          // grid's last row clears the nav row + its safe-area pad.
          paddingBottom:
            "calc(var(--bottom-nav-h, 80px) + env(safe-area-inset-bottom) + 24px)",
        }}
      >
        {/* Header */}
        <div className="px-[16px] pb-[14px]">
          <h2 className="text-white text-[22px] font-extrabold leading-tight">
            More games
          </h2>
          <p
            className="text-[14px] font-medium mt-[2px]"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            {currentPage.label}
          </p>
        </div>

        {/* Horizontal swipe viewport — 4 pages in a row, only one
            visible at a time. touchAction:pan-y so vertical scroll
            up the parent snap container isn't captured. */}
        <div
          ref={viewportRef}
          className="relative overflow-hidden flex-1 min-h-0"
        >
          <motion.div
            className="flex h-full"
            style={{
              x,
              width: pageWidth * PAGES.length,
              touchAction: "pan-y",
            }}
            drag="x"
            dragConstraints={{
              left: -((PAGES.length - 1) * pageWidth),
              right: 0,
            }}
            dragElastic={0.18}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const SWIPE_OFFSET = 50;
              const SWIPE_VELOCITY = 350;
              const offset = info.offset.x;
              const velocity = info.velocity.x;
              let next = pageIndex;
              if (
                (offset < -SWIPE_OFFSET || velocity < -SWIPE_VELOCITY) &&
                pageIndex < PAGES.length - 1
              ) {
                next = pageIndex + 1;
              } else if (
                (offset > SWIPE_OFFSET || velocity > SWIPE_VELOCITY) &&
                pageIndex > 0
              ) {
                next = pageIndex - 1;
              }
              if (next === pageIndex) {
                animate(x, -pageIndex * pageWidth, {
                  type: "spring",
                  stiffness: 360,
                  damping: 36,
                });
              } else {
                setPageIndex(next);
              }
            }}
          >
            {PAGES.map((page) => (
              <div
                key={page.id}
                className="shrink-0 px-[16px]"
                style={{
                  width: pageWidth || "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  className="grid grid-cols-2 w-full"
                  style={{ gap: 12 }}
                >
                  {page.tiles.map((tile, i) => (
                    <SuggestionTile
                      key={`${page.id}-${i}`}
                      tile={tile}
                      onPlay={() => {
                        if (tile.href) {
                          router.push(tile.href);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Page dots — tap to jump, current page is brighter and
            slightly larger. */}
        <div className="flex items-center justify-center gap-[8px] pt-[20px]">
          {PAGES.map((page, i) => {
            const active = i === pageIndex;
            return (
              <button
                key={page.id}
                type="button"
                aria-label={`Show ${page.label}`}
                onClick={() => setPageIndex(i)}
                className="rounded-full transition-all"
                style={{
                  width: active ? 8 : 6,
                  height: active ? 8 : 6,
                  backgroundColor: active
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.32)",
                }}
              />
            );
          })}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Single game tile inside the 2×2 grid. Dark-blue surface, game
   artwork at the top, name + Play button stacked below.
   ============================================================ */
function SuggestionTile({
  tile,
  onPlay,
}: {
  tile: Tile;
  onPlay: () => void;
}) {
  return (
    <div
      className="flex flex-col rounded-[14px] overflow-hidden"
      style={{
        backgroundColor: TILE_BG,
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 10px 24px -12px rgba(0, 0, 0, 0.35)",
      }}
    >
      {/* Artwork */}
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.src}
          alt={tile.name}
          draggable={false}
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      {/* Name + Play CTA */}
      <div className="px-[12px] pt-[10px] pb-[12px] flex flex-col" style={{ gap: 10 }}>
        <p
          className="text-white text-[14px] font-extrabold leading-tight truncate"
          style={{ letterSpacing: 0.05 }}
        >
          {tile.name}
        </p>
        <button
          type="button"
          onClick={onPlay}
          className="w-full h-[30px] rounded-[8px] text-[12px] font-extrabold active:scale-[0.98] transition-transform"
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            color: "var(--mrq-blue-dark, #0c2287)",
            letterSpacing: 0.15,
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}
