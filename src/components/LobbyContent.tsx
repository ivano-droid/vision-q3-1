"use client";

import { ScrollAwareFilters } from "./ScrollAwareFilters";
import { HomeView } from "./views/HomeView";

/**
 * Lobby page contents — category pills at the top + the default home
 * feed below.
 *
 * Previously this component also owned the swipe-strip transition
 * between Casino/Live/Bingo/Arena filter views. Casino now lives on
 * its own route (`/casino`); Live/Bingo/Arena pages have been removed
 * while we focus on perfecting Casino. The pills in ScrollAwareFilters
 * still surface all four labels but only Casino navigates. So this
 * component is just a thin wrapper around the home feed plus the
 * sticky filter band.
 */
export function LobbyContent() {
  return (
    <>
      <ScrollAwareFilters />
      <HomeView />
    </>
  );
}
