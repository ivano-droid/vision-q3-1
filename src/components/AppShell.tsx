"use client";

import type { ReactNode } from "react";
import { BrandBar } from "./BrandBar";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { LoadingSplash } from "./LoadingSplash";

/**
 * App-wide chrome that wraps every route under `/app/layout.tsx`.
 *
 *   mobile-frame
 *   ├── BrandBar      (sticky logo + balance/avatar pill — every page)
 *   ├── main          (the per-route children slot)
 *   ├── BottomNav     (4-tab persistent bar)
 *   └── SideNav       (slide-in account drawer)
 *   LoadingSplash     (first-paint splash, position:fixed, sessionStorage-gated)
 *
 * Keeps the per-route page components focused on content only — they
 * don't import the brand bar, the bottom nav, or anything else, so
 * adding a new route is just dropping a `page.tsx` into `/app/<route>/`.
 *
 * Every route gets a 96px footer spacer so the last block of page
 * content doesn't get trapped under the floating BottomNav — the
 * page-bottom area below the spacer is what the nav floats over, so
 * the last content block visually "ends" at the nav's top edge.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mobile-frame">
        <BrandBar />

        <main className="bg-[#f5f5f5]">
          {children}
          <div
            style={{
              height: "max(96px, calc(env(safe-area-inset-bottom) + 96px))",
            }}
            aria-hidden
          />
        </main>

        <BottomNav />
        <SideNav />
      </div>

      {/* Splash uses position:fixed + the --frame-right-offset CSS var
          so it always covers exactly the mobile-frame column, never the
          whole monitor on desktop. */}
      <LoadingSplash />
    </>
  );
}
