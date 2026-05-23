"use client";

import { useEffect, useRef, useState } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/**
 * Hero carousel — Figma node 48:1732.
 *
 * Horizontal scroll-snap rail of promo cards. Whichever card is closest to the
 * centre of the rail is the "active" card and scales up slightly, matching
 * the Figma design where the focused card is visibly larger than the others.
 *
 * Cards are simple PNGs (pulled from the live Vercel build at
 * vision-01.vercel.app) — no in-code recreation of headlines/stickers. This
 * means perfect fidelity to the source art, and adding/removing cards is a
 * one-line change to the CARDS array below.
 *
 * Behavioural notes:
 *   - Free-scrolling rail (no snap) for a smooth, mobile-app drag feel.
 *     Mouse drag uses `useDraggableScroll` which adds inertia/momentum on
 *     release; native touch already has its own momentum.
 *   - We pick the active card via centre-distance check on every scroll
 *     event (cheap, no extra observers needed).
 *   - The active card gets `scale(1.07)` — the exact 203/190 ratio between
 *     Figma's "active" and "inactive" card frames.
 */
// Four real promo cards pulled from the live MrQ build (vision-01.vercel.app).
// To swap order / duplicate / replace, edit this array — nothing else to change.
const CARDS = [
  { key: "get-spicy", src: "/assets/carousel/card-get-spicy.png", alt: "Play Now — Get Spicy with Spicy Meatballs Megaways" },
  { key: "limits-in-check", src: "/assets/carousel/card-limits-in-check.png", alt: "Keep your limits in check" },
  { key: "u-vs-q", src: "/assets/carousel/card-u-vs-q.png", alt: "U vs Q — head-to-head" },
  { key: "ready-to-play", src: "/assets/carousel/card-ready-to-play.png", alt: "Ready to play together? Join the Arena with 200K+ players" },
];

// Base size from Figma Card 2 (inactive): 190 × 280
// Active card scales up to match Card 1's 203 × 300 footprint
const BASE_W = 190;
const BASE_H = 280;
const ACTIVE_SCALE = 203 / BASE_W; // ≈ 1.068

export function HeroCarousel() {
  // useDraggableScroll wires up click-and-drag-to-scroll on desktop
  // (native touch scrolling still works on real devices via overflow-x: auto).
  const railRef = useDraggableScroll<HTMLDivElement>();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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
  }, []);

  return (
    <section
      aria-label="Featured promotions"
      className="relative"
      data-node-id="48:1732"
    >
      <div
        ref={railRef}
        // Snap-mandatory with snap-align: center on every card. The first
        // card's natural centre would require negative scroll to reach, so
        // the browser clamps it to scrollLeft=0 — meaning card 1 anchors at
        // the left with `pl-[16px]`. Subsequent cards snap to the centre of
        // the rail. Mouse drag inertia still comes from useDraggableScroll.
        className="no-scrollbar flex gap-[12px] overflow-x-auto overflow-y-hidden px-[16px] pt-[28px] pb-[14px] snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {CARDS.map((card, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={card.key}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="shrink-0 snap-center"
              style={{
                width: `${BASE_W}px`,
                height: `${BASE_H}px`,
                transform: `scale(${isActive ? ACTIVE_SCALE : 1})`,
                transformOrigin: "center",
                transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: isActive ? 2 : 1,
              }}
            >
              <PromoCard src={card.src} alt={card.alt} priority={i < 2} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PromoCard({
  src,
  alt,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  // Plain <img> instead of next/image — the PNGs are already 25–335KB at
  // their source size and next/image's optimization pipeline was hanging on
  // the non-priority cards (requesting w=3840 unnecessarily).
  return (
    <button
      type="button"
      className="relative block h-full w-full overflow-hidden rounded-[16px] active:scale-[0.995] transition-transform"
      style={{ boxShadow: "0 8px 24px -8px rgba(10, 46, 203, 0.35)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </button>
  );
}
