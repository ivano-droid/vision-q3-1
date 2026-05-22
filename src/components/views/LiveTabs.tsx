"use client";

import { useState } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/** Contextual-nav tab bar for the Live view. */
const TABS = ["Featured", "New", "Game shows", "Blackjack", "Roulette", "Tables", "Poker"];

export function LiveTabs() {
  const [active, setActive] = useState("Featured");
  const railRef = useDraggableScroll<HTMLDivElement>();

  return (
    <nav
      aria-label="Live categories"
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
              style={{ color: isActive ? "var(--mrq-blue-dark)" : "#9ca0aa" }}
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
