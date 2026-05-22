import { HeroCarousel } from "@/components/carousel/HeroCarousel";
import { GameRail } from "@/components/rails/GameRail";

/**
 * Default lobby view — shown when no sub-filter pill is selected.
 * Matches the home-screen section order on vision-01.vercel.app.
 */
const G = (i: number, alt: string) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt,
});

const PICKED_FOR_YOU = [
  G(1, "Slot game 1"),
  G(2, "Slot game 2"),
  G(3, "Slot game 3"),
  G(4, "Starburst"),
  G(5, "Slot game 5"),
  G(6, "Slot game 6"),
  G(7, "Slot game 7"),
];

const RECENTLY_PLAYED = [
  G(11, "Slot game 11"),
  G(7, "Slot game 7"),
  G(6, "Slot game 6"),
  G(8, "Slot game 8"),
  G(10, "Slot game 10"),
  G(9, "Slot game 9"),
  G(4, "Starburst"),
];

const EXPLORE_GAMEPLAYS = [
  G(3, "Slot game 3"),
  G(5, "Slot game 5"),
  G(8, "Slot game 8"),
  G(13, "Slot game 13"),
  G(12, "Slot game 12"),
];

const FRESH_FROM_Q = [
  G(6, "Slot game 6"),
  G(4, "Starburst"),
  G(5, "Slot game 5"),
  G(7, "Slot game 7"),
  G(1, "Slot game 1"),
  G(2, "Slot game 2"),
  G(3, "Slot game 3"),
];

export function HomeView() {
  return (
    <>
      <HeroCarousel />
      <GameRail title="Picked For You, By Q" tiles={PICKED_FOR_YOU} tileWidth={109} tileHeight={164} />
      <GameRail title="Recently played" tiles={RECENTLY_PLAYED} tileWidth={126} tileHeight={189} />
      <GameRail title="Explore gameplays" tiles={EXPLORE_GAMEPLAYS} tileWidth={57} tileHeight={85} />
      <GameRail title="Fresh from Q" tiles={FRESH_FROM_Q} tileWidth={109} tileHeight={164} />
    </>
  );
}
