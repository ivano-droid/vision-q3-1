"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * App loading splash — Figma node 71:14585.
 *
 * Layout (all proportions derived from the Figma design frame, 375 × 812):
 *
 *   Blue panel:      0,0  →  375 × 490   (top 60.34% of the viewport)
 *   MrQ logo:        x:15 y:327 w:347 h:136  (within the blue panel — 4% from
 *                    left, 66.7% down the panel, 92.5% wide)
 *   Tagline image:   x:6 y:507 w:353.133 h:84.136  (in the white area, 17px
 *                    below the blue panel)
 *
 * Because both the logo and tagline are SVG assets exported straight from
 * Figma, every glyph, kerning and the deliberate height difference between
 * "THE CASINO YOU" and "LOVE TO HATE" (lower line is heavier so both lines
 * read the same width) is preserved exactly as designed.
 *
 * Storyboard beats:
 *   0ms          white screen
 *   0–500ms      blue panel slides + bounces down from the top
 *   400–1000ms   MrQ logo bounces down from above (delayed so the panel has
 *                already settled), lands in its slot inside the blue panel
 *   1000–1500ms  tagline fades in below the blue
 *   1500–2800ms  hold
 *   2800–3200ms  blue panel (with logo inside) slides back up off-screen;
 *                tagline fades + slides down at the same time
 *   3200–3400ms  whole splash fades out, lobby is revealed
 *
 * Total ≈ 3.4s.
 */

// Figma design frame dimensions. Used to convert absolute Figma coordinates
// into responsive percentages.
const FW = 375;
const FH = 812;

// Blue panel
const PANEL_H_PCT = (490 / FH) * 100;          // 60.34%

// Logo inside the blue panel (positions relative to the *panel*, not the
// viewport, so the logo travels with the panel on exit).
const LOGO_TOP_PCT = (327 / 490) * 100;        // 66.73%
const LOGO_LEFT_PCT = (15 / FW) * 100;          // 4%
const LOGO_W_PCT = (347 / FW) * 100;            // 92.53%
// Width-only sizing + aspect-ratio: avoid setting an explicit height (which
// would stretch the SVG vertically when the viewport's aspect ratio differs
// from the 375:812 Figma design — exactly what was making the assets look
// squashed in mobile Safari).
const LOGO_ASPECT = "347 / 136";

// Tagline (lives in the white area, positioned relative to the *viewport*).
const TAG_TOP_PCT = (507 / FH) * 100;           // 62.44%
const TAG_LEFT_PCT = (6 / FW) * 100;            // 1.6%
const TAG_W_PCT = (353.133 / FW) * 100;         // 94.17%
const TAG_ASPECT = "353.133 / 84.136";

export function LoadingSplash() {
  const [mounted, setMounted] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2800);
    const unmountTimer = setTimeout(() => setMounted(false), 3400);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // Spring tunings tuned for "bounces down" feel.
  const panelDrop = {
    type: "spring" as const,
    stiffness: 260,
    damping: 18,
    mass: 0.9,
  };
  const logoDrop = {
    type: "spring" as const,
    stiffness: 220,
    damping: 14,
    mass: 1.0,
  };
  const exitEase = {
    duration: 0.4,
    ease: [0.55, 0, 0.45, 1] as [number, number, number, number],
  };

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[60] overflow-hidden bg-white"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden
        >
          {/* Blue panel — top 60.34% of viewport. Slides + bounces down on
              entry, slides back up on exit (logo travels with it). */}
          <motion.div
            className="absolute left-0 right-0 top-0 bg-mrq-blue"
            style={{ height: `${PANEL_H_PCT}%` }}
            initial={{ y: "-100%" }}
            animate={{ y: exiting ? "-100%" : 0 }}
            transition={exiting ? exitEase : panelDrop}
          >
            {/* MrQ logo — child of the blue panel so it slides up *with* the
                panel on exit. Position + size are exact Figma proportions
                (x:15 y:327 w:347 h:136 inside the 375×490 panel). */}
            <motion.img
              src="/assets/splash-logo.svg"
              alt="MrQ"
              className="absolute"
              style={{
                top: `${LOGO_TOP_PCT}%`,
                left: `${LOGO_LEFT_PCT}%`,
                width: `${LOGO_W_PCT}%`,
                aspectRatio: LOGO_ASPECT,
                height: "auto",
              }}
              // Starts far above the viewport. Spring drops it into its slot
              // after a delay long enough for the blue panel to settle.
              initial={{ y: -650, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={
                exiting
                  ? { duration: 0 } // moves with the panel
                  : { ...logoDrop, delay: 0.4 }
              }
            />
          </motion.div>

          {/* Tagline — Figma SVG asset (the "LOVE TO HATE" lower line is
              intentionally taller than "THE CASINO YOU" so both lines read
              the same visual width). Positioned in the viewport per Figma
              71:14591. Fades in after the logo lands; fades + slides down
              on exit. */}
          <motion.img
            src="/assets/splash-tagline.svg"
            alt="The casino you love to hate"
            className="absolute"
            style={{
              top: `${TAG_TOP_PCT}%`,
              left: `${TAG_LEFT_PCT}%`,
              width: `${TAG_W_PCT}%`,
              aspectRatio: TAG_ASPECT,
              height: "auto",
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: exiting ? 0 : 1,
              y: exiting ? 24 : 0,
            }}
            transition={
              exiting
                ? { duration: 0.35, ease: [0.55, 0, 0.45, 1] }
                : { duration: 0.5, delay: 1.0, ease: [0.22, 1, 0.36, 1] }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
