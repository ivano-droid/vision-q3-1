"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

export type LobbyFilter = "home" | "casino" | "live" | "bingo" | "arena";

type FilterContextValue = {
  filter: LobbyFilter;
  setFilter: (f: LobbyFilter) => void;
  /** Toggle behaviour — clicking the active pill goes back to "home". */
  togglePill: (f: Exclude<LobbyFilter, "home">) => void;
  /** Reset filter to "home" + scroll page to top. Used by the MrQ logo
   *  and the bottom-bar home button. */
  goHome: () => void;

  /** Side-nav drawer state (opened by tapping the balance/avatar pill). */
  sideNavOpen: boolean;
  openSideNav: () => void;
  closeSideNav: () => void;

  /** Search overlay state (opened by tapping the search pill). */
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  /** Ref to the search input — exposed so the BottomBar's click handler
   *  can focus it synchronously (iOS requires focus inside the user-gesture
   *  call stack to auto-open the keyboard). */
  searchInputRef: { current: HTMLInputElement | null };

  /** One-shot "splash is gone" flag. The lobby mounts behind the loading
   *  splash, so its entrance animations would otherwise fire and finish
   *  invisibly while the splash still covers the screen. Components gate
   *  their `animate` state on this — they sit in their `hidden` variant
   *  until `markBootDone()` flips it true (called by LoadingSplash as it
   *  starts exiting). Stays true for the session, so subsequent re-mounts
   *  of the home view (navigating back from a filter) animate as normal. */
  bootDone: boolean;
  markBootDone: () => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

/**
 * App-level state shared between TopNav (pills + logo + profile pill),
 * BottomBar (home button), the lobby content (renders per `filter`), and
 * the SideNav drawer.
 */
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<LobbyFilter>("home");
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // NOTE: we intentionally do NOT scroll the page when switching filters
  // anymore. On iOS Safari, an instant scroll-to-top causes the browser's
  // URL bar to expand, which grows env(safe-area-inset-bottom), which makes
  // the floating bottom bar visually shift upward — the "bar hovers up
  // from the bottom" behaviour. Keeping scroll position stable keeps the
  // bar persistently visible in the same spot across filter changes.

  const togglePill = (f: Exclude<LobbyFilter, "home">) => {
    setFilter((curr) => (curr === f ? "home" : f));
  };

  const goHome = () => {
    setFilter("home");
  };

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter,
        togglePill,
        goHome,
        sideNavOpen,
        openSideNav: () => setSideNavOpen(true),
        closeSideNav: () => setSideNavOpen(false),
        searchOpen,
        openSearch: () => setSearchOpen(true),
        closeSearch: () => setSearchOpen(false),
        searchInputRef,
        bootDone,
        markBootDone: () => setBootDone(true),
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used inside a FilterProvider");
  return ctx;
}
