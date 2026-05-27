"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useFilter } from "@/lib/filter-context";
import { BigWeekenderCard, GetSpicyCard } from "./HeroPromoCards";

/**
 * Hero promo carousel — landscape strip just below the filter band.
 *
 * Replaced the previous portrait carousel (190 × 280 cards). The hero
 * was too tall and ate too much vertical real estate above the rails.
 * Cards are now landscape 3:2 (one full card + a peek of the next at
 * ~88% viewport width) so the hero clocks in at ~190px tall, roughly
 * a third shorter than before.
 *
 * Behaviour:
 *   • Horizontal scroll-snap-mandatory so each card snaps into the
 *     same anchor position on release — no more drift between drags.
 *   • snap-stop: always so a fast flick doesn't blow past multiple
 *     cards in one go (still feels natural; just lands at the next
 *     card instead of two cards down).
 *   • Mouse drag uses `useDraggableScroll` for desktop. Native touch
 *     scroll handles the rest on mobile.
 *
 * Scroll-off interaction (new):
 *   The strip is NOT part of the sticky filter band — the filters use
 *   show-on-scroll-up direction logic. The hero is simpler: visible
 *   ONLY when the page is at the very top. The moment the user starts
 *   scrolling down, the hero slides up off-screen. It reappears only
 *   when scrollY returns to ~0.
 *
 *   We use a small hysteresis (HIDE_AT > REVEAL_AT) so a 1-2px scroll
 *   wobble at the top doesn't flicker. translateY drives the actual
 *   hide so it doesn't take up layout space when hidden — the rails
 *   below shift up cleanly.
 */
// The two Figma cards (node 160:22811): BIG WEEKENDER + GET SPICY.
// Composed in code (see HeroPromoCards.tsx) — the Figma assets are
// dense multi-layer compositions that don't extract as clean PNGs,
// so we use the actual photo asset from Figma + recompose the
// text / sticker / background.
//
// Three slots so the carousel feels populated; for now we cycle BW →
// Get Spicy → BW. Swap in a third distinct card when designed.
const CARDS: Array<{
  key: string;
  alt: string;
  render: () => React.ReactElement;
}> = [
  {
    key: "big-weekender",
    alt: "Big Weekender is back again",
    render: () => <BigWeekenderCard />,
  },
  {
    key: "get-spicy",
    alt: "Play Now — Get Spicy",
    render: () => <GetSpicyCard />,
  },
  {
    key: "big-weekender-2",
    alt: "Big Weekender is back again",
    render: () => <BigWeekenderCard />,
  },
];

// Card dimensions. 3:2 landscape — the Figma promo cards are ~303×162
// (1.87:1) but 3:2 keeps the existing portrait artwork readable when
// cropped via object-cover.
const CARD_ASPECT = 3 / 2;

// Hysteresis for the scroll-off behaviour. Hide once we're a few
// pixels in (so a touch-jiggle at the very top doesn't kick the hero
// out), reveal only when fully back at the top.
const HIDE_AT = 8;
const REVEAL_AT = 2;

export function HeroCarousel() {
  // useDraggableScroll wires up click-and-drag-to-scroll on desktop
  // (native touch scrolling still works on real devices via overflow-x: auto).
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();
  const { bootDone } = useFilter();

  // Page-level scroll listener for the hide-on-scroll behaviour.
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

  // Entrance + scroll-off animations are layered. The deal-in (used on
  // initial paint after the splash) animates from y:24 to y:0 with a
  // small scale settle. After that, the scroll-off animation moves
  // between y:0 (visible) and y:-100% (hidden above viewport).
  // Framer's `animate` re-evaluates as deps change; when bootDone +
  // visible flip, it transitions to the new target.
  const dealIn = reduce || bootDone;
  const hiddenTransform = reduce
    ? { opacity: 0, y: 0 }
    : { opacity: 0, y: -32 };

  return (
    <motion.section
      aria-label="Featured promotions"
      className="relative overflow-hidden"
      data-node-id="48:1732"
      // The hero now ALSO handles its own height collapse on scroll
      // so the rails below pull up cleanly. animate.height plays
      // with the y translate to give a smooth slide-off-and-up feel.
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={
        !dealIn
          ? { opacity: 0, y: 24, scale: 0.96 }
          : visible
            ? { opacity: 1, y: 0, scale: 1, height: "auto" }
            : { ...hiddenTransform, height: 0, scale: 1 }
      }
      transition={{
        duration: 0.3,
        delay: !dealIn ? 0 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        ref={railRef}
        // Scroll-snap mandatory keeps cards locked to anchor points.
        // `snap-always` makes the snap re-trigger after any scroll
        // gesture (so flicking past a card always lands on a card).
        className="no-scrollbar flex gap-[10px] overflow-x-auto overflow-y-hidden px-[16px] pt-[12px] pb-[14px] snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollSnapStop: "always",
        }}
      >
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="shrink-0 snap-start"
            style={{
              // 88% of the viewport so a sliver of the next card peeks
              // — the affordance that "there's more to swipe".
              width: "min(88%, calc(var(--mobile-width) - 32px))",
              aspectRatio: `${CARD_ASPECT}`,
            }}
            role="button"
            aria-label={card.alt}
          >
            {card.render()}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

