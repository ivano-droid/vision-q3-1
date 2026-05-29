"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useShell } from "@/lib/filter-context";

/**
 * Welcome gate — Figma 260:37631.
 *
 *   ┌────────────────────────────────┐
 *   │           MrQ                  │  ← brand wordmark (white)
 *   │  ┌──────────────────────────┐  │
 *   │  │                          │  │
 *   │  │   [hero video / image]   │  │  ← rounded-24 video card
 *   │  │                          │  │     (welcome.mp4 once dropped
 *   │  │                          │  │      into /public/assets/welcome/)
 *   │  └──────────────────────────┘  │
 *   │                                │
 *   │  ┌──────────────────────────┐  │
 *   │  │        Sign up            │  │  ← white CTA, brand-blue text
 *   │  └──────────────────────────┘  │
 *   │  ┌──────────────────────────┐  │
 *   │  │        Log in             │  │  ← Brand/900 dark-blue CTA
 *   │  └──────────────────────────┘  │
 *   │  ⓲  GambleAware   ★ Trustpilot │  ← footer trust strip
 *   └────────────────────────────────┘
 *
 * Sits at the very top of the onboarding flow: Welcome → Login → My Q.
 * Replaces the previous LoadingSplash on every app open (per design,
 * "for now, every refresh") — fires `markBootDone` when dismissed so
 * the LoginGate (z-[55]) becomes visible underneath right after.
 *
 * Either button (Sign up or Log in) dismisses the welcome and reveals
 * the login form. Sign-up doesn't have its own flow yet — both
 * actions land on the same login screen for now.
 */

export function WelcomeGate() {
  const { markBootDone } = useShell();
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = () => {
    // Tell the rest of the app that the boot phase is over so the
    // LoginGate (which gates on bootDone) can take over the screen.
    markBootDone();
    setVisible(false);
  };

  // No SSR render — overlay is client-only to avoid hydration noise.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 bottom-0 z-[60] overflow-hidden"
          style={{
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
            // Figma surface: brand-blue.
            backgroundColor: "var(--mrq-blue)",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.55, 0, 0.45, 1] }}
          role="dialog"
          aria-label="Welcome to MrQ"
        >
          <div
            className="flex flex-col h-full w-full items-center"
            style={{
              paddingTop: "calc(env(safe-area-inset-top) + 12px)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
              paddingLeft: 16,
              paddingRight: 16,
              gap: 12,
            }}
          >
            {/* MrQ wordmark — already shipped white-filled, so a
                plain <img> renders correctly on the blue surface.
                Size from the Figma node (105×57). */}
            <div className="flex flex-col items-center w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo-mrq.svg"
                alt="MrQ"
                width={105}
                height={57}
                style={{ width: 105, height: 57 }}
                draggable={false}
              />
            </div>

            {/* Hero video card — fills the flex slot between the
                logo and the CTAs, capped at 321px wide so it sits
                inside the page gutter even on a 375px frame. The
                MP4 lives at /assets/videos/video-welcome.mp4 next
                to the rest of the Top-Picks reel clips. */}
            <div
              className="flex-1 flex items-center justify-center w-full"
              style={{ minHeight: 0 }}
            >
              <div
                className="relative overflow-hidden rounded-[24px]"
                style={{
                  width: "min(100%, 321px)",
                  height: "100%",
                  backgroundColor: "#0c2287",
                }}
              >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src="/assets/videos/video-welcome.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-cover"
                  // If the file ever goes missing, hide the broken
                  // play icon and let the Brand/900 wash behind
                  // read as the fallback.
                  onError={(e) => {
                    (e.currentTarget as HTMLVideoElement).style.display =
                      "none";
                  }}
                />
              </div>
            </div>

            {/* CTA stack + footer */}
            <div className="flex flex-col items-stretch w-full" style={{ gap: 20 }}>
              <button
                type="button"
                onClick={dismiss}
                className="w-full active:scale-[0.99] transition-transform"
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  color: "var(--mrq-blue)",
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: "24px",
                  letterSpacing: -0.2,
                }}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="w-full active:scale-[0.99] transition-transform"
                style={{
                  height: 48,
                  borderRadius: 12,
                  // Brand/900 — slightly darker than the page bg.
                  backgroundColor: "#0c2287",
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: "24px",
                  letterSpacing: -0.2,
                }}
              >
                Log in
              </button>

              {/* Footer trust badges — 18+, GambleAware, Trustpilot.
                  All three are downloaded SVGs sized to the Figma
                  spec (20px tall). */}
              <div
                className="flex items-center justify-center"
                style={{ gap: 20, paddingTop: 4 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/welcome/eighteen-plus.svg"
                  alt="18+"
                  width={36}
                  height={20}
                  style={{ width: 36, height: 20 }}
                  draggable={false}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/welcome/gambleaware.svg"
                  alt="GambleAware"
                  width={108}
                  height={20}
                  style={{ width: 108, height: 20 }}
                  draggable={false}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/welcome/trustpilot.svg"
                  alt="Trustpilot"
                  width={82}
                  height={20}
                  style={{ width: 82, height: 20 }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
