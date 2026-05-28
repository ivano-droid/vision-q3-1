import { HeroCarousel } from "@/components/carousel/HeroCarousel";
import { GameRail } from "@/components/rails/GameRail";
import { RecentlyPlayedGrid } from "@/components/rails/RecentlyPlayedGrid";
import { BigWinsRow } from "@/components/rails/BigWinsRow";
import { SameVibeRail } from "@/components/rails/SameVibeRail";
import { LatestBigWinsRow } from "@/components/rails/LatestBigWinsRow";
import { QClubCard } from "@/components/QClubCard";

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

const PICK_UP_GRID = [
  { src: "/assets/games/slot-04.png", name: "Jewel Stepper" },
  { src: "/assets/games/slot-08.png", name: "Tiki Tumble" },
  // Buffalo Bills has a real game page now — clicking the tile drops
  // the user into the /play/buffalo-bills experience (Figma 1485:95206).
  { src: "/assets/games/slot-01.png", name: "Buffalo Bills", href: "/play/buffalo-bills" },
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
      {/* Small breathing room so the hero card doesn't crash into the
          brand bar's rounded bottom edge. */}
      <div className="pt-[10px]">
        <HeroCarousel />
      </div>

      <RecentlyPlayedGrid
        title="Recently Played Games"
        seeAllLabel="Show all"
        items={PICK_UP_GRID}
      />

      <BigWinsRow title="My Recent Wins" items={RECENT_WINS} />

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

      {/* The Q Club rewards card — the final block on the home feed.
          `expandOnScroll` lets it morph from a normal mobile-frame
          card into a full-width section as the user scrolls toward
          it (gutter padding + corner radius + shadow all fade to
          zero), so it reads as a "finishing flourish" at the bottom
          of the page. AppShell's 96px footer spacer sits below this
          element, so when scrolled to the bottom the Q Club's bottom
          edge lands at the BottomNav's top edge — the whole card
          stays visible and the nav doesn't cover any of it. */}
      <QClubCard expandOnScroll />
    </>
  );
}
