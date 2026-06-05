"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { getGameDetails } from "@/lib/games-catalogue";

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

/* Landscape recommendation card — tap launches the game (when
   known) or stubs; the i chip opens the quick-look sheet. */
function SameVibeCardTile({ card }: { card: SameVibeCard }) {
  const router = useRouter();
  const details = getGameDetails(card.alt, card.src);

  return (
    <div
      className="relative shrink-0 snap-start overflow-hidden rounded-[14px]"
      style={{
        width: "min(82%, calc(var(--mobile-width) - 60px))",
        aspectRatio: "16 / 11",
        boxShadow: "0 8px 24px -10px rgba(10, 46, 203, 0.32)",
      }}
    >
      <button
        type="button"
        aria-label={card.alt}
        onClick={() => {
          if (details.href) {
            router.push(details.href);
            return;
          }
          if (typeof window !== "undefined") {
            // eslint-disable-next-line no-console
            console.log("[SameVibe] open game →", card.alt);
          }
        }}
        className="block h-full w-full active:scale-[0.98] transition-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.src}
          alt=""
          className="h-full w-full object-cover pointer-events-none"
          draggable={false}
        />
      </button>
      {/* Landscape cards are taller — scale the badge up a
          touch so it doesn't get lost against the larger
          surface, but keep it well in the corner. */}
    </div>
  );
}

export function SameVibeRail({
  title,
  items,
}: {
  title: string;
  items: SameVibeCard[];
}) {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      className="pt-3 pb-[14px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="px-[16px] pb-[10px] text-[18px] font-extrabold text-[var(--mrq-blue)]">
        {title}
      </h2>
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[12px] overflow-x-auto overflow-y-hidden pl-[16px] pr-[16px] pb-[2px] snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          // Inset the snap port by 16px so subsequent cards snap
          // their left edge to the same 16px gutter as the first
          // card (which sits at its natural padding-left position).
          // Without this, snap aligns to padding-box-left (0px) and
          // the cards drift left of the page gutter after a swipe.
          scrollPaddingLeft: "16px",
        }}
      >
        {items.map((card, i) => (
          <SameVibeCardTile key={`${card.alt}-${i}`} card={card} />
        ))}
      </div>
    </motion.section>
  );
}
