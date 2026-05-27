"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useShell } from "@/lib/filter-context";

/**
 * "Browse all themes" — 2-column grid of dark-blue cards, each with
 * a theme label on the left and a small fanned trio of game-tile
 * thumbnails on the right.
 *
 *   ┌─────────────────┐ ┌─────────────────┐
 *   │ Animal     ▢▢▢ │ │ Fishing    ▢▢▢ │
 *   ├─────────────────┤ ├─────────────────┤
 *   │ History    ▢▢▢ │ │ Jungle     ▢▢▢ │
 *   └─────────────────┘ └─────────────────┘
 *
 * Same visual treatment as the Start Browsing tiles (dark navy
 * background, white extrabold text) but taller — they're full
 * navigation cards, not quick filters.
 */

export type Theme = {
  key: string;
  label: string;
  /** Three art tiles for the right-hand collection cluster. */
  thumbs: [string, string, string];
};

export function ThemesGrid({ items }: { items: Theme[] }) {
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  return (
    <motion.section
      aria-label="Browse all themes"
      className="px-[16px] pt-3 pb-[14px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={
        reduce || bootDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="pb-[12px] text-[18px] font-extrabold text-[var(--mrq-blue)]">
        Browse all themes
      </h2>
      <div className="grid grid-cols-2 gap-[12px]">
        {items.map((theme) => (
          <ThemeCard key={theme.key} theme={theme} />
        ))}
      </div>
    </motion.section>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <button
      type="button"
      aria-label={`Browse ${theme.label} games`}
      className="relative h-[84px] overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform"
      style={{ backgroundColor: "#0a2ecb" }}
    >
      {/* Label on the left, vertically centred. */}
      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[16px] font-extrabold text-white">
        {theme.label}
      </span>

      {/* Right-hand fanned thumbnail cluster — three small tiles,
          each tilted slightly, overlapping. Mirrors the Figma's
          "collection" frame on each theme card. */}
      <span className="absolute right-[6px] top-1/2 -translate-y-1/2 size-[64px] pointer-events-none">
        <Thumb src={theme.thumbs[0]} className="left-0 top-[8px] size-[32px] rotate-[-12deg]" />
        <Thumb src={theme.thumbs[1]} className="left-[12px] top-[14px] size-[40px] rotate-[-2deg]" />
        <Thumb src={theme.thumbs[2]} className="left-[18px] top-[20px] size-[46px] rotate-[8deg]" />
      </span>
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
