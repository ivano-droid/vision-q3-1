"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useShell } from "@/lib/filter-context";

/**
 * Branded splash for the returning user (Figma 318:94603).
 *
 *   ┌─────────────────────────────┐
 *   │                             │
 *   │          MrQ                │  ← logo scales up from 0.6 → 1
 *   │   THE CASINO YOU            │  ← sub-line rises + fades in
 *   │   LOVE TO HATE              │
 *   │                             │
 *   │                             │
 *   │       [character]           │  ← Mr Q character, slides up
 *   │                             │     from below + fades in
 *   └─────────────────────────────┘
 *
 * The tagline is rendered from a flattened SVG (Figma 273:66869)
 * — the type was already outlined in the source design, so we
 * ship the exact strokes rather than re-typesetting in webfonts.
 * This sidesteps any font-loading flicker on first paint. The
 * character is a PNG (man_splash.png) anchored to the bottom of
 * the splash.
 *
 * Plays for ~2600 ms on every app open ONLY if the user has the
 * `hasLoggedIn` flag set in localStorage. First-time users get the
 * WelcomeGate instead; this component dismisses itself instantly
 * for them.
 *
 * Sits at z-[65] — above the WelcomeGate (z-[60]) so on first
 * paint the brand-blue splash surface covers both possible paths,
 * and the right one stays visible after the mount-time
 * localStorage check decides.
 */

const HOLD_MS = 2600;

export function SimpleSplashGate() {
  const { markBootDone } = useShell();
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasLoggedIn = localStorage.getItem("hasLoggedIn") === "1";

    if (!hasLoggedIn) {
      // First-time user — the WelcomeGate underneath takes over.
      // Dismiss instantly without firing bootDone so the welcome
      // flow gets to control that signal.
      setVisible(false);
      return;
    }

    // Returning user — show the splash, run the entrance animations,
    // then mark boot done and fade out.
    setActive(true);
    const timer = window.setTimeout(() => {
      markBootDone();
      setVisible(false);
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [markBootDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 bottom-0 z-[65] overflow-hidden flex flex-col"
          style={{
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
            // Very subtle vertical gradient — slightly lighter
            // brand-blue at the top easing back to --mrq-blue at
            // the bottom. Just enough to lift the surface off
            // flat; doesn't darken the lower half of the splash.
            background:
              "linear-gradient(180deg, #1432d3 0%, #0a2ecb 100%)",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.55, 0, 0.45, 1] }}
          aria-hidden
        >
          {/* ───────────────────────────────────────────────
              UPPER BLOCK — sits centred in the top portion
              of the screen. Logo + tagline.
              ─────────────────────────────────────────────── */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              // ~38% from top, leaves the lower half empty so the
              // bottom block reads as a separate moment.
              flex: "0 0 auto",
              marginTop: "30vh",
              gap: 20,
            }}
          >
            {/* MrQ wordmark — mask-image keeps the SVG from being
                stretched (the source has preserveAspectRatio="none"
                baked in). Scales from 0.6 → 1 on mount. */}
            {active && (
              <motion.div
                role="img"
                aria-label="MrQ"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  display: "block",
                  width: 168,
                  height: 64,
                  backgroundColor: "#ffffff",
                  WebkitMaskImage: "url(/assets/logo-mrq.svg)",
                  maskImage: "url(/assets/logo-mrq.svg)",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            )}

            {/* Tagline — "THE CASINO YOU / LOVE TO HATE", lifted
                from Figma 273:66869 as a flattened SVG so the
                strokes (and the yellow "CASINO" accent) match
                exactly without depending on webfont weights. The
                wrapper rises + fades in just after the logo
                settles. */}
            {active && (
              <motion.img
                src="/assets/splash/casino.svg"
                alt=""
                draggable={false}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2,
                }}
                style={{
                  display: "block",
                  // Tagline SVG viewBox is ≈4.45:1. Smaller height
                  // (36px) keeps it as a quiet sub-line under the
                  // big MrQ wordmark — matches the design where
                  // the tagline reads as supporting copy, not a
                  // co-equal headline.
                  height: 36,
                  width: "auto",
                }}
              />
            )}
          </div>

          {/* ───────────────────────────────────────────────
              BOTTOM BLOCK — Mr Q character (man_splash.png).
              Anchored to the BOTTOM-RIGHT edge of the splash so
              the character leans into the corner like a poster
              edge rather than sitting centred on a pedestal.
              Slides up from 64-px below its resting position +
              fades in from 0, ~0.4 s after the tagline so it
              reads as the third beat in the choreography
              (logo → tagline → character).
              ─────────────────────────────────────────────── */}
          {active && (
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "flex-end",
                pointerEvents: "none",
              }}
            >
              <motion.img
                src="/assets/man_splash.png"
                alt=""
                draggable={false}
                initial={{ y: 64, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.42,
                }}
                style={{
                  display: "block",
                  // ~85% of the mobile-frame column — a touch
                  // bigger than before so the character has real
                  // presence, but still leaves room on the left
                  // for the brand-blue surface to breathe.
                  width: "85%",
                  maxWidth: 400,
                  height: "auto",
                }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
