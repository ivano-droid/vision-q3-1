import { HeroCarousel } from "@/components/carousel/HeroCarousel";
import { GameRail } from "@/components/rails/GameRail";
import { RecentlyPlayedGrid } from "@/components/rails/RecentlyPlayedGrid";
import { BigWinsRow } from "@/components/rails/BigWinsRow";
import { FreeSpinsBanner } from "@/components/rails/FreeSpinsBanner";
import { SameVibeRail } from "@/components/rails/SameVibeRail";
import { LatestBigWinsRow } from "@/components/rails/LatestBigWinsRow";

/**
 * Default lobby view (Home tab).
 *
 * Order matches Figma node 165:28726:
 *
 *   1. HeroCarousel                — landscape promo cards (snap rail)
 *   2. Pick up where you left off  — 2×2 grid of recent games
 *   3. Your recent big wins        — horiz scroll w/ £ prize pills
 *   4. Free spins banner           — full-width white CTA card
 *   5. Same vibe as <game>         — horiz scroll large landscape promos
 *   6. Hot right now               — horiz scroll square game tiles
 *   7. Latest big wins             — horiz scroll social-style win cards
 *
 * Each section component owns its own padding + title style; this
 * file just sequences them.
 */

const G = (i: number, alt: string) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt,
});

const PICK_UP_GRID = [
  { src: "/assets/games/slot-04.png", name: "Jewel Stepper" },
  { src: "/assets/games/slot-08.png", name: "Tiki Tumble" },
  { src: "/assets/games/slot-01.png", name: "Buffalo Bills" },
  { src: "/assets/games/slot-13.png", name: "Big Bass Bonanza" },
];

const RECENT_WINS = [
  { src: "/assets/games/slot-04.png", alt: "Western Gold", prize: "£32.34" },
  { src: "/assets/games/slot-08.png", alt: "Golden Catch", prize: "£28.55" },
  { src: "/assets/games/slot-13.png", alt: "Snake Arena", prize: "£31.19" },
  { src: "/assets/games/slot-11.png", alt: "Maze Escape", prize: "£24.80" },
  { src: "/assets/games/slot-01.png", alt: "Buffalo Bills", prize: "£18.50" },
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
      <HeroCarousel />

      <RecentlyPlayedGrid
        title="Pick up where you left off"
        seeAllLabel="Show all"
        items={PICK_UP_GRID}
      />

      <BigWinsRow title="Your recent big wins" items={RECENT_WINS} />

      <FreeSpinsBanner label="You've got 100 free spins" />

      <SameVibeRail
        title="Same vibe as Tiki Tumble"
        items={SAME_VIBE_TIKI_TUMBLE}
      />

      <GameRail
        title="Hot right now"
        tiles={HOT_RIGHT_NOW}
        tileWidth={109}
        tileHeight={109}
      />

      <LatestBigWinsRow title="Latest big wins" items={LATEST_WINS} />
    </>
  );
}
