"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useFilter, type LobbyFilter } from "@/lib/filter-context";
import { HomeView } from "./views/HomeView";
import { CasinoView } from "./views/CasinoView";
import { LiveView } from "./views/LiveView";
import { BingoView } from "./views/BingoView";

/**
 * Lobby content shell.
 *
 * Home view stands alone — when the user is at `home`, we render just the
 * default lobby (HomeView). The three filter views (Casino / Live / Bingo)
 * are rendered together as a horizontal swipe strip.
 *
 * Transition behaviour:
 *   - home → filter view: filter slides in from the right (feels like a
 *     swipe to the right); home fades out underneath.
 *   - filter view → home: filter fades out; home fades in. Pure crossfade,
 *     no slide — going back to the lobby shouldn't feel like a swipe.
 *   - between filter views (casino ⇄ live ⇄ bingo): the SwipeStrip handles
 *     its own X-translate; the wrapper stays mounted so no fade fires.
 *
 * Strip height handling:
 *   - All three filter panels are in the DOM so the strip can translateX
 *     between them. We measure each panel via ResizeObserver and animate
 *     the wrapper height to the active panel's height, so shorter views
 *     (Bingo) don't leave empty space below.
 */

const FILTERED_ORDER: Exclude<LobbyFilter, "home">[] = ["casino", "live", "bingo"];

export function LobbyContent() {
  const { filter } = useFilter();
  const isHome = filter === "home";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isHome ? (
        // Home: fades both in and out. We're either arriving back at the
        // lobby (fade in) or leaving it (fade out — its replacement will
        // slide in over the top).
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <HomeView />
        </motion.div>
      ) : (
        // Filter strip: slides IN from the right (when arriving from home),
        // fades OUT (when going back to home). Asymmetric on purpose so
        // forward motion feels like a swipe and backward feels like a
        // dismiss.
        <motion.div
          key="strip"
          initial={{ x: "100%" }}
          animate={{
            x: 0,
            transition: { type: "spring", stiffness: 360, damping: 36, mass: 0.7 },
          }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
        >
          <SwipeStrip activeIndex={FILTERED_ORDER.indexOf(filter)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SwipeStrip({ activeIndex }: { activeIndex: number }) {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [activeHeight, setActiveHeight] = useState<number | null>(null);

  // Keep the active panel's height in sync via ResizeObserver. The wrapper
  // animates to match, so shorter views (Bingo) don't leave empty space.
  useEffect(() => {
    const el = panelRefs.current[activeIndex];
    if (!el) return;
    const update = () => setActiveHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIndex]);

  return (
    <motion.div
      className="relative overflow-x-clip overflow-y-clip"
      animate={{ height: activeHeight ?? undefined }}
      transition={{ type: "spring", stiffness: 240, damping: 32, mass: 1.0 }}
    >
      <motion.div
        className="flex items-start"
        style={{ width: "300%" }}
        animate={{ x: `${-activeIndex * (100 / 3)}%` }}
        transition={{ type: "spring", stiffness: 240, damping: 32, mass: 1.0 }}
      >
        <Panel innerRef={(el) => (panelRefs.current[0] = el)}><CasinoView /></Panel>
        <Panel innerRef={(el) => (panelRefs.current[1] = el)}><LiveView /></Panel>
        <Panel innerRef={(el) => (panelRefs.current[2] = el)}><BingoView /></Panel>
      </motion.div>
    </motion.div>
  );
}

function Panel({
  children,
  innerRef,
}: {
  children: React.ReactNode;
  innerRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={innerRef} className="shrink-0" style={{ width: "33.3333%" }}>
      {children}
    </div>
  );
}
