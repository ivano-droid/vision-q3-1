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
 *   - `position: sticky; top: 112px` — sticks immediately under the 112px
 *     brand bar (54 status + 48 brand row + 10 brand-bar bottom padding) so
 *     the two read as one continuous blue header at the top.
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
const BAND_HEIGHT = 42; // pills (32) + pb-[10px] (10). The matching 10px
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
      className="sticky top-[112px] z-20 bg-mrq-blue"
      initial={false}
      animate={{ y: visible ? 0 : -BAND_HEIGHT }}
      transition={transition}
      aria-hidden={!visible}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="px-[23px] pb-[10px]">
        <nav className="flex items-center gap-[8px]" aria-label="Section filters">
          <FilterPill pillKey="casino" icon="/assets/icon-casino.svg" label="Casino" />
          <FilterPill pillKey="live" icon="/assets/icon-live.svg" label="Live" />
          <FilterPill pillKey="bingo" icon="/assets/icon-bingo.svg" label="Bingo" />
        </nav>
      </div>
    </motion.div>
  );
}

function FilterPill({
  pillKey,
  icon,
  label,
}: {
  pillKey: Exclude<LobbyFilter, "home">;
  icon: string;
  label: string;
}) {
  const { filter, togglePill } = useFilter();
  // In `home`, every pill reads as active so the row matches the original
  // unfiltered look. Once a filter is selected, only that pill stays active.
  const active = filter === "home" || filter === pillKey;

  return (
    <motion.button
      type="button"
      onClick={() => togglePill(pillKey)}
      aria-pressed={filter === pillKey}
      className="flex flex-1 items-center justify-center gap-[6px] rounded-full px-[14px] py-[6px] h-[32px]"
      style={{
        backgroundColor: active ? "#ffffff" : "#0c2287",
        color: active ? "#0c2287" : "#ffffff",
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      {/* Icon rendered as a mask so its colour follows the text colour —
          single SVG asset works for both active and inactive states. */}
      <span
        aria-hidden
        className="block bg-current"
        style={{
          width: "20px",
          height: "16px",
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
        className="text-[14px] leading-none font-extrabold whitespace-nowrap"
        style={{ letterSpacing: "0.2px" }}
      >
        {label}
      </span>
    </motion.button>
  );
}
