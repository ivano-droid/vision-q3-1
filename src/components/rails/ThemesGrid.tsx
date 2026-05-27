"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useShell } from "@/lib/filter-context";

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
  title = "Browse all themes",
  items,
}: {
  title?: string;
  items: Theme[];
}) {
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  return (
    <motion.section
      aria-label={title}
      className="px-[16px] pt-3 pb-[14px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={
        reduce || bootDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
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

function ThemeCard({ theme }: { theme: Theme }) {
  const ariaLabel = theme.subtitle
    ? `${theme.label} (${theme.subtitle})`
    : `Browse ${theme.label} games`;
  const inner = (
    <>
      {/* Label + optional sub-line, vertically centred on the left. */}
      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 flex flex-col text-left text-white">
        <span className="text-[16px] font-extrabold leading-tight">
          {theme.label}
        </span>
        {theme.subtitle && (
          <span className="text-[12px] font-bold leading-tight opacity-75">
            {theme.subtitle}
          </span>
        )}
      </span>

      {/* Right-hand fanned thumbnail cluster — three small tiles,
          each tilted slightly, overlapping. Mirrors the Figma's
          "collection" frame on each card. */}
      <span className="absolute right-[6px] top-1/2 -translate-y-1/2 size-[64px] pointer-events-none">
        <Thumb src={theme.thumbs[0]} className="left-0 top-[8px] size-[32px] rotate-[-12deg]" />
        <Thumb src={theme.thumbs[1]} className="left-[12px] top-[14px] size-[40px] rotate-[-2deg]" />
        <Thumb src={theme.thumbs[2]} className="left-[18px] top-[20px] size-[46px] rotate-[8deg]" />
      </span>
    </>
  );

  const className =
    "relative h-[84px] overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform";
  const style = { backgroundColor: theme.color ?? "#0a2ecb" } as const;

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
      className={`absolute overflow-hidden rounded-[6px] ${className ?? ""}`}
      style={{
        boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.25)",
        border: "1.5px solid #ffffff",
      }}
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
