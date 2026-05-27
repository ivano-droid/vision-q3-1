"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useShell } from "@/lib/filter-context";

/**
 * Hero promo carousel — landscape PNG cards just below the filter band.
 *
 * Cards are simple PNGs (export from Figma → PNG 2× → save into
 * /public/assets/hero/). Each card uses the same 3:2 landscape aspect
 * so they line up cleanly in the snap rail.
 *
 * Behaviour:
 *   • Horizontal scroll-snap-mandatory + snap-stop: always so every
 *     release lands cleanly on a card.
 *   • Cards sit at ~88% viewport width so a sliver of the next card
 *     peeks on the right — swipe affordance.
 *   • Mouse drag uses `useDraggableScroll` for desktop; native touch
 *     scroll handles mobile.
 *
 * Scroll-off:
 *   The hero is NOT part of the sticky filter band — it's visible
 *   ONLY when the page is at the very top. The moment the user starts
 *   scrolling (>8px), the strip slides up off-screen AND collapses
 *   its height to 0 so the rails below pull up cleanly. Reappears
 *   only when scrollY returns to ~0 (2px hysteresis prevents
 *   touch-wobble flicker).
 */
const CARDS: Array<{ key: string; src: string; alt: string }> = [
  {
    key: "big-weekender",
    src: "/assets/hero/card-big-weekender.png",
    alt: "Big Weekender is back again",
  },
  {
    key: "get-spicy",
    src: "/assets/hero/card-get-spicy.png",
    alt: "Play Now — Get Spicy",
  },
  {
    key: "big-weekender-2",
    src: "/assets/hero/card-big-weekender.png",
    alt: "Big Weekender is back again",
  },
];

// Native Figma card aspect: 303 × 162 (≈ 1.87:1). Matching exactly
// means `object-cover` doesn't crop anything off the exported PNGs.
const CARD_ASPECT = 303 / 162;

// Active-card scale. Inactive cards stay at 1.0; whichever card is
// closest to the centre of the rail scales up subtly so it reads as
// the "focused" card.
//
// `transform-origin: 0% 50%` (left-centre) means the scale grows
// the card rightward + slightly up/down — the LEFT edge stays put.
// That keeps the active card's left aligned with the 16px page
// gutter (matching GameRail, ScrollAwareFilters, RecentlyPlayedGrid)
// rather than bleeding past it on a centre-origin scale.
const ACTIVE_SCALE = 1.04;

export function HeroCarousel() {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  // Active-card detection — find whichever card is closest to the
  // rail's centre line on every horizontal scroll. The active card
  // gets the slight scale-up so the user has a clear visual anchor
  // for "this is the one snapped into view".
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateActive = () => {
      const railRect = rail.getBoundingClientRect();
      const railCentre = railRect.left + railRect.width / 2;
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - railCentre);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActiveIndex((curr) => (curr === best ? curr : best));
    };

    updateActive();
    rail.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      rail.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [railRef]);

  const dealIn = reduce || bootDone;

  return (
    <motion.section
      aria-label="Featured promotions"
      className="relative"
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={
        dealIn
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 24, scale: 0.96 }
      }
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={railRef}
        // px-[16px] matches the page gutter used everywhere else.
        // Wide gap (gap-[20px]) so the active card's rightward
        // scale-up has clear separation from the next card — the
        // previous 10px gap left them touching once the active
        // scaled.
        className="no-scrollbar flex gap-[20px] overflow-x-auto overflow-y-visible px-[16px] pt-[14px] pb-[12px] snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollSnapStop: "always",
        }}
      >
        {CARDS.map((card, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={card.key}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="shrink-0 snap-start"
              style={{
                // 82% of viewport so the active card's rightward
                // scale-up + the 20px inter-card gap still leave
                // a clean peek of the next card on the right
                // (~14% of viewport visible).
                width: "min(82%, calc(var(--mobile-width) - 60px))",
                aspectRatio: `${CARD_ASPECT}`,
                transform: `scale(${isActive ? ACTIVE_SCALE : 1})`,
                // Anchor the scale to the card's LEFT edge so the
                // active card's left stays exactly at the 16px page
                // gutter (matches the rest of the app). Growth pushes
                // rightward + up/down only.
                transformOrigin: "0% 50%",
                transition: reduce
                  ? "none"
                  : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: isActive ? 2 : 1,
              }}
            >
              <PromoCard src={card.src} alt={card.alt} />
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function PromoCard({ src, alt }: { src: string; alt: string }) {
  return (
    <button
      type="button"
      aria-label={alt}
      className="relative block h-full w-full overflow-hidden rounded-[16px] active:scale-[0.985] transition-transform"
      style={{ boxShadow: "0 8px 24px -10px rgba(10, 46, 203, 0.35)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </button>
  );
}
