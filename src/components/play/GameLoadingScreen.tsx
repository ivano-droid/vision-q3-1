"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Brand-blue full-screen "game incoming" splash shown before a
 * /play/* route reveals its game UI. Two purposes: cover the
 * real game while its heavy assets stream in, and give the brand
 * one beat of personality between the lobby tap and the game.
 *
 * Choreography (per Figma 317:93585):
 *
 *   0.15s  Q Approved badge drops + scale-pops into the top
 *          third — quick spring overshoot, lands first so the
 *          eye picks up the brand mark immediately.
 *   0.45s  "This game was picked by our casino nerds" sticker
 *          pops in centred, with a tiny rotate-from-tilted
 *          settle so it lands like a stamp rather than fading in.
 *   0.85s  Game logo slides up from below — same easing as a
 *          card snapping into a hand.
 *   1.15s  RTP block fades up under the logo (subtle, since it
 *          carries data not character).
 *   ~1.5s  All beats settled. The overlay holds visible for
 *          ~700 ms more so the user can read the headline before
 *          the wrapper page fades it out at 2.2 s total.
 *
 * Reduced-motion path: skip the springs and just snap each
 * element to its final position so the screen still composes
 * correctly without animation.
 *
 * Assets the consumer must provide:
 *   • /assets/q_approved_loading.png  — circular brand-mark badge
 *   • /assets/picked_by_nerds_loading.png — outlined sticker text
 *     ("This game was picked by our casino nerds" + sub-line)
 *   • Game-specific logo passed as the `gameLogo` prop
 *
 * Width clamps to the mobile-frame on desktop via
 * --frame-right-offset, matching every other fixed overlay in
 * the app (BottomNav, SideNav, etc.) so the loading screen
 * never escapes the 375-px column on the preview surround.
 */
export function GameLoadingScreen({
  gameLogo,
  gameLogoWidth = 220,
  rtp,
}: {
  /** Path to the game's loading-screen logo (e.g.
   *  /assets/games/buffalo-bills-logo.svg). Different from the
   *  full hero artwork used inside the game itself — typically
   *  a smaller stylised wordmark. */
  gameLogo: string;
  /** Display width of the game logo in px. Defaults to 220
   *  which fits the Figma layout; pass a narrower value for
   *  longer wordmarks. */
  gameLogoWidth?: number;
  /** Display RTP, e.g. "92.99%". Surfaces under the game logo. */
  rtp: string;
}) {
  const reduce = useReducedMotion();

  // Skip springs and zero-out delays for reduced-motion users —
  // the screen still composes correctly, just lands instantly.
  const transition = (delay: number, spring: boolean = true) =>
    reduce
      ? { duration: 0 }
      : spring
        ? {
            type: "spring" as const,
            stiffness: 280,
            damping: 18,
            mass: 0.9,
            delay,
          }
        : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay };

  return (
    <div
      className="fixed top-0 bottom-0 z-[60] flex flex-col items-center pointer-events-auto"
      style={{
        left: "var(--frame-right-offset)",
        right: "var(--frame-right-offset)",
        // Brand blue — matches /assets/q-approved.svg's stamp
        // background and the rest of the brand surfaces.
        backgroundColor: "var(--mrq-blue, #0a2ecb)",
        // Top safe-area inset keeps the Q badge clear of the
        // notch/island on iPhone; bottom inset eats the home-
        // indicator gap.
        paddingTop: "calc(env(safe-area-inset-top) + 80px)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* Q Approved badge — first beat */}
      <motion.img
        src="/assets/q_approved_loading.png"
        alt=""
        draggable={false}
        initial={{ scale: 0.55, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={transition(0.15)}
        style={{
          width: 140,
          height: 140,
          objectFit: "contain",
          display: "block",
        }}
      />

      {/* Sticker — second beat. Lands with a tiny tilt-settle
          so it feels stamped onto the surface, not faded in. */}
      <motion.img
        src="/assets/picked_by_nerds_loading.png"
        alt="This game was picked by our casino nerds"
        draggable={false}
        initial={{ scale: 0.7, opacity: 0, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={transition(0.45)}
        style={{
          width: "100%",
          maxWidth: 320,
          height: "auto",
          marginTop: 36,
          display: "block",
        }}
      />

      {/* Spacer — push the game-logo + RTP block to the lower
          half of the visible area without using flex-1 (would
          stretch responsive widths in awkward ways on short
          phones). */}
      <div style={{ flex: "1 1 0", minHeight: 24 }} />

      {/* Game logo — third beat, slide-up like a card landing. */}
      <motion.img
        src={gameLogo}
        alt=""
        draggable={false}
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={transition(0.85)}
        style={{
          width: gameLogoWidth,
          maxWidth: "100%",
          height: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />

      {/* RTP — fourth beat, subtle fade-up. Smaller motion
          because it's supporting data, not character. */}
      <motion.div
        className="text-center"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={transition(1.15, false)}
        style={{ marginTop: 28 }}
      >
        <p
          className="text-[14px] font-bold text-white"
          style={{ opacity: 0.75, letterSpacing: 1.5 }}
        >
          RTP
        </p>
        <p
          className="text-[26px] font-extrabold text-white"
          style={{ marginTop: 4 }}
        >
          {rtp}
        </p>
      </motion.div>

      {/* Bottom breathing room so RTP doesn't kiss the home
          indicator on iPhone. */}
      <div style={{ height: 48 }} />
    </div>
  );
}
