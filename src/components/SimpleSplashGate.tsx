"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useShell } from "@/lib/filter-context";

/**
 * Simple branded splash — the returning-user counterpart to the
 * WelcomeGate.
 *
 *   ┌─────────────────────────────┐
 *   │                             │
 *   │           MrQ               │  ← brand wordmark
 *   │                             │
 *   └─────────────────────────────┘
 *
 * Plays for ~1500 ms on every app open ONLY if the user has the
 * `hasLoggedIn` flag set in localStorage. First-time users get the
 * WelcomeGate instead; this component dismisses itself instantly
 * for them.
 *
 * Sits at z-[65] — above the WelcomeGate (z-[60]) so on first
 * paint the brand-blue splash surface covers both possible paths
 * (welcome OR splash), and the right one stays visible after the
 * mount-time localStorage check decides. Brand-blue surface on
 * both gates means there's no visible artifact when the wrong one
 * dismisses behind the right one.
 *
 * On dismiss it fires `markBootDone` so the LoginGate (which is
 * mounted but gated on bootDone + !hasLoggedIn) can run its own
 * skip check and stay hidden for returning users.
 *
 * The user mentioned they'll redesign this screen next — keep the
 * markup minimal so the swap stays simple.
 */

const HOLD_MS = 1500;

export function SimpleSplashGate() {
  const { markBootDone } = useShell();
  const [visible, setVisible] = useState(true);

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

    // Returning user — hold the splash briefly, then mark boot
    // done and fade out. LoginGate also gates on hasLoggedIn so
    // it won't show.
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
          className="fixed top-0 bottom-0 z-[65] overflow-hidden flex items-center justify-center"
          style={{
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
            backgroundColor: "var(--mrq-blue)",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.55, 0, 0.45, 1] }}
          aria-hidden
        >
          {/* MrQ wordmark — same mask-image trick the other gates
              use so the SVG's preserveAspectRatio="none" baked in
              doesn't stretch it. 140×54 at the natural 83:32
              ratio. White paint on the brand-blue surface. */}
          <span
            role="img"
            aria-label="MrQ"
            style={{
              display: "block",
              width: 140,
              height: 54,
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
