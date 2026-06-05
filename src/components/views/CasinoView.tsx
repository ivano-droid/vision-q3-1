"use client";

import { useRouter } from "next/navigation";
import { GameRail } from "@/components/rails/GameRail";
import { CASINO_HOME_SECTIONS } from "@/lib/casino-sections";

export function CasinoView() {
  const router = useRouter();

  return (
    <div className="flex flex-col pt-[8px]">
      {CASINO_HOME_SECTIONS.map((section) => (
        <GameRail
          key={section.slug}
          title={section.title}
          tiles={section.tiles.slice(0, 6)}
          tileWidth={109}
          tileHeight={109}
          onSeeAll={() => router.push(`/casino/section/${section.slug}`)}
        />
      ))}
    </div>
  );
}
