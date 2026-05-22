"use client";

import { motion } from "framer-motion";
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
 * default lobby (HomeView).
 *
 * The three filter views (Casino / Live / Bingo) are rendered together as a
 * single horizontal strip — `[Casino | Live | Bingo]`. When the user switches
 * between filters, the strip animates its `translateX` so the matching panel
 * slides into the viewport. Going Casino → Bingo visibly passes through Live
 * in the middle, matching the "three panels side-by-side" prototype.
 *
 * Height handling:
 *   - All three panels are in the DOM so the strip can translateX between
 *     them. Without intervention, the wrapper would always be the height of
 *     the *tallest* panel, leaving a big gap under shorter ones (e.g. Bingo).
 *   - We measure each panel via ResizeObserver and animate the wrapper height
 *     to the active panel's height. The off-strip panels become unreachable
 *     (overflow-y: clip) but their content still mounts so the slide can
 *     show them in transit.
 */

const FILTERED_ORDER: Exclude<LobbyFilter, "home">[] = ["casino", "live", "bingo"];

export function LobbyContent() {
  const { filter } = useFilter();

  if (filter === "home") {
    return <HomeView />;
  }

  return <SwipeStrip activeIndex={FILTERED_ORDER.indexOf(filter)} />;
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
