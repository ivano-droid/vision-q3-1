"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BuffaloBillsView } from "@/components/views/BuffaloBillsView";
import { GameLoadingScreen } from "@/components/play/GameLoadingScreen";

/**
 * /play/buffalo-bills — full-screen game page reachable from the
 * Recently Played Games grid on the My Q lobby.
 *
 * AppShell hides BrandBar + BottomNav on /play/* routes and sets the
 * mobile-frame surface to dark navy, so this page can paint its own
 * in-game header + dark backdrop without the global chrome competing.
 *
 * Loading splash — the GameLoadingScreen renders on top of the game
 * for ~2.2 s with the staggered Q-stamp / "picked by nerds" / game
 * logo / RTP choreography before fading out. The actual
 * BuffaloBillsView mounts immediately underneath so its heavy
 * assets (slot artwork, video, etc.) start streaming while the
 * splash is on screen — no white flash when the splash dismisses.
 *
 * Re-fires on every mount of this route, so deep-linking, tile-
 * tapping from the lobby, and reloading all show the splash.
 */

// Total time the loading splash holds before its fade-out begins.
// The component's own staggered animations finish at ~1.5 s; the
// extra ~700 ms gives the user a beat to read the headline before
// the game appears.
const LOADING_HOLD_MS = 2200;

export default function BuffaloBillsPage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), LOADING_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Mount the game underneath the splash immediately so its
          assets pre-load while the splash is on screen — when the
          splash fades, the game is already painted behind it and
          there's no flash to a half-loaded state. */}
      <BuffaloBillsView />

      <AnimatePresence>
        {showSplash && (
          <motion.div
            // Wrapper handles ONLY the fade-out — the internal
            // staggered choreography lives inside GameLoadingScreen.
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <GameLoadingScreen
              gameLogo="/assets/buffalo_bills_logo_loading.png"
              rtp="92.99%"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
