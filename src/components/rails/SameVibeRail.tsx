"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useShell } from "@/lib/filter-context";

/**
 * "Same vibe as <game>" — horizontal scroll of large landscape
 * game-promo cards. Bigger / more cinematic than the rail tiles,
 * smaller than the hero. Reads as "recommended like this one".
 *
 *   ┌──────────────────────┐ ┌─────
 *   │  big promo card art  │ │ pee
 *   └──────────────────────┘ └─────
 *
 * Cards are simple PNGs (one per recommendation) at 16:9 / 7:5
 * landscape. The active scale-up from HeroCarousel isn't used here
 * — these are recommendations, not the primary CTA, so they sit at
 * uniform size.
 */

export type SameVibeCard = { src: string; alt: string };

export function SameVibeRail({
  title,
  items,
}: {
  title: string;
  items: SameVibeCard[];
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
        className="no-scrollbar flex gap-[12px] overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px] pb-[2px] snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {items.map((card, i) => (
          <div
            key={`${card.alt}-${i}`}
            className="shrink-0 snap-start overflow-hidden rounded-[14px]"
            style={{
              width: "min(82%, calc(var(--mobile-width) - 60px))",
              aspectRatio: "16 / 11",
              boxShadow: "0 8px 24px -10px rgba(10, 46, 203, 0.32)",
            }}
          >
            <button
              type="button"
              aria-label={card.alt}
              className="block h-full w-full active:scale-[0.99] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.src}
                alt=""
                className="h-full w-full object-cover pointer-events-none"
                draggable={false}
              />
            </button>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
