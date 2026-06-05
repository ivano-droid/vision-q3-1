"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LiveGameCard } from "@/components/rails/LiveGameRail";
import type { LiveSection } from "@/lib/live-sections";

export function LiveSectionView({ section }: { section: LiveSection }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-2 gap-[12px] px-[16px] pt-[14px] pb-[24px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {section.games.map((game, i) => (
        <LiveGameCard key={`${game.name}-${i}`} game={game} fixedWidth={null} />
      ))}
    </motion.div>
  );
}
