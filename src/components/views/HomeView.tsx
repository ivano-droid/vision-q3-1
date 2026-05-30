import { HeroCarousel } from "@/components/carousel/HeroCarousel";
import { GameRail } from "@/components/rails/GameRail";
import { RecentlyPlayedGrid } from "@/components/rails/RecentlyPlayedGrid";
import { BigWinsRow } from "@/components/rails/BigWinsRow";
import { SameVibeRail } from "@/components/rails/SameVibeRail";
import { LatestBigWinsRow } from "@/components/rails/LatestBigWinsRow";
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

// Prize amounts in the £400–£1,800 range — meaningful session
// wins, the kind a player would screenshot. The count-up
// animation scrolls each pill from £0 up to its value, so larger
// numbers also give the count-up more visible distance to travel.
// Buffalo Bills tops the rail because it's the flagship game.
const RECENT_WINS = [
  { src: "/assets/games/slot-04.png", alt: "Western Gold", prize: "£687.40" },
  {
    src: "/assets/games/slot-01.png",
    alt: "Buffalo Bills",
    prize: "£1,820.50",
    href: "/play/buffalo-bills",
  },
  { src: "/assets/live/popular-03.png", alt: "Lightning Roulette", prize: "£962.50" },
  { src: "/assets/games/slot-13.png", alt: "Snake Arena", prize: "£1,418.75" },
  { src: "/assets/games/slot-11.png", alt: "Maze Escape", prize: "£534.20" },
  { src: "/assets/games/slot-07.png", alt: "Mummy Mania", prize: "£406.90" },
];

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

const LATEST_WINS = [
  {
    src: "/assets/games/slot-01.png",
    alt: "Buffalo Bills",
    username: "SophieW",
    amount: "£1,200",
    game: "Spaceman",
  },
  {
    src: "/assets/games/slot-04.png",
    alt: "Jewel Stepper",
    username: "MarkR",
    amount: "£840",
    game: "Jewel Stepper",
  },
  {
    src: "/assets/games/slot-13.png",
    alt: "Snake Arena",
    username: "Jamie85",
    amount: "£520",
    game: "Snake Arena",
  },
  {
    src: "/assets/games/slot-08.png",
    alt: "Tiki Tumble",
    username: "ElenaP",
    amount: "£310",
    game: "Tiki Tumble",
  },
];

export function HomeView() {
  return (
    <>
      {/* Small breathing room so the hero card doesn't crash into the
          brand bar's rounded bottom edge. */}
      <div className="pt-[10px]">
        <HeroCarousel />
      </div>

      <RecentlyPlayedGrid
        title="Recently Played Games"
        items={PICK_UP_GRID}
        showSeeAll={false}
      />

      <BigWinsRow title="My Recent Big Wins" items={RECENT_WINS} />

      <SameVibeRail
        title="Same Vibe as Tiki Tumble"
        items={SAME_VIBE_TIKI_TUMBLE}
      />

      <GameRail
        title="Hot Right Now"
        tiles={HOT_RIGHT_NOW}
        tileWidth={109}
        tileHeight={109}
      />

      <LatestBigWinsRow title="Latest Big Wins" items={LATEST_WINS} />

      {/* Q Rewards summary — Figma 255:37506. Brand-blue card with
          "My Q Rewards" heading + gift sticker, two active reward
          rows (Free Spins, Free Bingo Bash) and a "See all Rewards"
          CTA routing to /rewards. Replaces the previous scroll-
          expand QClubCard treatment with a tighter, on-brand
          rewards summary at the bottom of the feed. */}
      <QRewardsCard />
    </>
  );
}
