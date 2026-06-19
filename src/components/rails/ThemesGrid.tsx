"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/**
 * 2-column grid of dark-blue navigation cards, each with a label on
 * the left, an optional sub-line beneath it, and a small fanned trio
 * of game-tile thumbnails on the right.
 *
 *   ┌─────────────────┐ ┌─────────────────┐
 *   │ Jackpot    ▢▢▢ │ │ Megaways   ▢▢▢ │
 *   │ Casino         │ │ Casino         │
 *   ├─────────────────┤ ├─────────────────┤
 *   │ Slingo     ▢▢▢ │ │ Tables     ▢▢▢ │
 *   │ Casino         │ │ Casino         │
 *   └─────────────────┘ └─────────────────┘
 *
 * Same visual treatment as the Start Browsing tiles (dark navy
 * background, white extrabold text) but taller — they're full
 * navigation cards, not quick filters.
 *
 * Originally rendered as "Browse all themes" with theme labels
 * (Animal, Fishing, …); now reused for "Browse all categories" where
 * each card surfaces a Casino sub-category with the vertical name
 * ("Casino") as a sub-line. Title + sub-line content is fully driven
 * by props so the same component can host either layout.
 */

export type Theme = {
  key: string;
  label: string;
  /** Optional secondary line shown beneath the label, e.g. the parent
   *  vertical ("Casino"). Omit for a single-line card. */
  subtitle?: string;
  /** Optional destination. When omitted the card renders as an inert
   *  button (no nav). */
  href?: string;
  /** Three art tiles for the right-hand collection cluster. */
  thumbs: [string, string, string];
  /** Optional background colour. Defaults to brand blue (#0a2ecb). Use
   *  to differentiate non-Casino verticals (Bingo, Live Casino, Arena)
   *  inside the same grid. */
  color?: string;
};

export function ThemesGrid({
  title = "Browse All Themes",
  items,
}: {
  title?: string;
  items: Theme[];
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      className="px-[16px] pt-3 pb-[14px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="pb-[12px] text-[18px] font-extrabold text-[var(--mrq-blue)]">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-[12px]">
        {items.map((item) => (
          <ThemeCard key={item.key} theme={item} />
        ))}
      </div>
    </motion.section>
  );
}

// Brand-blue diagonal gradient shared by every card (Figma 2564:67580).
const CARD_GRADIENT =
  "linear-gradient(123.64deg, rgb(10, 46, 203) 38.564%, rgb(13, 36, 134) 95.26%)";

function ThemeCard({ theme }: { theme: Theme }) {
  const ariaLabel = theme.subtitle
    ? `${theme.label} (${theme.subtitle})`
    : `Browse ${theme.label} games`;
  const inner = (
    <>
      {/* Label + optional sub-line, top-aligned on the left. */}
      <span className="flex flex-col text-left text-white">
        <span className="text-[16px] font-extrabold leading-[1.2]">
          {theme.label}
        </span>
        {theme.subtitle && (
          <span className="text-[14px] font-medium leading-[1.2] tracking-[0.1px]">
            {theme.subtitle}
          </span>
        )}
      </span>

      {/* Right-hand fanned thumbnail cluster — three tiles, each tilted
          and overlapping, pinned to the bottom-right of the card.
          Geometry mirrors the Figma "collection" frame (62×62 box). */}
      <span className="relative size-[62px] shrink-0 self-end pointer-events-none">
        {/* Back tile — upright, upper-right. */}
        <Thumb
          src={theme.thumbs[0]}
          className="absolute left-[16.79px] top-[6.46px] size-[31.495px] rounded-[6.299px] border-[1.575px]"
        />
        {/* Middle tile — rotated clockwise. */}
        <span className="absolute left-[24.54px] top-[18.08px] flex size-[39.955px] items-center justify-center">
          <span className="rotate-[18.77deg]">
            <Thumb
              src={theme.thumbs[1]}
              className="size-[31.495px] rounded-[6.299px] border-[1.575px]"
            />
          </span>
        </span>
        {/* Front tile — largest, rotated counter-clockwise. */}
        <span className="absolute left-[-0.87px] top-[13.8px] flex size-[46.821px] items-center justify-center">
          <span className="-rotate-[15deg]">
            <Thumb
              src={theme.thumbs[2]}
              className="size-[38.229px] rounded-[7.646px] border-[1.911px]"
            />
          </span>
        </span>
      </span>
    </>
  );

  const className =
    "relative flex min-h-[100px] items-start justify-between overflow-hidden rounded-[16px] p-[12px] active:scale-[0.98] transition-transform";
  // Default to the brand-blue gradient; a solid `color` override (used
  // to differentiate non-Casino verticals) wins when supplied.
  const style = theme.color
    ? ({ backgroundColor: theme.color } as const)
    : ({ backgroundImage: CARD_GRADIENT } as const);

  if (theme.href) {
    return (
      <Link href={theme.href} aria-label={ariaLabel} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={ariaLabel} className={className} style={style}>
      {inner}
    </button>
  );
}

function Thumb({ src, className }: { src: string; className?: string }) {
  return (
    <span
      className={`block overflow-hidden border-solid border-white ${className ?? ""}`}
      style={{ boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.25)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
