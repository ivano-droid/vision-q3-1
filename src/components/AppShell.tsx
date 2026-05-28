"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandBar } from "./BrandBar";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { DepositSheet } from "./DepositSheet";
import { LoadingSplash } from "./LoadingSplash";
import { ResumePlayingBar } from "./ResumePlayingBar";

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
 * content doesn't get trapped under the floating BottomNav, EXCEPT
 * the home route — its closing Q Club section grows its own brand-
 * blue padding-bottom on scroll and visually carries the floor down
 * to the BottomNav's top edge with no #f5f5f5 strip in between.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ownsBottomFlush = pathname === "/";

  return (
    <>
      <div className="mobile-frame">
        <BrandBar />

        <main className="bg-[#f5f5f5]">
          {children}
          {!ownsBottomFlush && (
            <div
              style={{
                height: "max(96px, calc(env(safe-area-inset-bottom) + 96px))",
              }}
              aria-hidden
            />
          )}
        </main>

        <BottomNav />
        <ResumePlayingBar />
        <SideNav />
        <DepositSheet />
      </div>

      {/* Splash uses position:fixed + the --frame-right-offset CSS var
          so it always covers exactly the mobile-frame column, never the
          whole monitor on desktop. */}
      <LoadingSplash />
    </>
  );
}
