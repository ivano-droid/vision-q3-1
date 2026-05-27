"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useFilter } from "@/lib/filter-context";

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
// the "focused" card (matches the Figma's active card being slightly
// larger than the inactive ones).
const ACTIVE_SCALE = 1.06;

// Hysteresis for the scroll-off behaviour. Hide once we're a few
// pixels in, reveal only when fully back at the top.
const HIDE_AT = 8;
const REVEAL_AT = 2;

export function HeroCarousel() {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();
  const { bootDone } = useFilter();

  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setVisible((curr) => {
          if (curr && y > HIDE_AT) return false;
          if (!curr && y <= REVEAL_AT) return true;
          return curr;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

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
  const hiddenTransform = reduce
    ? { opacity: 0, y: 0 }
    : { opacity: 0, y: -32 };

  return (
    <motion.section
      aria-label="Featured promotions"
      className="relative overflow-hidden"
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={
        !dealIn
          ? { opacity: 0, y: 24, scale: 0.96 }
          : visible
            ? { opacity: 1, y: 0, scale: 1, height: "auto" }
            : { ...hiddenTransform, height: 0, scale: 1 }
      }
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        ref={railRef}
        // Padding matches the rest of the page rhythm: px-[16px] for
        // horizontal (same as GameRail, ScrollAwareFilters,
        // RecentlyPlayedGrid). Vertical pt/pb is bumped a few px so
        // the active card's scale-up has room to breathe without
        // getting clipped against the band above or below.
        className="no-scrollbar flex gap-[10px] overflow-x-auto overflow-y-visible px-[16px] pt-[14px] pb-[12px] snap-x snap-mandatory"
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
                // 86% of available width so a sliver of the next
                // card peeks at the right edge. Slightly tighter
                // than before so the active scale-up doesn't push
                // it off-screen.
                width: "min(86%, calc(var(--mobile-width) - 40px))",
                aspectRatio: `${CARD_ASPECT}`,
                // Scale the active card up; others stay at 1.0.
                // transform-origin keeps the growth symmetric so the
                // card doesn't drift off its snap anchor.
                transform: `scale(${isActive ? ACTIVE_SCALE : 1})`,
                transformOrigin: "center",
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
