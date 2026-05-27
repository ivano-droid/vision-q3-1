"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/**
 * "The Q Club" promo card — Figma node 203:42091.
 *
 *   ┌───────────────────────────────────────┐
 *   │             ✦  THE Q CLUB  ✦           │   ← Title SVG (with crown)
 *   │                                       │
 *   │   ┌──────────┐    ┌──────────┐        │
 *   │   │ Sweet B. │    │ Cheap A. │        │
 *   │   └──────────┘    └──────────┘        │
 *   │   20 Free Spins   1 Free Bingo Bash   │
 *   │   Valid 30 May    Valid 11 June       │
 *   │                                       │
 *   │  ┌─────────────────────────────────┐  │
 *   │  │       See all Rewards           │  │   ← White button
 *   │  └─────────────────────────────────┘  │
 *   └───────────────────────────────────────┘
 *
 * Brand-blue (#0B2FCB) card with a subtle dark-gradient W backdrop,
 * the SVG title (with crown ornament) anchored at the top, and two
 * reward thumbnails. Pure presentational — content is hard-coded for
 * the prototype since the rewards block isn't backed by real data yet.
 */

const REWARDS: Array<{
  src: string;
  label: string;
  validUntil: string;
}> = [
  {
    src: "/assets/qclub/reward-sweet-bonanza.png",
    label: "20 Free Spins",
    validUntil: "Valid until 30th May",
  },
  {
    src: "/assets/qclub/reward-cheap-as-chips.png",
    label: "1 Free Bingo Bash",
    validUntil: "Valid until 11th June",
  },
];

export function QClubCard() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label="The Q Club"
      // Mobile-frame gutter — same 16px the rails use, plus a bit of
      // vertical breathing room above and below so it sits as a
      // distinct block between the Top 10 rail and the per-category
      // rails.
      className="px-[16px] pt-[14px] pb-[16px]"
      initial={false}
      animate={reduce ? undefined : { opacity: [0, 1], y: [6, 0] }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative w-full overflow-hidden rounded-[12px]"
        style={{
          backgroundColor: "#0B2FCB",
          // Soft brand glow under the card so it lifts slightly off
          // the page canvas without competing with the rails' own
          // tile shadows.
          boxShadow: "0 12px 28px -16px rgba(10, 46, 203, 0.45)",
          // Was 357/269 — pushed taller so the See all Rewards button
          // gets clear breathing room above it (Figma version had the
          // CTA crashing into the reward-tile sub-line).
          aspectRatio: "357 / 290",
        }}
      >
        {/* Backdrop W-gradient — the dark "diamond" shape baked into
            the original Figma frame. Sits underneath everything else,
            pointer-events:none so the buttons inside catch input. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/qclub/backdrop-rays.svg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full pointer-events-none"
        />

        {/* "The Q Club" title — kept as the original Figma SVG so the
            crown ornament's exact geometry survives. Centred at the
            top. Width is the Figma's 224/357 ratio = 62.8% of the
            card. */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: `${(14 / 290) * 100}%`,
            width: `${(224 / 357) * 100}%`,
            aspectRatio: "224 / 49",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/qclub/the-q-club-title.svg"
            alt="The Q Club"
            className="h-full w-full"
          />
        </div>

        {/* Two reward cards, side-by-side. */}
        <div
          className="absolute left-0 right-0 grid grid-cols-2 gap-[14px] px-[11px]"
          style={{ top: `${(76 / 290) * 100}%` }}
        >
          {REWARDS.map((reward) => (
            <RewardTile key={reward.label} reward={reward} />
          ))}
        </div>

        {/* "See all Rewards" — full-width white pill button anchored
            to the bottom of the card. Drops the user onto /rewards. */}
        <Link
          href="/rewards"
          aria-label="See all Rewards"
          className="absolute left-[14px] right-[14px] h-[48px] rounded-[12px] bg-white grid place-items-center text-[18px] font-extrabold text-[var(--mrq-blue)] active:scale-[0.98] transition-transform"
          style={{
            bottom: `${(14 / 290) * 100}%`,
            letterSpacing: "-0.01em",
            boxShadow: "0 2px 8px -4px rgba(0, 0, 0, 0.18)",
          }}
        >
          See all Rewards
        </Link>
      </div>
    </motion.section>
  );
}

function RewardTile({
  reward,
}: {
  reward: { src: string; label: string; validUntil: string };
}) {
  return (
    <div className="flex flex-col items-stretch text-left">
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "157 / 80",
          // 1.75px white outline matches the Figma's reward frame.
          border: "1.75px solid #ffffff",
          borderRadius: "14px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reward.src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <p
        className="mt-[10px] text-[12px] font-extrabold leading-tight text-white"
        style={{ letterSpacing: "0.02em" }}
      >
        {reward.label}
      </p>
      <p
        className="mt-[2px] text-[10px] font-medium leading-tight"
        style={{ color: "#FBECFB", letterSpacing: "0.2px" }}
      >
        {reward.validUntil}
      </p>
    </div>
  );
}
