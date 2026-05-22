"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type LobbyFilter = "home" | "casino" | "live" | "bingo";

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

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const togglePill = (f: Exclude<LobbyFilter, "home">) => {
    setFilter((curr) => (curr === f ? "home" : f));
    scrollToTop();
  };

  const goHome = () => {
    setFilter("home");
    scrollToTop();
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
