"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { getGameDetails } from "@/lib/games-catalogue";
import type { CasinoSection } from "@/lib/casino-sections";

function SectionTile({ tile }: { tile: { src: string; alt: string } }) {
  const router = useRouter();
  const details = getGameDetails(tile.alt, tile.src);

  return (
    <button
      type="button"
      aria-label={tile.alt}
      onClick={() => {
        if (details.href) { router.push(details.href); return; }
        if (typeof window !== "undefined") console.log("[CasinoSection] open →", tile.alt);
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

export function CasinoSectionView({ section }: { section: CasinoSection }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-3 gap-[8px] px-[16px] pt-[14px] pb-[24px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {section.tiles.map((tile, i) => (
        <SectionTile key={`${tile.src}-${i}`} tile={tile} />
      ))}
    </motion.div>
  );
}
