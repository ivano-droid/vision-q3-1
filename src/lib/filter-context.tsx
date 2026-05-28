"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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
 *                         avatar half of the brand bar's wallet pill.
 *   • `depositOpen`     — the "Make a deposit" bottom sheet, fired
 *                         from the cash-amount half of the wallet pill.
 *   • `bootDone`        — one-shot flag flipped when the loading splash
 *                         begins dissolving. Entrance animations gate on
 *                         this so they don't fire invisibly behind the
 *                         splash on first paint.
 *
 * These flags belong here (not in route state) because they need to
 * survive navigation — closing the side nav or the deposit sheet
 * shouldn't be reset when the user moves between pages.
 */
type ShellContextValue = {
  sideNavOpen: boolean;
  openSideNav: () => void;
  closeSideNav: () => void;

  depositOpen: boolean;
  openDeposit: () => void;
  closeDeposit: () => void;

  bootDone: boolean;
  markBootDone: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  // Stable identities for the action callbacks. Previously these were
  // inline arrow functions inside the provider value, which meant a new
  // function reference was created on every render — and any consumer
  // that listed e.g. `markBootDone` in a useEffect dependency array
  // would see its effect tear down and re-run on every re-render.
  const openSideNav = useCallback(() => setSideNavOpen(true), []);
  const closeSideNav = useCallback(() => setSideNavOpen(false), []);
  const openDeposit = useCallback(() => setDepositOpen(true), []);
  const closeDeposit = useCallback(() => setDepositOpen(false), []);
  const markBootDone = useCallback(() => setBootDone(true), []);

  const value = useMemo<ShellContextValue>(
    () => ({
      sideNavOpen,
      openSideNav,
      closeSideNav,
      depositOpen,
      openDeposit,
      closeDeposit,
      bootDone,
      markBootDone,
    }),
    [
      sideNavOpen,
      openSideNav,
      closeSideNav,
      depositOpen,
      openDeposit,
      closeDeposit,
      bootDone,
      markBootDone,
    ],
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
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
