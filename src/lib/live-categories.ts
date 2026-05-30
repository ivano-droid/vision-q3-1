/**
 * Shared Live Casino sub-category catalogue.
 *
 * Mirrors the structure of casino-categories.ts so the /live vertical
 * page and its /live/[category] sub-routes can be wired off the same
 * source of truth — one place to add a category and it picks up:
 *
 *   • the Categories+ bottom sheet on /live
 *   • the per-category rails on /live
 *   • the validated slugs for /live/[category]
 *   • the bigger grid on each /live/[category] page
 *
 * Lives outside any "use client" file so both the dynamic-route server
 * file and the client views can import from it.
 */

import type { Category } from "@/components/CategoriesSheet";
import type { LiveGame } from "@/components/rails/LiveGameRail";

export const LIVE_CATEGORIES: Category[] = [
  { key: "roulette", label: "Roulette" },
  { key: "blackjack", label: "Blackjack" },
  { key: "baccarat", label: "Baccarat" },
  { key: "game-shows", label: "Game Shows" },
  { key: "poker", label: "Poker" },
  { key: "mega-wheel", label: "Mega Wheel" },
];

export const LIVE_CATEGORY_KEYS: string[] = LIVE_CATEGORIES.map((c) => c.key);

// ── Game catalogue ───────────────────────────────────────────────
//
// Each entry is a full LiveGame record (cards on the rail need much
// richer metadata than the Casino square tiles — dealer name, live
// player count, optional spin history, etc.). Artwork comes from
// /public/assets/live/ and gets reused across categories where the
// same image fits the table type.

const ROULETTE: LiveGame[] = [
  {
    name: "MrQ Roulette",
    provider: "Pragmatic Play",
    src: "/assets/live/popular-01.png",
    minBet: "10p",
    dealer: "Glennis",
    players: 15,
    recentResults: [7, 4, 10, 10, 3, 4, 27],
  },
  {
    name: "MrQ Auto Roulette",
    provider: "Pragmatic Play",
    src: "/assets/live/table-04.png",
    minBet: "10p",
    dealer: "Auto",
    players: 526,
    recentResults: [21, 32, 20, 7, 33, 29, 23],
  },
  {
    name: "Lightning Roulette",
    provider: "Evolution",
    src: "/assets/live/popular-01.png",
    minBet: "20p",
    dealer: "Imogen",
    players: 1284,
    recentResults: [12, 19, 0, 3, 26, 5, 17],
  },
  {
    name: "Immersive Roulette",
    provider: "Evolution",
    src: "/assets/live/table-05.png",
    minBet: "20p",
    dealer: "Petra",
    players: 408,
    recentResults: [22, 18, 9, 35, 14, 2, 11],
  },
  {
    name: "Speed Roulette",
    provider: "Evolution",
    src: "/assets/live/table-04.png",
    minBet: "20p",
    dealer: "Auto",
    players: 91,
    recentResults: [8, 25, 17, 4, 30, 19, 6],
  },
];

const BLACKJACK: LiveGame[] = [
  {
    name: "Blackjack VIP",
    provider: "Evolution",
    src: "/assets/live/table-02.png",
    minBet: "£5",
    dealer: "Marko",
    players: 42,
  },
  {
    name: "Lightning Blackjack",
    provider: "Evolution",
    src: "/assets/live/table-02.png",
    minBet: "£1",
    dealer: "Andra",
    players: 187,
  },
  {
    name: "Free Bet Blackjack",
    provider: "Evolution",
    src: "/assets/live/table-04.png",
    minBet: "£5",
    dealer: "Anya",
    players: 64,
  },
  {
    name: "Speed Blackjack",
    provider: "Evolution",
    src: "/assets/live/table-05.png",
    minBet: "£5",
    dealer: "Nicolas",
    players: 215,
  },
];

const BACCARAT: LiveGame[] = [
  {
    name: "MrQ Speed Baccarat",
    provider: "Pragmatic Play",
    src: "/assets/live/popular-03.png",
    minBet: "20p",
    dealer: "Herta",
    players: 170,
  },
  {
    name: "Baccarat Squeeze",
    provider: "Evolution",
    src: "/assets/live/table-01.png",
    minBet: "£1",
    dealer: "Lana",
    players: 88,
  },
  {
    name: "No Commission Baccarat",
    provider: "Evolution",
    src: "/assets/live/table-03.png",
    minBet: "£1",
    dealer: "Auto",
    players: 256,
  },
];

const GAME_SHOWS: LiveGame[] = [
  {
    name: "Money Time",
    provider: "Pragmatic Play",
    src: "/assets/live/popular-02.png",
    minBet: "10p",
    dealer: "Elizabeth",
    players: 1021,
  },
  {
    name: "Crazy Time",
    provider: "Evolution",
    src: "/assets/live/popular-02.png",
    minBet: "10p",
    dealer: "Nikola",
    players: 12837,
  },
  {
    name: "Treasure Island Live",
    provider: "Pragmatic Play",
    src: "/assets/live/popular-04.png",
    minBet: "10p",
    dealer: "Annabella",
    players: 896,
  },
  {
    name: "Ice Fishing",
    provider: "Evolution",
    src: "/assets/live/popular-04.png",
    minBet: "10p",
    dealer: "Inga",
    players: 642,
  },
  {
    name: "Monopoly Live",
    provider: "Evolution",
    src: "/assets/live/popular-02.png",
    minBet: "10p",
    dealer: "Sasha",
    players: 2304,
  },
];

const POKER: LiveGame[] = [
  {
    name: "Casino Hold'em",
    provider: "Evolution",
    src: "/assets/live/table-05.png",
    minBet: "£1",
    dealer: "Ekaterina",
    players: 73,
  },
  {
    name: "Three Card Poker",
    provider: "Evolution",
    src: "/assets/live/table-01.png",
    minBet: "£1",
    dealer: "Rina",
    players: 56,
  },
  {
    name: "Caribbean Stud",
    provider: "Pragmatic Play",
    src: "/assets/live/table-02.png",
    minBet: "£1",
    dealer: "Karl",
    players: 31,
  },
];

const MEGA_WHEEL: LiveGame[] = [
  {
    name: "Mega Wheel",
    provider: "Pragmatic Play",
    src: "/assets/live/table-01.png",
    minBet: "10p",
    dealer: "Adelita",
    players: 1108,
  },
  {
    name: "Dream Catcher",
    provider: "Evolution",
    src: "/assets/live/popular-03.png",
    minBet: "10p",
    dealer: "Maja",
    players: 487,
  },
  {
    name: "Boom City",
    provider: "Pragmatic Play",
    src: "/assets/live/popular-04.png",
    minBet: "10p",
    dealer: "Petra",
    players: 311,
  },
];

/** Per-category game lists. Used by both the rails on /live and the
 *  grid on /live/[category]. */
export const LIVE_GAMES_BY_CATEGORY: Record<string, LiveGame[]> = {
  roulette: ROULETTE,
  blackjack: BLACKJACK,
  baccarat: BACCARAT,
  "game-shows": GAME_SHOWS,
  poker: POKER,
  "mega-wheel": MEGA_WHEEL,
};

/** "Popular Games" — the cross-category highlights for the top rail
 *  on /live. Curated picks (roulette + blackjack + baccarat) so the
 *  spin-history overlay shows up on the first card the user sees. */
export const LIVE_POPULAR: LiveGame[] = [
  ROULETTE[0],
  ROULETTE[1],
  BACCARAT[0],
  ROULETTE[2],
  BLACKJACK[0],
  ROULETTE[3],
];
