const G = (i: number, alt: string) => ({
  src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
  alt,
});

export type CasinoSection = {
  slug: string;
  title: string;
  tiles: { src: string; alt: string }[];
};

export const CASINO_HOME_SECTIONS: CasinoSection[] = [
  {
    slug: "picked-for-you",
    title: "Picked For You, By Q",
    tiles: [G(4,"Jewel Stepper"), G(8,"Tiki Tumble"), G(11,"Maze Escape"), G(13,"Snake Arena"), G(1,"Buffalo Bills"), G(7,"Mummy Mania"), G(2,"Spaceman"), G(5,"Golden Catch"), G(9,"Western Gold"), G(6,"Starburst"), G(10,"Fruit Warp"), G(3,"Big Bass Splash")],
  },
  {
    slug: "exclusives",
    title: "Q's Exclusives",
    tiles: [G(1,"Buffalo Bills"), G(3,"Big Bass Splash"), G(5,"Golden Catch"), G(9,"Western Gold"), G(6,"Starburst"), G(2,"Spaceman"), G(4,"Jewel Stepper"), G(7,"Mummy Mania"), G(11,"Maze Escape"), G(13,"Snake Arena"), G(8,"Tiki Tumble"), G(10,"Fruit Warp")],
  },
  {
    slug: "fresh-from-q",
    title: "Fresh From Q",
    tiles: [G(13,"Snake Arena"), G(12,"Western Gold"), G(11,"Maze Escape"), G(10,"Fruit Warp"), G(9,"Western Gold"), G(8,"Tiki Tumble"), G(7,"Mummy Mania"), G(6,"Starburst"), G(5,"Golden Catch"), G(4,"Jewel Stepper"), G(3,"Big Bass Splash"), G(2,"Spaceman")],
  },
  {
    slug: "recently-played",
    title: "Recently Played",
    tiles: [G(4,"Jewel Stepper"), G(1,"Buffalo Bills"), G(8,"Tiki Tumble"), G(11,"Maze Escape"), G(13,"Snake Arena"), G(7,"Mummy Mania"), G(2,"Spaceman"), G(9,"Western Gold"), G(6,"Starburst"), G(3,"Big Bass Splash"), G(10,"Fruit Warp"), G(5,"Golden Catch")],
  },
  {
    slug: "classics",
    title: "Casino Classics",
    tiles: [G(7,"Mummy Mania"), G(11,"Maze Escape"), G(4,"Jewel Stepper"), G(8,"Tiki Tumble"), G(1,"Buffalo Bills"), G(13,"Snake Arena"), G(6,"Starburst"), G(10,"Fruit Warp"), G(3,"Big Bass Splash"), G(2,"Spaceman"), G(5,"Golden Catch"), G(9,"Western Gold")],
  },
  {
    slug: "top-picks",
    title: "Top Picks",
    tiles: [G(13,"Snake Arena"), G(1,"Buffalo Bills"), G(8,"Tiki Tumble"), G(11,"Maze Escape"), G(7,"Mummy Mania"), G(4,"Jewel Stepper"), G(12,"Western Gold"), G(2,"Spaceman"), G(5,"Golden Catch"), G(9,"Western Gold"), G(6,"Starburst"), G(3,"Big Bass Splash")],
  },
  {
    slug: "recommended",
    title: "Recommended For You",
    tiles: [G(5,"Golden Catch"), G(9,"Western Gold"), G(6,"Starburst"), G(10,"Fruit Warp"), G(12,"Western Gold"), G(3,"Big Bass Splash"), G(1,"Buffalo Bills"), G(7,"Mummy Mania"), G(11,"Maze Escape"), G(13,"Snake Arena"), G(4,"Jewel Stepper"), G(8,"Tiki Tumble")],
  },
];

export function getSectionBySlug(slug: string): CasinoSection | undefined {
  return CASINO_HOME_SECTIONS.find((s) => s.slug === slug);
}

export const SECTION_SLUGS = CASINO_HOME_SECTIONS.map((s) => s.slug);
