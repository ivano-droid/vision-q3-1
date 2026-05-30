/**
 * Search filter model + pure helpers.
 *
 * The search page composes three things into one result list:
 *   1. the free-text query (substring match on game name)
 *   2. the active facet filters (category, provider, RTP, volatility, stakes)
 *   3. a sort order
 *
 * Filters do the filtering and are GATED — results only ever appear once
 * a query or at least one filter is active, so the screen never just
 * dumps the entire cross-vertical catalogue. Sort is a pure modifier: it
 * reorders an already-narrowed set and never reveals games on its own.
 *
 * Operates over SearchableGame (Casino / Live Casino / Bingo / Arena).
 */

import type { GameCategory, SearchableGame } from "@/lib/searchable-games";

export type SortKey = "relevance" | "rtp-desc" | "rtp-asc" | "name-asc";

export const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "relevance", label: "Most relevant" },
  { key: "rtp-desc", label: "Highest RTP" },
  { key: "rtp-asc", label: "Lowest RTP" },
  { key: "name-asc", label: "A–Z" },
];

export const VOLATILITY_OPTIONS = ["Low", "Medium", "High"] as const;

/** RTP filtering as RANGES ("between X and Y") rather than a single
 *  floor. Selecting a band sets minRtp + maxRtp together. `min`/`max`
 *  null means open-ended on that side. */
export const RTP_RANGES: Array<{
  label: string;
  min: number | null;
  max: number | null;
}> = [
  { label: "Any RTP", min: null, max: null },
  { label: "Under 95%", min: null, max: 95 },
  { label: "95–96%", min: 95, max: 96 },
  { label: "96–97%", min: 96, max: 97 },
  { label: "97%+", min: 97, max: null },
];

/** "Min wager" facet — show games you can stake at or below this amount
 *  (game.minBet <= value). Lets a low-stakes player rule out games that
 *  force a bigger minimum bet. */
export const MIN_BET_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Any" },
  { value: 0.1, label: "10p or less" },
  { value: 0.2, label: "20p or less" },
  { value: 0.5, label: "50p or less" },
];

/** "Max wager" facet — show games that allow staking at least this much
 *  (game.maxBet >= value). Gives high rollers the headroom they want. */
export const MAX_BET_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Any" },
  { value: 100, label: "£100+" },
  { value: 500, label: "£500+" },
  { value: 1000, label: "£1,000+" },
];

export type GameFilters = {
  categories: GameCategory[];
  providers: string[];
  volatility: string[];
  /** RTP range (inclusive lower, exclusive upper). null = open-ended. */
  minRtp: number | null;
  maxRtp: number | null;
  /** Keep games whose minimum stake is <= this (cheap to play). */
  minBetUpTo: number | null;
  /** Keep games whose maximum stake is >= this (high-roller headroom). */
  maxBetAtLeast: number | null;
};

export const EMPTY_FILTERS: GameFilters = {
  categories: [],
  providers: [],
  volatility: [],
  minRtp: null,
  maxRtp: null,
  minBetUpTo: null,
  maxBetAtLeast: null,
};

/** Number of filter GROUPS currently active — drives the badge / clear
 *  affordance. (A group counts once no matter how many values inside.) */
export function countActiveFilters(f: GameFilters): number {
  let n = 0;
  if (f.categories.length) n++;
  if (f.providers.length) n++;
  if (f.volatility.length) n++;
  if (f.minRtp != null || f.maxRtp != null) n++;
  if (f.minBetUpTo != null) n++;
  if (f.maxBetAtLeast != null) n++;
  return n;
}

export function hasAnyFilter(f: GameFilters): boolean {
  return countActiveFilters(f) > 0;
}

/** Apply text query + facet filters + sort. Pure: returns a new array. */
export function applyFilters(
  games: SearchableGame[],
  query: string,
  filters: GameFilters,
  sort: SortKey,
): SearchableGame[] {
  const q = query.trim().toLowerCase();
  const rtpFilterOn = filters.minRtp != null || filters.maxRtp != null;

  const filtered = games.filter((g) => {
    if (q && !g.name.toLowerCase().includes(q)) return false;
    if (filters.categories.length && !filters.categories.includes(g.category))
      return false;
    if (filters.providers.length && !filters.providers.includes(g.provider))
      return false;
    if (
      filters.volatility.length &&
      (!g.volatility || !filters.volatility.includes(g.volatility))
    )
      return false;

    // RTP range — games without an RTP (e.g. bingo) drop out whenever an
    // RTP bound is set, which is the intuitive behaviour.
    if (rtpFilterOn) {
      if (g.rtpValue == null) return false;
      if (filters.minRtp != null && g.rtpValue < filters.minRtp) return false;
      if (filters.maxRtp != null && g.rtpValue >= filters.maxRtp) return false;
    }

    if (filters.minBetUpTo != null && g.minBet > filters.minBetUpTo)
      return false;
    if (filters.maxBetAtLeast != null && g.maxBet < filters.maxBetAtLeast)
      return false;
    return true;
  });

  const sorted = [...filtered];
  const rtpOr = (v: number | undefined, fallback: number) =>
    v == null ? fallback : v;
  switch (sort) {
    case "rtp-desc":
      sorted.sort((a, b) => rtpOr(b.rtpValue, -1) - rtpOr(a.rtpValue, -1));
      break;
    case "rtp-asc":
      sorted.sort(
        (a, b) => rtpOr(a.rtpValue, Infinity) - rtpOr(b.rtpValue, Infinity),
      );
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "relevance":
    default:
      if (q) {
        sorted.sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
          const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
          return aStarts - bStarts;
        });
      }
      break;
  }
  return sorted;
}
