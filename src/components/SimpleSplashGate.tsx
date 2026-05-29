"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useShell } from "@/lib/filter-context";

/**
 * Branded splash for the returning user (Figma 273:66782).
 *
 *   ┌─────────────────────────────┐
 *   │                             │
 *   │          MrQ                │  ← logo scales up from 0.6 → 1
 *   │   THE CASINO YOU            │  ← sub-line rises + fades in
 *   │   LOVE TO HATE              │
 *   │                             │
 *   │                             │
 *   │   All winnings              │  ← fades in from the LEFT
 *   │        paid in cash         │  ← fades in from the RIGHT
 *   │                             │
 *   └─────────────────────────────┘
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

// Yellow accent on the word "CASINO" in the tagline — matches the
// MrQ brand swatch used elsewhere (Worth £50 highlight, etc.).
const CASINO_YELLOW = "#FFD400";

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
            backgroundColor: "var(--mrq-blue)",
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

            {/* Tagline — "THE CASINO YOU / LOVE TO HATE", rises up
                + fades in just after the logo settles. The second
                line uses a larger font size than the first so it
                visually fills the same width even though "LOVE TO
                HATE" has fewer characters than "THE CASINO YOU"
                — matches the Figma cadence. */}
            {active && (
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2,
                }}
                className="text-center"
                style={{
                  color: "#ffffff",
                  fontFamily: "var(--font-manrope), 'Gilroy', sans-serif",
                  fontWeight: 800,
                  letterSpacing: 0.4,
                  lineHeight: 1.12,
                  textTransform: "uppercase",
                }}
              >
                <div style={{ fontSize: 20 }}>
                  THE <span style={{ color: CASINO_YELLOW }}>CASINO</span> YOU
                </div>
                <div style={{ fontSize: 30, marginTop: 2 }}>LOVE TO HATE</div>
              </motion.div>
            )}
          </div>

          {/* ───────────────────────────────────────────────
              BOTTOM BLOCK — "All winnings / paid in cash".
              Line 1 slides in from the left, line 2 slides
              in from the right.
              ─────────────────────────────────────────────── */}
          {active && (
            <div
              className="text-white"
              style={{
                marginTop: "auto",
                paddingLeft: 24,
                paddingRight: 24,
                paddingBottom: "calc(env(safe-area-inset-bottom) + 56px)",
                fontFamily: "var(--font-anton), 'Anton', 'Gilroy', sans-serif",
                fontWeight: 700,
                fontSize: 48,
                letterSpacing: -0.4,
                lineHeight: 1.05,
              }}
            >
              <motion.div
                initial={{ x: -56, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.38,
                }}
                style={{ textAlign: "left" }}
              >
                All winnings
              </motion.div>
              <motion.div
                initial={{ x: 56, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.58,
                }}
                style={{ textAlign: "right" }}
              >
                paid in cash
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
