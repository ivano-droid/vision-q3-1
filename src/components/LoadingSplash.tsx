"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useFilter } from "@/lib/filter-context";

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
 *   400–1000ms   MrQ logo bounces (subtle, not springy) down from above,
 *                lands in its slot inside the blue panel
 *   1000–1500ms  tagline fades in below the blue
 *   1500–2000ms  hold
 *   2000ms       lobby is told it's safe to deal in (bootDone fires)
 *   2000–2500ms  blue panel slides back up + tagline fades + WHITE WRAPPER
 *                fades out — the cards' deal-in animation is visible
 *                through the dissolving splash
 *   2500ms       splash unmounts cleanly
 *
 * Total ≈ 2.5s. The dissolve overlaps the lobby's entrance choreography
 * so the two read as a single hand-off, not "splash, then splash gone,
 * then lobby appears".
 */

// Figma design frame dimensions. Used to convert absolute Figma coordinates
// into responsive percentages.
const FW = 375;
const FH = 812;

// Blue panel
const PANEL_H_PCT = (490 / FH) * 100;          // 60.34%

// Logo inside the blue panel (positions relative to the *panel*, not the
// viewport, so the logo travels with the panel on exit).
// Pulled up from the Figma-exact 66.73% — the Q's curl was sitting too close
// to the blue/white seam and visually bleeding into the tagline area.
const LOGO_TOP_PCT = (290 / 490) * 100;        // 59.18%
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
  const { markBootDone } = useFilter();

  useEffect(() => {
    // Fire `bootDone` and `exiting` simultaneously. The splash wrapper fades
    // out while the cards deal in — the two motions overlap so the user
    // sees the cards arriving as the splash dissolves, not after.
    const exitTimer = setTimeout(() => {
      markBootDone();
      setExiting(true);
    }, 2000);
    const unmountTimer = setTimeout(() => setMounted(false), 2500);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, [markBootDone]);

  // Spring tunings tuned for "bounces down" feel.
  const panelDrop = {
    type: "spring" as const,
    stiffness: 260,
    damping: 18,
    mass: 0.9,
  };
  // Logo drop — just one subtle bounce, then settled. Damping 22 keeps a
  // single hint of springiness (visible micro-overshoot) without the
  // boing-boing oscillation that 14 was producing.
  const logoDrop = {
    type: "spring" as const,
    stiffness: 260,
    damping: 22,
    mass: 0.9,
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
          // The whole splash wrapper (including the white background)
          // fades QUICKLY (250ms) so the lobby behind is revealed while
          // the cards are still mid deal-in — the user actually sees the
          // tiles arriving, instead of the deal-in finishing behind an
          // opaque wrapper.
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={exiting ? { duration: 0.25, ease: [0.55, 0, 0.45, 1] } : { duration: 0 }}
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
