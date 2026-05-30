"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { getGameDetails } from "@/lib/games-catalogue";
import { CountUpAmount } from "@/components/CountUpAmount";

/**
 * "Your recent big wins" — horizontal scroll of game tiles with a
 * prize-pill straddling the bottom edge of each.
 *
 *   ┌────┐ ┌────┐ ┌────┐
 *   │art │ │art │ │art │  ← square game tiles
 *   └────┘ └────┘ └────┘
 *    £32   £28    £31    ← prize pill (overlapping bottom)
 *
 * Same pill treatment as the `/search` page's "Recent big wins"
 * section — pulled into its own component so it can live in
 * multiple places without duplicating the markup.
 */

export type Win = {
  src: string;
  alt: string;
  prize: string;
  /** Optional destination wired into the game-details sheet's Play
   *  CTA. (Tile taps no longer route directly; they always open
   *  the details sheet first.) */
  href?: string;
};

export function BigWinsRow({
  title,
  items,
}: {
  title: string;
  items: Win[];
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label={title}
      className="pt-3 pb-[18px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="px-[16px] pb-[10px] text-[18px] font-extrabold text-[var(--mrq-blue)]">
        {title}
      </h2>
      <div
        className="no-scrollbar flex gap-[12px] overflow-x-auto pl-[16px] pr-[16px]"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((win, i) => (
          <WinTile key={`${win.alt}-${i}`} win={win} />
        ))}
      </div>
    </motion.section>
  );
}

function WinTile({ win }: { win: Win }) {
  const router = useRouter();
  // Catalogue lookup, with the win's explicit href winning over the
  // catalogue's if both are set.
  const baseDetails = getGameDetails(win.alt, win.src);
  const href = win.href ?? baseDetails.href;

  return (
    <div className="relative shrink-0 pb-[12px]">
      {/* Per design feedback, Recent Wins tiles intentionally don't
          carry the info chip — the prize pill straddling the bottom
          is the one chrome affordance these tiles get, and stacking
          the i chip on top crowded the corner. Tap = launch the
          game (or stub) directly. */}
      <button
        type="button"
        aria-label={win.alt}
        onClick={() => {
          if (href) {
            router.push(href);
            return;
          }
          if (typeof window !== "undefined") {
            // eslint-disable-next-line no-console
            console.log("[RecentWins] open game →", win.alt);
          }
        }}
        className="block size-[109px] overflow-hidden rounded-[12px] active:scale-[0.98] transition-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={win.src}
          alt=""
          draggable={false}
          className="h-full w-full object-cover pointer-events-none"
        />
      </button>
      {/* Prize pill — straddles the bottom edge so it pops off the
          game artwork into the page canvas below. Pointer-events
          off so taps fall through to the button underneath. */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-white px-[10px] py-[3px] whitespace-nowrap pointer-events-none"
        style={{ boxShadow: "0 4px 10px -4px rgba(10, 46, 203, 0.18)" }}
      >
        <CountUpAmount
          value={win.prize}
          className="text-[13px] font-extrabold text-[var(--mrq-blue)]"
        />
      </div>
    </div>
  );
}
