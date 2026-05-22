import { CasinoTabs } from "./CasinoTabs";
import { GameRail } from "@/components/rails/GameRail";

/**
 * Casino view — from Figma node 43:11209.
 *
 * Per the design:
 *   - Contextual-nav tab bar at the top (Featured / New / Jackpot / Megaways /
 *     Slingo / Tables / …) — NOT the hero promo carousel from Home.
 *   - Section rails of 109×109 *squared* tiles (different from Home's 109×164
 *     tall casino tiles).
 *   - Sections: Q's Exclusives, Fresh From Q, Casino Classics (×N).
 *
 * Squared tiles are cropped by `object-cover` so the same source PNGs work
 * with different aspect ratios — no need for a second image set.
 */
const G = (i: number, alt: string) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt,
});

const Q_EXCLUSIVES = [
  G(1, "Buffalo Bills"),
  G(8, "Tiki Tumble"),
  G(4, "Jewel Stepper"),
  G(2, "Q's Exclusive 4"),
  G(3, "Q's Exclusive 5"),
  G(5, "Q's Exclusive 6"),
];

const FRESH_FROM_Q = [
  G(7, "Mummy Mania"),
  G(11, "Maze Escape"),
  G(6, "Snake Arena"),
  G(9, "Fresh 4"),
  G(10, "Fresh 5"),
  G(12, "Fresh 6"),
  G(13, "Fresh 7"),
];

const CASINO_CLASSICS_1 = [
  G(8, "Bonus Jock"),
  G(5, "Golden Winner"),
  G(11, "Big Bass"),
  G(2, "Classic 4"),
  G(1, "Classic 5"),
  G(4, "Classic 6"),
  G(7, "Classic 7"),
];

const CASINO_CLASSICS_2 = [
  G(3, "Bonus Jock 2"),
  G(6, "Golden Winner 2"),
  G(12, "Big Bass 2"),
  G(13, "Classic 4"),
  G(9, "Classic 5"),
  G(10, "Classic 6"),
];

export function CasinoView() {
  return (
    <>
      <CasinoTabs />
      <GameRail title="Q's Exclusives" tiles={Q_EXCLUSIVES} tileWidth={109} tileHeight={109} />
      <GameRail title="Fresh From Q" tiles={FRESH_FROM_Q} tileWidth={109} tileHeight={109} />
      <GameRail title="Casino Classics" tiles={CASINO_CLASSICS_1} tileWidth={109} tileHeight={109} />
      <GameRail title="More Casino Classics" tiles={CASINO_CLASSICS_2} tileWidth={109} tileHeight={109} />
    </>
  );
}
