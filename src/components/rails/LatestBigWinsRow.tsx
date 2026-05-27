"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useShell } from "@/lib/filter-context";

/**
 * "Latest big wins" — horizontal scroll of social-style win cards.
 *
 *   ┌─────────────────────────┐ ┌────
 *   │ [art] SophieW           │ │ pee
 *   │       just hit £1,200…  │ │
 *   └─────────────────────────┘ └────
 *
 * White card row with the game thumbnail on the left, username
 * (brand-blue, bold) on the first line, and "just hit £X on Game"
 * text on the second line. Each card is wider than tall so the win
 * text reads naturally.
 */

export type WinEvent = {
  src: string;
  /** alt for the artwork */
  alt: string;
  username: string;
  amount: string;
  game: string;
};

export function LatestBigWinsRow({
  title,
  items,
}: {
  title: string;
  items: WinEvent[];
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  return (
    <motion.section
      aria-label={title}
      className="pt-3 pb-[14px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={
        reduce || bootDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="px-[16px] pb-[10px] text-[18px] font-extrabold text-[var(--mrq-blue)]">
        {title}
      </h2>
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[10px] overflow-x-auto pl-[16px] pr-[16px] pb-[4px]"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {items.map((win, i) => (
          <WinEventCard key={`${win.username}-${i}`} win={win} />
        ))}
      </div>
    </motion.section>
  );
}

function WinEventCard({ win }: { win: WinEvent }) {
  return (
    <button
      type="button"
      className="shrink-0 flex items-center gap-[12px] rounded-[14px] bg-white pl-[8px] pr-[16px] py-[8px] text-left active:scale-[0.99] transition-transform"
      style={{
        width: "min(86%, calc(var(--mobile-width) - 48px))",
        boxShadow: "0 4px 10px -6px rgba(10, 46, 203, 0.14)",
      }}
    >
      <span className="relative size-[44px] shrink-0 overflow-hidden rounded-[8px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={win.src}
          alt={win.alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
      </span>
      <span className="min-w-0 flex flex-col gap-[2px]">
        <span className="text-[14px] font-extrabold leading-none text-[var(--mrq-blue)]">
          {win.username}
        </span>
        <span className="text-[13px] font-bold leading-tight text-[var(--mrq-blue-dark)] opacity-80">
          just hit {win.amount} on {win.game}
        </span>
      </span>
    </button>
  );
}
