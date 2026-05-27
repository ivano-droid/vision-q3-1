"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

/**
 * App-level shell state that's NOT route-driven.
 *
 * Filter/category selection used to live here too, but that's now expressed
 * as real routes (`/casino`, `/discover`, `/search`, `/rewards` — and
 * eventually `/live`, `/bingo`, `/arena` once those return) — components
 * read `usePathname()` directly when they need to know the active section.
 * The remaining context state is:
 *
 *   • `sideNavOpen`     — the slide-in account drawer, fired from the
 *                         balance/avatar pill in the brand bar.
 *   • `bootDone`        — one-shot flag flipped when the loading splash
 *                         begins dissolving. Entrance animations gate on
 *                         this so they don't fire invisibly behind the
 *                         splash on first paint.
 *
 * The drawer/splash flags belong here (not in route state) because they
 * need to survive navigation — closing the side nav, dismissing the
 * splash, etc., should persist as the user moves between pages.
 */
type ShellContextValue = {
  sideNavOpen: boolean;
  openSideNav: () => void;
  closeSideNav: () => void;

  bootDone: boolean;
  markBootDone: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  return (
    <ShellContext.Provider
      value={{
        sideNavOpen,
        openSideNav: () => setSideNavOpen(true),
        closeSideNav: () => setSideNavOpen(false),
        bootDone,
        markBootDone: () => setBootDone(true),
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside a ShellProvider");
  return ctx;
}

// ---- Back-compat shims --------------------------------------------------
// The old API was named FilterProvider/useFilter back when filter state
// lived in context. Existing components still import those names while the
// route migration is in flight; both now resolve to the leaner shell
// context above. We can drop these once every caller has been moved over.

export const FilterProvider = ShellProvider;
export const useFilter = useShell;
