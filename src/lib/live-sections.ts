import type { LiveGame } from "@/components/rails/LiveGameRail";
import { LIVE_POPULAR, LIVE_GAMES_BY_CATEGORY } from "@/lib/live-categories";

export type LiveSection = {
  slug: string;
  title: string;
  games: LiveGame[];
};

export const LIVE_HOME_SECTIONS: LiveSection[] = [
  { slug: "popular-tables", title: "Popular Tables",  games: LIVE_POPULAR },
  { slug: "new-tables",     title: "New Tables",      games: LIVE_GAMES_BY_CATEGORY.new },
  { slug: "roulette",       title: "Roulette",        games: LIVE_GAMES_BY_CATEGORY.roulette },
  { slug: "blackjack",      title: "Blackjack",       games: LIVE_GAMES_BY_CATEGORY.blackjack },
  { slug: "game-shows",     title: "Game Shows",      games: LIVE_GAMES_BY_CATEGORY["game-shows"] },
  { slug: "baccarat",       title: "Baccarat",        games: LIVE_GAMES_BY_CATEGORY.baccarat },
];

export function getLiveSectionBySlug(slug: string): LiveSection | undefined {
  return LIVE_HOME_SECTIONS.find((s) => s.slug === slug);
}

export const LIVE_SECTION_SLUGS = LIVE_HOME_SECTIONS.map((s) => s.slug);
