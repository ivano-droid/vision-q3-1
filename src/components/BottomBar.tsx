"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useFilter } from "@/lib/filter-context";

/**
 * Floating bottom bar — Figma node 50:3305.
 *
 * Two visual states it springs between:
 *   • EXPANDED (top of page):   [home]  [🔍 Search all games            ]  [gift]
 *   • COLLAPSED (scrolled):     [home]  [🔍]                              [gift]
 *
 * Design tokens from Figma:
 *   pill fill  = #e6eafa  (colour/brand/blue/50)
 *   pill stroke = #ced5f5 (colour/brand/blue/100)
 *   home fill  = #0a2ecb  (colour/brand/blue/500)
 *   red dot    = #d50000  (colour/status/red-danger/500)
 *
 * iOS feel:
 *   • Framer Motion spring on width / opacity / max-width — gives the slight
 *     overshoot-and-settle that platform native bars use, not a linear CSS
 *     ease.
 *   • Search icon is fixed at `padding-left: 12px` in both states so it never
 *     slides sideways during the transition. The 44px collapsed width is
 *     12 + 20 + 12 = perfectly centred, no special-case needed.
 *   • Subtle hysteresis prevents flicker on micro-scrolls.
 *   • Lifted 20px off the bottom (plus safe-area inset).
 */
const COLLAPSE_AT = 32;
const EXPAND_AT = 8;

// Spring tuned to feel like a stock iOS list bar — slightly damped, no bounce
// on the small text shrink, a tiny bit of follow-through on the wide pill.
const SPRING = { type: "spring" as const, stiffness: 380, damping: 36, mass: 0.9 };
const FAST_SPRING = { type: "spring" as const, stiffness: 500, damping: 40, mass: 0.7 };

export function BottomBar() {
  const [collapsed, setCollapsed] = useState(false);
  const reduce = useReducedMotion();
  const { goHome, openSearch, searchInputRef, bootDone } = useFilter();

  // Open the search overlay AND focus the input in one synchronous call
  // stack. iOS requires `.focus()` to happen inside the user-gesture handler
  // for the on-screen keyboard to appear automatically.
  const handleSearchTap = () => {
    openSearch();
    // The SearchOverlay's input is always mounted (just translated off-screen
    // when closed), so the ref is non-null here.
    searchInputRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setCollapsed((curr) => {
          if (!curr && y > COLLAPSE_AT) return true;
          if (curr && y <= EXPAND_AT) return false;
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

  const transition = reduce ? { duration: 0 } : SPRING;

  // White floor exactly matches Safari's chrome height (env reports the
  // chrome height when viewport-fit:cover is set). Bar lifted ~12px above
  // the floor for breathing room between our nav and Safari's UI.
  const floorHeight = "env(safe-area-inset-bottom)";
  const barOffset = "calc(env(safe-area-inset-bottom) + 12px)";

  // Casino "deal-in" entrance: bar + floor fade/scale in LAST, after the
  // hero and rails have settled. Gated on `bootDone` (flipped by the loading
  // splash on its way out), then a 500ms delay puts the bar's arrival at
  // the tail end of the deal-in choreography.
  const entranceTransition = reduce
    ? { duration: 0 }
    : { duration: 0.3, delay: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  const shown = reduce || bootDone;

  return (
    <>
      {/* White floor — sized to Safari chrome height. Slightly translucent
          (92% white) with a backdrop-blur, so it reads as a frosted-white
          surface. Body bg is white on mobile so no colour bleeds through.
          Hidden when launched as a PWA (display-mode: standalone) because
          there's no Safari chrome to land on it — the floor would just be
          an empty white bar at the device edge. The `bottom-bar-floor`
          class is targeted by a CSS rule in globals.css. */}
      <motion.div
        className="bottom-bar-floor pointer-events-none fixed bottom-0 inset-x-0 z-30"
        style={{
          height: floorHeight,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={entranceTransition}
        aria-hidden
      />

      {/* Floating bar — 12px above the floor; pills stay transparent so
          lobby content shows above and through them. */}
      <motion.div
        className="pointer-events-none fixed inset-x-0 z-40 flex justify-center"
        style={{ bottom: barOffset }}
        data-node-id="50:3305"
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
        animate={
          shown
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 12, scale: 0.96 }
        }
        transition={entranceTransition}
      >
      <nav
        aria-label="Quick actions"
        className="pointer-events-auto flex w-full max-w-[var(--mobile-width)] items-center justify-between gap-[10px] px-[20px]"
      >
        {/* Left pill: home + search.
            Solid Figma blue/50 fill — no transparency / backdrop-blur so the
            pill stays opaque against iOS Safari's own floating chrome, which
            otherwise bleeds gradient + colour through and looks identical to
            our UI. */}
        <motion.div
          className="relative flex items-center gap-[6px] rounded-full p-[4px]"
          style={{
            backgroundColor: "#e6eafa",
            border: "1px solid #ced5f5",
            boxShadow:
              "0 16px 36px -12px rgba(10, 46, 203, 0.32), 0 2px 8px -2px rgba(10, 46, 203, 0.12)",
          }}
          animate={{
            width: collapsed ? 104 : "100%",
            maxWidth: collapsed ? 104 : 9999,
          }}
          transition={transition}
        >
          {/* Home button — always 44×44 blue. Returns to the lobby home view. */}
          <motion.button
            type="button"
            aria-label="Home"
            onClick={goHome}
            className="grid size-[44px] shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: "#0a2ecb" }}
            whileTap={{ scale: 0.92 }}
            transition={FAST_SPRING}
          >
            <HomeIcon className="size-[22px] text-white" />
          </motion.button>

          {/* Search button — animates from full-width pill → 44×44 circle.
              Icon anchored at padding-left: 12px so it never moves. */}
          <motion.button
            type="button"
            aria-label="Search all games"
            onClick={handleSearchTap}
            className="flex h-[44px] flex-1 items-center overflow-hidden rounded-full pl-[12px] pr-[12px] text-left"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #ced5f5",
            }}
            animate={{
              width: collapsed ? 44 : "100%",
              flex: collapsed ? "0 0 44px" : "1 1 auto",
            }}
            transition={transition}
            whileTap={{ scale: 0.98 }}
          >
            <SearchIcon className="size-[20px] shrink-0 text-mrq-blue" />
            <motion.span
              className="overflow-hidden whitespace-nowrap text-[15px] font-semibold text-mrq-blue"
              style={{ display: "inline-block" }}
              animate={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 240,
                marginLeft: collapsed ? 0 : 8,
              }}
              transition={transition}
            >
              Search all games
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Gift button — solid MrQ blue with white icon, mirrors the home button.
            Red dot indicator stays in the top-right corner, ringed in the bar's
            light-blue fill so it pops off the navy background. */}
        <motion.button
          type="button"
          aria-label="Rewards"
          className="relative grid size-[52px] shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: "#0a2ecb",
            boxShadow:
              "0 12px 32px -16px rgba(10, 46, 203, 0.36), 0 2px 8px -2px rgba(10, 46, 203, 0.18)",
          }}
          whileTap={{ scale: 0.92 }}
          transition={FAST_SPRING}
        >
          <GiftIcon className="size-[24px] text-white" />
          <span
            className="absolute right-[14px] top-[14px] size-[8px] rounded-full"
            style={{
              backgroundColor: "#d50000",
              // Ring matches the bar's tinted fill so the dot reads cleanly
              // against the blue button.
              boxShadow: "0 0 0 2px rgba(230, 234, 250, 1)",
            }}
            aria-hidden
          />
        </motion.button>
      </nav>
      </motion.div>
    </>
  );
}

/* ----------- Inline icons (24×24 lucide-style outlines) ----------- */

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.172 3 11.05V21a1 1 0 0 0 1 1h5v-7h6v7h5a1 1 0 0 0 1-1v-9.95l-9-7.878Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="7" width="18" height="4" rx="1" />
      <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M12 7v14" />
      <path d="M12 7c-1.5-2-5.5-2-5.5 0 0 1 1 1.5 2.5 1.5 1.5 0 3-.5 3-1.5Z" />
      <path d="M12 7c1.5-2 5.5-2 5.5 0 0 1-1 1.5-2.5 1.5-1.5 0-3-.5-3-1.5Z" />
    </svg>
  );
}
