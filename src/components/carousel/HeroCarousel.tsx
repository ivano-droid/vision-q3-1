"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hero promo carousel — landscape PNG cards just below the filter band.
 *
 * Cards are simple PNGs in /public/assets/hero/. The carousel uses
 * native CSS scroll-snap for the snap targets, and a custom JS
 * smooth-tween on pointer-release so the cards visibly *slide* to
 * the next snap point instead of jumping. The active card scales
 * up to 1.04 to read as "focused".
 *
 * Why a custom snap-tween:
 *   • Browser-native scroll-snap on release is "instant" in some
 *     browsers (Chrome desktop, etc.) — the rail jumps to the
 *     snap point with no animation.
 *   • Native smoothing with `scroll-behavior: smooth` only kicks
 *     in for programmatic scrolls, not user drags.
 *   • So we animate scrollLeft ourselves with an easeOut curve on
 *     drag-release — the rail eases into the snap target over
 *     ~360ms, giving the consistent "transition then snap" feel
 *     the design wants.
 *
 * Touch scrolling on mobile stays native (smooth by default).
 */
// `href` (optional) routes a tap on the card. The first card opens
// the Weekly Pass / Plus tier landing page; the rest stay on the
// stub console.log until they're wired to real destinations.
const CARDS: Array<{ key: string; src: string; alt: string; href?: string }> = [
  {
    key: "car1",
    src: "/assets/hero/car1.png",
    alt: "Weekly Pass — Plus tier",
    href: "/passes",
  },
  { key: "car2", src: "/assets/hero/car2.png", alt: "Featured promo 2" },
  { key: "car3", src: "/assets/hero/car3.png", alt: "Featured promo 3" },
  { key: "car4", src: "/assets/hero/car4.png", alt: "Featured promo 4" },
];

// Fixed tile height (px) per design feedback. Width derives from
// the source PNG aspect (228×336 portrait) so object-cover doesn't
// crop the artwork: w = 300 × (228 / 336) ≈ 204.
const CARD_HEIGHT = 300;
const CARD_ASPECT = 228 / 336;
const CARD_WIDTH = Math.round(CARD_HEIGHT * CARD_ASPECT); // ~204
const CARD_GAP = 20; // matches gap-[20px]
const PAGE_GUTTER = 16; // matches the rail's px-[16px]

// Active-card scale. transform-origin: 0% 50% keeps the active
// card's left edge pinned to the 16px page gutter while it scales
// rightward — matches the rest of the app's gutter rhythm.
const ACTIVE_SCALE = 1.04;

// Smooth-tween animation duration on snap.
const SNAP_DURATION_MS = 360;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function HeroCarousel() {
  const router = useRouter();
  const railRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();

  // Animate the rail's scrollLeft to a target value with an
  // easeOut curve. Cancels any in-flight tween before starting.
  const tweenRafRef = useRef<number | null>(null);
  const cancelTween = useCallback(() => {
    if (tweenRafRef.current !== null) {
      cancelAnimationFrame(tweenRafRef.current);
      tweenRafRef.current = null;
    }
  }, []);
  const tweenTo = useCallback(
    (target: number) => {
      const el = railRef.current;
      if (!el) return;
      cancelTween();
      const startScroll = el.scrollLeft;
      const startTime = performance.now();
      const delta = target - startScroll;
      if (Math.abs(delta) < 1) return;
      const step = () => {
        const now = performance.now();
        const t = Math.min(1, (now - startTime) / SNAP_DURATION_MS);
        el.scrollLeft = startScroll + delta * easeOut(t);
        if (t < 1) {
          tweenRafRef.current = requestAnimationFrame(step);
        } else {
          tweenRafRef.current = null;
        }
      };
      tweenRafRef.current = requestAnimationFrame(step);
    },
    [cancelTween],
  );

  // Find the index of the card whose left edge is closest to a
  // given scrollLeft + the rail's snap-port gutter (16px).
  const nearestIndexFor = useCallback((scrollLeft: number) => {
    const stride = CARD_WIDTH + CARD_GAP;
    const idx = Math.round(scrollLeft / stride);
    return Math.max(0, Math.min(CARDS.length - 1, idx));
  }, []);

  // Snap to a specific card index — used both on drag-release and
  // when the user taps a card whose position is off-centre.
  const snapTo = useCallback(
    (index: number) => {
      const stride = CARD_WIDTH + CARD_GAP;
      const target = stride * index;
      tweenTo(target);
    },
    [tweenTo],
  );

  // Active-card detection on every scroll. Same idea as before —
  // closest card to the rail centre is "active".
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const updateActive = () => {
      const idx = nearestIndexFor(rail.scrollLeft);
      setActiveIndex((curr) => (curr === idx ? curr : idx));
    };
    updateActive();
    rail.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      rail.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [nearestIndexFor]);

  // Pointer-drag + smooth release snap. Touch scrolls natively;
  // mouse drag is captured here so we can fire the tween on
  // release instead of letting the browser hard-snap the rail.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let velocitySamples: { x: number; t: number }[] = [];

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelTween();
      dragging = true;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      velocitySamples = [{ x: e.clientX, t: performance.now() }];
      rail.style.cursor = "grabbing";
      rail.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      rail.scrollLeft = startScroll - (e.clientX - startX);
      const now = performance.now();
      velocitySamples.push({ x: e.clientX, t: now });
      while (velocitySamples.length > 1 && now - velocitySamples[0].t > 80) {
        velocitySamples.shift();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      rail.style.cursor = "grab";
      try {
        rail.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      // Estimate flick direction from the last ~80ms of motion.
      // A fast leftward flick should advance one card to the right
      // even if the user didn't drag far enough to centre it.
      let bias = 0;
      if (velocitySamples.length >= 2) {
        const first = velocitySamples[0];
        const last = velocitySamples[velocitySamples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          const vPx = (last.x - first.x) / dt; // px / ms
          if (vPx < -0.5) bias = 1; // flicked left → next card
          else if (vPx > 0.5) bias = -1; // flicked right → prev card
        }
      }
      const naturalIdx = nearestIndexFor(rail.scrollLeft);
      const target = Math.max(
        0,
        Math.min(CARDS.length - 1, naturalIdx + bias),
      );
      snapTo(target);
    };

    rail.style.cursor = "grab";
    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onPointerMove);
    rail.addEventListener("pointerup", onPointerUp);
    rail.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelTween();
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onPointerMove);
      rail.removeEventListener("pointerup", onPointerUp);
      rail.removeEventListener("pointercancel", onPointerUp);
    };
  }, [cancelTween, nearestIndexFor, snapTo]);

  // Touch-release snap. Native momentum-scroll on iOS will keep
  // moving briefly after touchend; once it settles, snap to the
  // nearest card with the same tween so the feel matches mouse.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let touching = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const clearSettle = () => {
      if (settleTimer) {
        clearTimeout(settleTimer);
        settleTimer = null;
      }
    };
    const onTouchStart = () => {
      touching = true;
      clearSettle();
      cancelTween();
    };
    const onTouchEnd = () => {
      touching = false;
      // Wait a beat for native momentum to settle, then snap.
      clearSettle();
      settleTimer = setTimeout(() => {
        if (!touching) snapTo(nearestIndexFor(rail.scrollLeft));
      }, 140);
    };
    rail.addEventListener("touchstart", onTouchStart, { passive: true });
    rail.addEventListener("touchend", onTouchEnd, { passive: true });
    rail.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      clearSettle();
      rail.removeEventListener("touchstart", onTouchStart);
      rail.removeEventListener("touchend", onTouchEnd);
      rail.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [cancelTween, nearestIndexFor, snapTo]);

  return (
    <motion.section
      aria-label="Featured promotions"
      className="relative"
      initial={false}
      animate={
        reduce ? undefined : { opacity: [0, 1], y: [24, 0], scale: [0.96, 1] }
      }
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={railRef}
        // Use Tailwind utilities for padding so the gutter matches
        // every other rail on the page exactly (GameRail,
        // RecentlyPlayedGrid, BigWinsRow all use `pl-[16px] pr-[16px]`
        // or `px-[16px]`). The previous inline `paddingLeft: 16`
        // computed the same px value but was rendered through React
        // style; aligning to the Tailwind utility removes any
        // residual specificity / casting weirdness so the first
        // card's left edge lands pixel-perfect on the page gutter.
        className="no-scrollbar flex overflow-x-auto overflow-y-visible pl-[16px] pr-[16px] pt-[14px] pb-[12px]"
        style={{
          gap: CARD_GAP,
          WebkitOverflowScrolling: "touch",
          // Plain "x" (proximity) instead of "x mandatory" so the
          // user can free-scroll between cards; the custom tween
          // above is what locks the rail to a snap target on
          // release. Mandatory + our tween fought each other and
          // produced the jumpy feel.
          scrollSnapType: "x proximity",
          scrollPaddingLeft: "16px",
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
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                transform: `scale(${isActive ? ACTIVE_SCALE : 1})`,
                // Left-origin scale so the active card stays
                // left-aligned to the page gutter while it grows.
                transformOrigin: "0% 50%",
                transition: reduce
                  ? "none"
                  : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: isActive ? 2 : 1,
              }}
            >
              <PromoCard
                src={card.src}
                alt={card.alt}
                // The active card opens its destination on tap (if
                // wired); off-centre cards still just snap into focus
                // so the user can read the artwork before committing.
                onClick={() => {
                  if (isActive && card.href) {
                    router.push(card.href);
                    return;
                  }
                  snapTo(i);
                }}
              />
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function PromoCard({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={alt}
      onClick={onClick}
      // No box-shadow — the source PNG artwork carries its own
      // visual edge; the brand-blue glow under the card was double-
      // chroming things and felt heavy.
      className="relative block h-full w-full overflow-hidden rounded-[16px] active:scale-[0.985] transition-transform"
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
