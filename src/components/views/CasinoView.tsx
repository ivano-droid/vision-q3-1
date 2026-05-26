"use client";

import { CategoryTabs } from "../CategoryTabs";
import { SwipeableHero, type HeroGame } from "../SwipeableHero";
import { GameRail } from "@/components/rails/GameRail";

/**
 * Casino category page.
 *
 *   ┌──────────────────────────────────────┐
 *   │  ← Casino                  £113.59 ▢ │  ← BrandBar (shared)
 *   ├──────────────────────────────────────┤
 *   │  Home  Featured  New  Jackpot  …    │  ← CategoryTabs (sticky)
 *   ├──────────────────────────────────────┤
 *   │  ┌────────────────────────────────┐  │
 *   │  │  exclusive   [hero artwork]    │  │
 *   │  │              ⓘ ♡ ▶︎            │  │  ← Swipeable hero
 *   │  │  Buffalo Bills · RTP 95%      │  │
 *   │  └────────────────────────────────┘  │
 *   ├──────────────────────────────────────┤
 *   │  Recently played Casino    Show all  │
 *   │  ▢▢▢▢▢▢…                            │  ← Game rails
 *   └──────────────────────────────────────┘
 *
 * The sub-tabs (Home / Featured / New / …) are visual + state-only
 * for now — they don't change the rails yet. Real per-tab content is
 * a follow-up; the scaffold's job is to land the chrome.
 */

const CASINO_TABS = [
  "Home",
  "Featured",
  "New",
  "Jackpot",
  "Megaways",
  "Slingo",
  "Tables",
  "Live",
];

// Build the swipeable hero deck. The card is now 4:3 landscape (per
// design feedback that the previous 2:3 portrait was too tall) so
// we use only the landscape/wider promo art that fits naturally:
//   birds-on-a-wire  800×600  → 4:3, perfect fit
//   south-park       362×272  → 4:3, perfect fit
//   fruit-warp       400×225  → 16:9, minor side crop
//   wild-swarm       300×300  → 1:1,  small top/bottom crop
// Slot-XX (2:3 portrait) artwork doesn't suit a landscape hero — it
// gets harshly cropped — so it's dropped from the deck for now.
const HERO_DECK: HeroGame[] = [
  {
    src: "/assets/games/birds-on-a-wire.png",
    alt: "Birds on a Wire",
    title: "Birds on a Wire",
    rtp: "96.91%",
    exclusive: true,
  },
  {
    src: "/assets/games/south-park.png",
    alt: "South Park",
    title: "South Park",
    rtp: "96.55%",
  },
  {
    src: "/assets/games/fruit-warp.png",
    alt: "Fruit Warp",
    title: "Fruit Warp",
    rtp: "97%",
    exclusive: true,
  },
  {
    src: "/assets/games/wild-swarm.png",
    alt: "Wild Swarm",
    title: "Wild Swarm",
    rtp: "96.32%",
  },
];

const RECENTLY_PLAYED = [1, 2, 3, 4, 5, 6, 7].map((i) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt: `Recently played ${i}`,
}));

const FEATURED = [8, 9, 10, 11, 12, 13, 1].map((i) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt: `Featured ${i}`,
}));

const CLASSICS = [3, 5, 7, 2, 4, 6, 8].map((i) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt: `Classic ${i}`,
}));

export function CasinoView() {
  return (
    <>
      <CategoryTabs tabs={CASINO_TABS} defaultTab="Home" />

      <div className="pt-[16px] flex flex-col gap-[18px]">
        {/* Tinder-style swipeable hero. The card handles its own
            horizontal gutter (16px each side) inside SwipeableHero. */}
        <SwipeableHero games={HERO_DECK} />

        {/* Game rails — small square thumbs. GameRail handles its own
            internal drag-to-scroll. */}
        <GameRail
          title="Recently played Casino"
          tiles={RECENTLY_PLAYED}
          tileWidth={109}
          tileHeight={109}
        />
        <GameRail
          title="Featured slots"
          tiles={FEATURED}
          tileWidth={109}
          tileHeight={109}
        />
        <GameRail
          title="Casino classics"
          tiles={CLASSICS}
          tileWidth={109}
          tileHeight={109}
        />
      </div>
    </>
  );
}
