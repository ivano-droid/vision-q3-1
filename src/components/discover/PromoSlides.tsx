"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Promo slides inserted into the /discover (Top Picks) feed.
 *
 * Two variants, both 100dvh snap-targets sitting between reels:
 *   • ArenaPromoSlide       — Arena recruiter, sits after video 8
 *   • FreeSpinsPromoSlide   — Reward CTA, sits after video 10
 *
 * Layout strategy
 * ─────────────────
 * Each slide uses `position: absolute inset-0` with a flex column
 * inside. PaddingTop = brand-bar clearance (the snap container has
 * `-mt-[24px]` so the article's top sits 24px ABOVE the brand bar's
 * bottom; we add ~96px on top of safe-area to push the first row
 * cleanly below the bar). PaddingBottom = bottom-nav clearance so
 * the CTA never collides with the floating nav pill.
 *
 * Entrance motion gates on a 60% IntersectionObserver, same
 * threshold the reel feed uses. `onActiveChange` notifies the
 * parent so it can hide FixedReelChrome + force-pause adjacent
 * reels while the promo is in view.
 */

// Top clearance: the snap container's -mt-[24px] pulls the article
// 24px ABOVE the brand-bar bottom; on top of that we need the
// brand bar itself (~56px content + safe-area-top) to clear. 96px
// gives that plus breathing room.
const TOP_PADDING = "calc(env(safe-area-inset-top) + 96px)";
// Bottom clearance so the CTA + decoration sit above the floating
// BottomNav. var(--bottom-nav-h) covers the nav pill + the safe-
// area below it; +24 is the visual breathing room.
const BOTTOM_PADDING = "calc(var(--bottom-nav-h, 80px) + 24px)";

function usePromoActive(onActiveChange?: (active: boolean) => void) {
  const articleRef = useRef<HTMLElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const active = entry.intersectionRatio >= 0.6;
          setIsActive(active);
          onActiveChange?.(active);
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onActiveChange]);

  return { articleRef, isActive };
}

// ── Slide 1: Arena ─────────────────────────────────────────────

export function ArenaPromoSlide({
  onActiveChange,
}: {
  onActiveChange?: (active: boolean) => void;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { articleRef, isActive } = usePromoActive(onActiveChange);

  // Per-element variants so the headline rises into view first,
  // then the cherries pop, then the CTA settles. All gated on
  // isActive so the animation only fires once the slide snaps in.
  const fadeUp = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: isActive
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 20 },
    transition: {
      duration: 0.5,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  });

  return (
    <article
      ref={articleRef}
      className="relative w-full snap-start snap-always overflow-hidden"
      style={{
        height: "100dvh",
        backgroundColor: "var(--mrq-blue, #0a2ecb)",
      }}
    >
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          paddingTop: TOP_PADDING,
          paddingBottom: BOTTOM_PADDING,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Top group — Live pill, then headline. */}
        <motion.div {...fadeUp(0)} className="flex flex-col gap-[14px]">
          <span
            className="inline-flex items-center gap-[8px] self-start rounded-full pl-[12px] pr-[16px] py-[7px]"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: "#10B981",
                boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.28)",
              }}
            />
            <span className="text-[14px] font-extrabold text-white">
              Live now
            </span>
          </span>

          <h2
            className="text-white text-[52px] font-extrabold uppercase"
            style={{ lineHeight: 0.94, letterSpacing: -1.2 }}
          >
            Fancy a bit of
            <br />
            chaos?
          </h2>
          <p
            className="text-[40px] font-extrabold lowercase"
            style={{
              color: "#3B9DFF",
              lineHeight: 1,
              letterSpacing: -0.6,
              marginTop: 4,
            }}
          >
            join +200K
            <br />
            brave souls
          </p>
        </motion.div>

        {/* Flex spacer to push the bottom row down. */}
        <div className="flex-1" />

        {/* Bottom row — cherries on the left, "Join Arena" pill on
            the right. Both align to the same baseline above the
            BottomNav clearance line. */}
        <div className="flex items-end justify-between">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -10 }}
            animate={
              isActive
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 0, scale: 0.6, rotate: -10 }
            }
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 16,
              delay: 0.22,
            }}
            aria-hidden
            style={{ transformOrigin: "bottom left" }}
          >
            <CherriesSticker />
          </motion.div>

          <motion.button
            {...fadeUp(0.15)}
            type="button"
            onClick={() => router.push("/arena")}
            className="inline-flex items-center justify-center rounded-full px-[28px] h-[54px] text-[18px] font-extrabold active:scale-[0.97] transition-transform"
            style={{
              backgroundColor: "#ffffff",
              color: "var(--mrq-blue-dark, #0c2287)",
              boxShadow: "0 12px 28px -12px rgba(0, 0, 0, 0.4)",
            }}
          >
            Join Arena
          </motion.button>
        </div>
      </div>
    </article>
  );
}

// ── Slide 2: Free spins ─────────────────────────────────────────

export function FreeSpinsPromoSlide({
  onActiveChange,
}: {
  onActiveChange?: (active: boolean) => void;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { articleRef, isActive } = usePromoActive(onActiveChange);

  return (
    <article
      ref={articleRef}
      className="relative w-full snap-start snap-always overflow-hidden"
      style={{
        height: "100dvh",
        backgroundColor: "var(--mrq-blue, #0a2ecb)",
      }}
    >
      <div
        className="absolute inset-0 flex flex-col items-center"
        style={{
          paddingTop: TOP_PADDING,
          paddingBottom: BOTTOM_PADDING,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Top spacer pushes the headline down to the visual centre. */}
        <div className="flex-1" />

        {/* Centred headline stack — three rows, with "100 FREE / SPINS"
            in yellow for emphasis. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={
            isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }
          }
          transition={{
            duration: 0.55,
            delay: 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-center"
        >
          <h2
            className="text-[60px] font-extrabold uppercase text-white"
            style={{ lineHeight: 0.96, letterSpacing: -1.2 }}
          >
            You have
          </h2>
          <h2
            className="text-[60px] font-extrabold uppercase"
            style={{
              color: "#FFD400",
              lineHeight: 1,
              letterSpacing: -1.2,
              marginTop: 8,
            }}
          >
            100 free
            <br />
            spins
          </h2>
          <h2
            className="text-[60px] font-extrabold uppercase text-white"
            style={{ lineHeight: 0.96, letterSpacing: -1.2, marginTop: 8 }}
          >
            To claim
          </h2>
        </motion.div>

        {/* Spacer between headline and CTA — bigger than the top
            spacer so the headline reads slightly above middle. */}
        <div style={{ flex: 1.4 }} />

        {/* CTA — full-width white pill. */}
        <motion.button
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={
            isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
          }
          transition={{
            duration: 0.5,
            delay: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          type="button"
          onClick={() => router.push("/rewards")}
          className="self-stretch inline-flex items-center justify-center rounded-full h-[56px] text-[18px] font-extrabold active:scale-[0.97] transition-transform"
          style={{
            backgroundColor: "#ffffff",
            color: "var(--mrq-blue-dark, #0c2287)",
            boxShadow: "0 12px 28px -12px rgba(0, 0, 0, 0.4)",
          }}
        >
          Open Rewards
        </motion.button>
      </div>
    </article>
  );
}

// ── Cherries decoration (inline SVG approximation) ──────────────

function CherriesSticker() {
  return (
    <svg width="100" height="92" viewBox="0 0 100 92" fill="none" aria-hidden>
      {/* Stems */}
      <path
        d="M32 60 C 38 38, 50 26, 56 16"
        stroke="#0c2287"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M66 62 C 62 40, 58 30, 56 18"
        stroke="#0c2287"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaf */}
      <path
        d="M54 16 C 64 6, 84 4, 90 16 C 80 22, 64 24, 54 16 Z"
        fill="#27AE60"
        stroke="#0c2287"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Back cherry */}
      <circle
        cx="62"
        cy="68"
        r="20"
        fill="#E535A8"
        stroke="#0c2287"
        strokeWidth="3.5"
      />
      {/* Front cherry */}
      <circle
        cx="32"
        cy="72"
        r="18"
        fill="#FF60C4"
        stroke="#0c2287"
        strokeWidth="3.5"
      />
      {/* Highlights */}
      <circle cx="26" cy="66" r="3.5" fill="#ffffff" opacity="0.85" />
      <circle cx="56" cy="62" r="3" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}
