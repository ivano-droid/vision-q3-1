import { HeroCarousel } from "@/components/carousel/HeroCarousel";
import { PromoCarousel } from "@/components/carousel/PromoCarousel";
import { GameRail } from "@/components/rails/GameRail";
import { RecentlyPlayedGrid } from "@/components/rails/RecentlyPlayedGrid";
import { SameVibeRail } from "@/components/rails/SameVibeRail";
import {
  LiveCasinoRail,
  CONTINUE_PLAYING_TABLES,
} from "@/components/rails/LiveCasinoRail";
import { QRewardsCard } from "@/components/QRewardsCard";

/**
 * Default lobby view (Home tab).
 *
 * Order matches Figma node 165:28726:
 *
 *   1. HeroCarousel                — landscape promo cards (snap rail)
 *   2. Recently Played Games        — 2×2 grid of recent games
 *   3. My Recent Wins              — horiz scroll w/ £ prize pills
 *   4. Same Vibe as <game>         — horiz scroll large landscape promos
 *   5. Hot Right Now               — horiz scroll square game tiles
 *   6. Latest Big Wins             — horiz scroll social-style win cards
 *   7. The Q Club                  — rewards card that morphs from
 *                                    a mobile-frame card into a
 *                                    full-width section as it
 *                                    scrolls into view (Figma 203:42091)
 *
 * Each section component owns its own padding + title style; this
 * file just sequences them.
 */

// Feature flag — the original PNG-based hero carousel. Hidden for now
// in favour of the new PromoCarousel; flip to `true` to switch back.
const SHOW_HERO_CAROUSEL = false;

const G = (i: number, alt: string) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt,
});

// Distinct artwork pool — the thumb-NN + branded PNGs + a handful
// of live-casino tiles (from /assets/live/), not the slot-NN set
// used by My Recent Wins. Keeps the two rails visually separate
// even though Buffalo Bills appears in both (it's the wired game,
// so we lean into the repeat as continuity).
const PICK_UP_GRID = [
  // Buffalo Bills opens the rail — tapping it routes into the live
  // /play/buffalo-bills page (Figma 1485:95206).
  { src: "/assets/games/slot-01.png", name: "Buffalo Bills", href: "/play/buffalo-bills" },
  { src: "/assets/games/thumb-01.png", name: "Sweet Bonanza" },
  // Live-casino slot #1.
  { src: "/assets/live/popular-01.png", name: "Lightning Roulette" },
  { src: "/assets/games/thumb-03.png", name: "Gates of Olympus" },
  { src: "/assets/games/thumb-04.png", name: "The Dog House" },
  // Live-casino slot #2.
  { src: "/assets/live/popular-02.png", name: "Crazy Time" },
  { src: "/assets/games/thumb-06.png", name: "Starburst" },
  { src: "/assets/games/thumb-07.png", name: "Bonanza Megaways" },
  // Live-casino slot #3.
  { src: "/assets/live/table-01.png", name: "Mega Wheel" },
  { src: "/assets/games/wild-swarm.png", name: "Wild Swarm" },
];

// Prize amounts in a realistic £80–£250 range — session wins a
// Same-vibe recommendations — landscape cards. Re-uses slot artwork
// for now; landscape promo art can replace the `src` later.
const SAME_VIBE_TIKI_TUMBLE = [
  { src: "/assets/games/slot-13.png", alt: "Snake Arena" },
  { src: "/assets/games/slot-01.png", alt: "Buffalo Bills Hypercharged" },
  { src: "/assets/games/slot-08.png", alt: "Tiki Tumble" },
  { src: "/assets/games/slot-04.png", alt: "Jewel Stepper" },
];

const HOT_RIGHT_NOW = [
  G(7, "Mummy Mania"),
  G(11, "Maze Escape"),
  G(13, "Snake Arena"),
  G(4, "Jewel Stepper"),
  G(1, "Buffalo Bills"),
  G(8, "Tiki Tumble"),
];

// "Popular with Fruit Party players" — square-tile rail of slot art
// (same 109×109 GameRail footprint as the other lobby rails).
const POPULAR_FRUIT_PARTY = [
  { src: "/assets/games/slot-10.png", alt: "Fruit Warp" },
  { src: "/assets/games/slot-08.png", alt: "Tiki Tumble" },
  { src: "/assets/games/thumb-02.png", alt: "Fluffy Favourites" },
  { src: "/assets/games/slot-09.png", alt: "Western Gold" },
  { src: "/assets/games/thumb-05.png", alt: "Wolf Gold" },
  { src: "/assets/games/slot-02.png", alt: "Spaceman" },
  { src: "/assets/games/slot-12.png", alt: "Western Gold 2" },
  { src: "/assets/games/birds-on-a-wire.png", alt: "Birds on a Wire" },
];

export function HomeView() {
  return (
    <>
      {/* Small breathing room so the hero card doesn't crash into the
          brand bar's rounded bottom edge. The original PNG HeroCarousel
          is kept behind SHOW_HERO_CAROUSEL; the new PromoCarousel is
          the current default. */}
      <div className="pt-[10px]">
        {SHOW_HERO_CAROUSEL ? <HeroCarousel /> : <PromoCarousel />}
      </div>

      <RecentlyPlayedGrid
        title="Recently Played Games"
        items={PICK_UP_GRID}
        showSeeAll={false}
      />

      {/* Continue Playing Live Casino — square live-table tiles with a
          live player-count badge (no "See all"). Same component as the
          Explore "Live Casino" rail, fed the recent-tables set. */}
      <LiveCasinoRail
        title="Continue Playing Live Casino"
        tables={CONTINUE_PLAYING_TABLES}
        showSeeAll={false}
      />

      {/* Q Rewards summary — Figma 255:37506. Brand-blue card with
          "My Q Rewards" heading + gift sticker, two active reward
          rows (Free Spins, Free Bingo Bash) and a "See all Rewards"
          CTA routing to /rewards. Replaces the previous scroll-
          expand QClubCard treatment with a tighter, on-brand
          rewards summary at the bottom of the feed. */}
      <QRewardsCard />

      {/* Popular with Fruit Party players — square-tile recommendation
          rail (no "See all"), keyed off the user's recent slot play. */}
      <GameRail
        title="Popular with Fruit Party players"
        tiles={POPULAR_FRUIT_PARTY}
        tileWidth={109}
        tileHeight={109}
        showSeeAll={false}
      />

      <SameVibeRail
        title="Same Vibe as Tiki Tumble"
        items={SAME_VIBE_TIKI_TUMBLE}
      />

      <GameRail
        title="Picked For You, By Q"
        tiles={HOT_RIGHT_NOW}
        tileWidth={109}
        tileHeight={109}
      />
    </>
  );
}
