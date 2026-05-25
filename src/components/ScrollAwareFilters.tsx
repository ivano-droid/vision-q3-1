"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useFilter, type LobbyFilter } from "@/lib/filter-context";

/**
 * Sub-filter pills (Casino / Live / Bingo) that hide on scroll-down and
 * reveal on scroll-up — iOS-style.
 *
 * Each pill also acts as a content filter (see FilterContext):
 *   - In the `home` state, all three pills render in the active (white) style.
 *   - When one is selected, that pill stays white; the others switch to the
 *     dark-navy inactive style.
 *   - Tapping the active pill again toggles back to `home`.
 *
 * Layout:
 *   - `position: sticky; top: calc(env(safe-area-inset-top) + 68px)` — sticks
 *     immediately under the brand bar (iOS safe-area inset + 10 top padding +
 *     48 brand row + 10 bottom padding) so the two read as one continuous
 *     blue header at the top, whether in a regular browser or launched as an
 *     iOS PWA.
 *   - z-20, brand bar is z-30. The brand bar's solid blue bg means the
 *     pills disappear cleanly under it as they slide up.
 *
 * Scroll detection:
 *   - Always visible when `scrollY < 100` so the band never hides while the
 *     content below it hasn't yet scrolled past where the band sits.
 *   - Past 100, scrolling down by >4px hides, scrolling up by >4px shows.
 *   - rAF-throttled scroll handler.
 */
const ALWAYS_VISIBLE_BELOW = 100;
const DIRECTION_THRESHOLD = 4;
const BAND_HEIGHT = 46; // pills (36) + pb-[10px] (10). The matching 10px
// gap *above* the pills comes from the brand bar's own pb-[10px], so the
// space above and below the pill row reads as visually consistent.

export function ScrollAwareFilters() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY.current;
        lastY.current = y;

        if (y < ALWAYS_VISIBLE_BELOW) {
          setVisible(true);
          return;
        }
        if (Math.abs(delta) < DIRECTION_THRESHOLD) return;
        setVisible(delta < 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const transition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 36, mass: 0.85 };

  return (
    <motion.div
      className="sticky top-[calc(env(safe-area-inset-top)+68px)] z-20 bg-mrq-blue"
      initial={false}
      animate={{ y: visible ? 0 : -BAND_HEIGHT }}
      transition={transition}
      aria-hidden={!visible}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {/* Container padding tightened (was 23 → 16) so the 4 pills fit
          comfortably in the 375px viewport with breathing room. */}
      <div className="px-[16px] pb-[10px]">
        <nav className="flex items-center gap-[6px]" aria-label="Section filters">
          <FilterPill pillKey="casino" icon="/assets/icon-casino.svg" label="Casino" />
          <FilterPill pillKey="live" icon="/assets/icon-live.svg" label="Live" />
          <FilterPill pillKey="bingo" icon="/assets/icon-bingo.svg" label="Bingo" />
          {/* Arena uses pink as its brand accent — passed through to the
              text/icon when the pill is active, and as the pill fill when
              another filter is selected. */}
          <FilterPill
            pillKey="arena"
            icon="/assets/icon-arena.svg"
            label="Arena"
            accent="#e0007a"
          />
        </nav>
      </div>
    </motion.div>
  );
}

function FilterPill({
  pillKey,
  icon,
  label,
  accent,
}: {
  pillKey: Exclude<LobbyFilter, "home">;
  icon: string;
  label: string;
  /** Per-pill accent colour. When the pill is active the icon + label
   *  take this colour (defaults to navy). When inactive, the pill fill
   *  takes this colour (defaults to dark navy). Used for Arena's pink. */
  accent?: string;
}) {
  const { filter, togglePill } = useFilter();
  // In `home`, every pill reads as active so the row matches the original
  // unfiltered look. Once a filter is selected, only that pill stays active.
  const active = filter === "home" || filter === pillKey;
  const activeColor = accent ?? "#0c2287";
  const inactiveColor = accent ?? "#0c2287";

  return (
    <motion.button
      type="button"
      onClick={() => togglePill(pillKey)}
      aria-pressed={filter === pillKey}
      // Tighter padding + smaller height + min-w-0 so 4 pills can share the
      // 375px viewport without one being squeezed out. flex-1 keeps them
      // evenly distributed, min-w-0 lets the flexbox actually shrink them
      // (default min-width: auto would force them to their content width).
      className="flex flex-1 min-w-0 items-center justify-center gap-[4px] rounded-full px-[8px] py-[6px] h-[34px]"
      style={{
        backgroundColor: active ? "#ffffff" : inactiveColor,
        color: active ? activeColor : "#ffffff",
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      {/* Icon rendered as a mask so its colour follows the text colour —
          single SVG asset works for both active and inactive states. */}
      <span
        aria-hidden
        className="block bg-current shrink-0"
        style={{
          width: "18px",
          height: "14px",
          maskImage: `url(${icon})`,
          WebkitMaskImage: `url(${icon})`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
      <span
        className="text-[13px] leading-none font-extrabold whitespace-nowrap"
        style={{ letterSpacing: "0" }}
      >
        {label}
      </span>
    </motion.button>
  );
}
