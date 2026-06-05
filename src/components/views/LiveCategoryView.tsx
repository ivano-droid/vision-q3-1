"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { getGameDetails } from "@/lib/games-catalogue";
import { LIVE_CATEGORY_KEYS } from "@/lib/live-categories";

// Live casino tile helpers
const T = (i: number, alt: string) => ({ src: `/assets/live/table-0${i}.png`, alt });
const P = (i: number, alt: string) => ({ src: `/assets/live/popular-0${i}.png`, alt });

const CATEGORY_TILES: Record<string, { src: string; alt: string }[]> = {
  new: [P(1,"Lightning Roulette"), T(4,"New Roulette XL"), P(4,"Mega Ball Plus"), T(5,"Speed Blackjack VIP"), P(2,"Gold Bar Roulette"), T(2,"Baccarat Squeeze"), P(3,"Dream Catcher Live"), T(3,"Infinite Blackjack"), P(1,"Lightning Storm"), T(1,"Speed Auto Roulette"), P(4,"Funky Time"), T(5,"Monopoly Big Baller")],
  "game-shows": [T(1,"Monopoly Live"), P(2,"Crazy Time"), P(4,"Mega Ball"), P(3,"Deal or No Deal"), T(4,"Side Bet City"), P(1,"Dream Catcher"), T(2,"Gonzo's Treasure Hunt"), T(5,"Cash or Crash"), P(4,"Funky Time"), T(3,"Lightning Lotto"), P(2,"Adventures Beyond"), T(1,"Extra Chilli Epic Spins")],
  blackjack: [T(3,"Infinite Blackjack"), T(5,"Speed Blackjack"), P(2,"Free Bet Blackjack"), T(1,"Blackjack VIP"), T(4,"Party Blackjack"), P(4,"Power Blackjack"), T(2,"Blackjack Silver"), P(1,"All Bets Blackjack"), T(3,"Blackjack Gold"), P(3,"Classic Blackjack"), T(5,"Blackjack Platinum"), T(1,"Salon Privé BJ")],
  roulette: [P(1,"Lightning Roulette"), T(2,"Immersive Roulette"), T(5,"XXXtreme Lightning"), P(3,"Gold Bar Roulette"), T(1,"Speed Auto Roulette"), T(3,"Roulette VIP"), P(2,"Lightning Roulette 1st"), T(4,"Salon Privé Roulette"), P(4,"American Roulette"), T(2,"Double Ball Roulette"), P(1,"Quantum Roulette"), T(5,"Blaze Roulette")],
  baccarat: [T(3,"Speed Baccarat A"), T(1,"Baccarat Squeeze"), P(2,"No Commission Baccarat"), T(5,"Baccarat Control Squeeze"), T(4,"Fortune Baccarat"), P(3,"Salon Privé Baccarat"), T(2,"Baccarat VIP"), T(3,"Lightning Baccarat"), P(1,"Mini Baccarat"), T(5,"Speed Baccarat B"), T(1,"Baccarat Classic"), P(4,"Dragon Tiger")],
};

function CategoryTile({ tile }: { tile: { src: string; alt: string } }) {
  const router = useRouter();
  const details = getGameDetails(tile.alt, tile.src);

  return (
    <button
      type="button"
      aria-label={tile.alt}
      onClick={() => {
        if (details.href) { router.push(details.href); return; }
        if (typeof window !== "undefined") console.log("[LiveCategory] open →", tile.alt);
      }}
      className="relative aspect-square overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 4px 12px -4px rgba(10, 46, 203, 0.2)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.src}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />
    </button>
  );
}

export function LiveCategoryView({ category }: { category: string }) {
  const reduce = useReducedMotion();
  const tiles = CATEGORY_TILES[category] ?? [];

  return (
    <motion.div
      className="grid grid-cols-3 gap-[8px] px-[16px] pt-[14px] pb-[24px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {tiles.map((tile, i) => (
        <CategoryTile key={`${tile.src}-${i}`} tile={tile} />
      ))}
    </motion.div>
  );
}

export { LIVE_CATEGORY_KEYS };
