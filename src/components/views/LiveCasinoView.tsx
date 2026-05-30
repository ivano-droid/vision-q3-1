"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SwipeableHero, type HeroGame } from "../SwipeableHero";
import { LiveGameRail } from "@/components/rails/LiveGameRail";
import { CategoriesSheet } from "../CategoriesSheet";
import { ChevronDownIcon } from "../CategoryChevron";
import {
  LIVE_CATEGORIES,
  LIVE_GAMES_BY_CATEGORY,
  LIVE_POPULAR,
} from "@/lib/live-categories";

/**
 * Live Casino homepage — the curated landing page for the Live Casino
 * vertical. Mirrors CasinoView's STRUCTURE (header + Categories+ pill,
 * swipeable hero, then rails) but the rail card layout is bespoke:
 * Live cards carry a live player count badge, optional spin-history
 * overlay (Roulette tables), title + provider + min-bet + dealer
 * chip. See LiveGameRail / LiveGameCard.
 *
 *   ┌──────────────────────────────────────┐
 *   │  ←                          £113.48 ▢│
 *   ├──────────────────────────────────────┤
 *   │  Live Casino            Categories+  │
 *   ├──────────────────────────────────────┤
 *   │  [ swipeable hero card ]             │
 *   ├──────────────────────────────────────┤
 *   │  Popular Games            See all    │
 *   │  ┌────┐ ┌────┐ ┌────┐ …              │  ← LiveGameRail (rich card)
 *   │  Roulette                 See all    │
 *   │  ┌────┐ ┌────┐ ┌────┐ …              │
 *   │  Blackjack                See all    │
 *   │  ┌────┐ ┌────┐ ┌────┐ …              │
 *   │  …                                   │
 *   └──────────────────────────────────────┘
 */

const HERO_DECK: HeroGame[] = [
  {
    src: "/assets/live/popular-01.png",
    alt: "Lightning Roulette",
    title: "Lightning Roulette",
    rtp: "97.30%",
    exclusive: true,
    volatility: "Medium",
    maxWin: "500x",
    betRange: "£0.20–£500",
    gameType: "Roulette",
    provider: "Evolution",
  },
  {
    src: "/assets/live/popular-02.png",
    alt: "Crazy Time",
    title: "Crazy Time",
    rtp: "96.08%",
    volatility: "High",
    maxWin: "20,000x",
    betRange: "£0.10–£1,000",
    gameType: "Game show",
    provider: "Evolution",
  },
  {
    src: "/assets/live/table-01.png",
    alt: "Mega Wheel",
    title: "Mega Wheel",
    rtp: "96.51%",
    volatility: "Medium",
    maxWin: "500x",
    betRange: "£0.10–£500",
    gameType: "Game show",
    provider: "Pragmatic Play Live",
  },
  {
    src: "/assets/live/table-02.png",
    alt: "Blackjack VIP",
    title: "Blackjack VIP",
    rtp: "99.28%",
    exclusive: true,
    volatility: "Low",
    maxWin: "—",
    betRange: "£5–£5,000",
    gameType: "Blackjack",
    provider: "Evolution",
  },
];

export function LiveCasinoView() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sheet selection — both branches navigate, no local filter state.
  const handleSelect = (key: string | null) => {
    setSheetOpen(false);
    if (key) router.push(`/live/${key}`);
  };

  return (
    <>
      {/* In-page header — same shape as Casino's. The Live Casino
          homepage isn't itself a category, so the pill stays as plain
          "Categories+" with no active state. */}
      <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[18px]">
        <h1 className="text-[28px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
          Live Casino
        </h1>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          className="inline-flex items-center gap-[6px] h-[30px] pl-[14px] pr-[12px] rounded-full text-[16px] font-extrabold active:scale-[0.97] transition-transform"
          style={{
            backgroundColor: "#dee3f7",
            color: "var(--mrq-blue-dark)",
          }}
        >
          <span>Categories</span>
          <ChevronDownIcon size={14} />
        </button>
      </div>

      <div className="flex flex-col">
        {/* Swipeable hero deck — real live-table titles. */}
        <div className="pb-[14px]">
          <SwipeableHero games={HERO_DECK} />
        </div>

        {/* Popular Games — curated cross-category top-of-page rail.
            The first card is a Roulette table so the spin-history
            overlay (the "look, real live game state" detail) is
            visible at first glance. */}
        <LiveGameRail title="Popular Games" games={LIVE_POPULAR} />

        {/* Per-category rails. Each "See all" routes to /live/[key]. */}
        {LIVE_CATEGORIES.map((cat) => (
          <LiveGameRail
            key={cat.key}
            title={cat.label === "Game Shows" ? "Live Gameshows" : cat.label}
            games={LIVE_GAMES_BY_CATEGORY[cat.key] ?? []}
            onSeeAll={() => router.push(`/live/${cat.key}`)}
          />
        ))}
      </div>

      <CategoriesSheet
        open={sheetOpen}
        selected={undefined}
        categories={LIVE_CATEGORIES}
        onSelect={handleSelect}
        onClose={() => setSheetOpen(false)}
        title="Live Casino Categories"
        hideAllGames
      />
    </>
  );
}
