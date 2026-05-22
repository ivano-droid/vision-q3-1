"use client";

import { useState } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/**
 * Casino contextual-nav tab bar — Figma node 43:11340.
 *
 * Sits where the hero carousel sits on Home, but for the Casino view it's a
 * row of category tabs (Featured / New / Jackpot / Megaways / Slingo / …).
 *
 *   - "Featured" is the default active tab.
 *   - Active tab gets a dark navy underline + dark navy text. Inactive tabs
 *     are mid-grey.
 *   - The tab strip scrolls horizontally (touch + mouse drag) when the tabs
 *     don't fit in the viewport.
 *   - Bottom 1px border on the strip itself reads like the underline's track.
 */
const TABS = ["Featured", "New", "Jackpot", "Megaways", "Slingo", "Tables", "Live", "Bingo Games"];

export function CasinoTabs() {
  const [active, setActive] = useState("Featured");
  const railRef = useDraggableScroll<HTMLDivElement>();

  return (
    <nav
      aria-label="Casino categories"
      className="relative"
      style={{ borderBottom: "1px solid #e6e6e7" }}
    >
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[20px] overflow-x-auto px-[16px]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {TABS.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              aria-pressed={isActive}
              className="relative shrink-0 py-[14px] text-[16px] font-bold whitespace-nowrap transition-colors"
              style={{
                color: isActive ? "var(--mrq-blue-dark)" : "#9ca0aa",
              }}
            >
              {tab}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 right-0 bottom-[-1px] h-[3px] rounded-full"
                  style={{ backgroundColor: "var(--mrq-blue-dark)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
