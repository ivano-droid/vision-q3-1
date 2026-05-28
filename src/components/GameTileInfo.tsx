"use client";

/**
 * Game-tile info corner — a small frosted-glass cutout in the
 * bottom-right of a square game tile carrying a brand-blue
 * circular "i" badge.
 *
 *   ╭──────────╮
 *   │ artwork  │
 *   │          │
 *   │       ⌒_ │  ← concave white-frosted corner
 *   │      (i) │  ← brand-blue info chip inside it
 *   ╰──────────╯
 *
 * Built with a single absolute-positioned div: the backdrop's
 * `border-top-left-radius` carves the concave inward curve, and
 * the blue chip sits inside the corner. Stays `pointer-events:
 * none` so the parent tile's tap target is unaffected.
 *
 * Used on the main square game tiles in rails (Hot Right Now,
 * Top 10, Same Vibe, etc.) and inline grid tiles
 * (CasinoCategoryView, CasinoAllGamesView, BuffaloBills Similar
 * games). Deliberately omitted on:
 *   • BigWinsRow (My Recent Wins) — per design feedback
 *   • Small horizontal-pill thumbnails (RecentlyPlayedGrid,
 *     LatestBigWinsRow) — the 38–52px thumb is too small to
 *     hang the badge off without crowding the artwork.
 *   • Mega-card preview tiles (72px) — same crowding issue.
 */
export function GameTileInfo({
  size = 36,
  chipSize = 20,
  onClick,
}: {
  /** Width/height of the frosted corner backdrop (px). */
  size?: number;
  /** Diameter of the blue info chip (px). */
  chipSize?: number;
  /** Tap handler for the corner. When provided, the entire frosted
   *  backdrop becomes the tap target (with stop-propagation so the
   *  parent tile's onClick doesn't also fire). The chip itself is
   *  decorative — only the backdrop captures pointer events. */
  onClick?: () => void;
}) {
  const interactive = !!onClick;

  return (
    <span
      // Whole frosted corner is the tap target when onClick is set.
      // That gives a ~36px hit area instead of the tiny 20px chip,
      // which was easy to miss on touch. When non-interactive
      // (decorative peek), it falls back to aria-hidden +
      // pointer-events:none and taps drop through to the tile.
      {...(interactive
        ? {
            role: "button",
            tabIndex: 0,
            "aria-label": "Game info",
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
              onClick?.();
            },
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                onClick?.();
              }
            },
            // Touch events bubble first; stop them here too so
            // the parent tile's onTouch/onMouse listeners (and
            // any drag/swipe wiring) stay quiet.
            onPointerDownCapture: (e: React.PointerEvent) =>
              e.stopPropagation(),
          }
        : {
            "aria-hidden": true,
          })}
      className="absolute bottom-0 right-0"
      style={{
        width: size,
        height: size,
        // Quarter-circle concave cut into the tile.
        borderTopLeftRadius: size,
        backgroundColor: "rgba(245, 245, 245, 0.42)",
        backdropFilter: "blur(10px) saturate(140%)",
        WebkitBackdropFilter: "blur(10px) saturate(140%)",
        pointerEvents: interactive ? "auto" : "none",
        cursor: interactive ? "pointer" : undefined,
      }}
    >
      {/* Chip — tucked into the very bottom-right corner. Pure
          decoration; the backdrop above is what captures taps. */}
      <span
        aria-hidden
        className="absolute grid place-items-center rounded-full"
        style={{
          width: chipSize,
          height: chipSize,
          right: 4,
          bottom: 4,
          backgroundColor: "rgba(10, 46, 203, 0.5)",
          pointerEvents: "none",
        }}
      >
        <InfoGlyph size={Math.round(chipSize * 0.5)} />
      </span>
    </span>
  );
}

function InfoGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      // White glyph reads cleanly on the semi-transparent blue chip.
      fill="white"
      aria-hidden
      focusable={false}
    >
      {/* "i" glyph — small dot above a longer stem. */}
      <circle cx="7" cy="2.6" r="1.2" />
      <rect x="5.8" y="5" width="2.4" height="7" rx="1.2" />
    </svg>
  );
}
