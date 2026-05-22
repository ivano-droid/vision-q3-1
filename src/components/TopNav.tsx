"use client";

import Image from "next/image";
import { StatusBar } from "./StatusBar";
import { ScrollAwareFilters } from "./ScrollAwareFilters";
import { useFilter } from "@/lib/filter-context";

/**
 * MrQ top nav — from Figma node 43:13039.
 *
 * Two sibling sticky sections:
 *   1. Brand bar (this file) — status bar + logo + balance/avatar.
 *      • Logo tap → resets the filter to "home" and scrolls to top.
 *      • Balance/avatar pill tap → opens the side nav drawer.
 *   2. Sub-filter pills (ScrollAwareFilters) — sticky just below the brand
 *      bar; hides on scroll-down, re-appears on scroll-up.
 *
 * They're siblings (not nested) so that `position: sticky` is bounded by the
 * full page rather than by a fixed-height parent.
 */
export function TopNav() {
  const { goHome, openSideNav } = useFilter();

  return (
    <>
      {/* Sticky brand bar — status + logo + balance/avatar.
          10px bottom padding gives the avatar pill consistent breathing room
          whether the sub-filter pills are showing or slid away. */}
      <header className="sticky top-0 z-30 bg-mrq-blue pb-[10px]">
        <StatusBar />

        <div className="relative h-[48px] px-[23px] flex items-center justify-between">
          {/* MrQ logo — tap to return to the lobby home view */}
          <button
            type="button"
            onClick={goHome}
            aria-label="Go to lobby home"
            className="shrink-0 active:scale-[0.96] transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-mrq.svg" alt="MrQ" className="h-[32px] w-[83px]" />
          </button>

          {/* Balance + divider + avatar pill — tap to open the side nav */}
          <button
            type="button"
            onClick={openSideNav}
            aria-label="Open account menu"
            className="flex items-center gap-[8px] h-[48px] pl-[16px] pr-[8px] py-[4px] rounded-full active:scale-[0.97] transition-transform"
            style={{
              backgroundColor: "rgba(255,255,255,0.32)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <span className="text-white text-[16px] leading-none font-extrabold pt-[2px]">
              £113.59
            </span>
            <span className="h-[20px] w-px bg-mrq-divider" aria-hidden />
            <div
              className="relative size-[36px] rounded-full overflow-hidden bg-white border-2 border-mrq-blue"
              style={{ boxShadow: "4px 4px 8px 0 rgba(10,46,203,0.24)" }}
            >
              <Image
                src="/assets/avatar.png"
                alt=""
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </div>
          </button>
        </div>
      </header>

      {/* Sub-filter pills — sticky-below-brand-bar, scroll-direction aware */}
      <ScrollAwareFilters />
    </>
  );
}
