"use client";

import { useRouter } from "next/navigation";
import { LiveGameRail } from "@/components/rails/LiveGameRail";
import {
  LIVE_POPULAR,
  LIVE_GAMES_BY_CATEGORY,
} from "@/lib/live-categories";

const SECTIONS = [
  { slug: "popular-tables", title: "Popular Tables",  games: LIVE_POPULAR },
  { slug: "new-tables",     title: "New Tables",      games: LIVE_GAMES_BY_CATEGORY.new },
  { slug: "roulette",       title: "Roulette",        games: LIVE_GAMES_BY_CATEGORY.roulette },
  { slug: "blackjack",      title: "Blackjack",       games: LIVE_GAMES_BY_CATEGORY.blackjack },
  { slug: "game-shows",     title: "Game Shows",      games: LIVE_GAMES_BY_CATEGORY["game-shows"] },
  { slug: "baccarat",       title: "Baccarat",        games: LIVE_GAMES_BY_CATEGORY.baccarat },
];

export function LiveCasinoView() {
  const router = useRouter();

  return (
    <div className="flex flex-col pt-[8px]">
      {SECTIONS.map((section) => (
        <LiveGameRail
          key={section.slug}
          title={section.title}
          games={section.games}
          onSeeAll={() => router.push(`/live/section/${section.slug}`)}
        />
      ))}
    </div>
  );
}
