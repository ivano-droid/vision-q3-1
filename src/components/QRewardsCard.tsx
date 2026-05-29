"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Q Rewards summary card — Figma 255:37506.
 *
 *   ┌───────────────────────────────────┐
 *   │  Your Q Rewards          🎁       │  ← yellow heading + gift sticker
 *   │  ┌──────────────────────────────┐ │
 *   │  │ [art] 20 Free Spins Avail.   │ │  ← reward row
 *   │  │       Valid until 30th June  │ │
 *   │  └──────────────────────────────┘ │
 *   │  ┌──────────────────────────────┐ │
 *   │  │ [art] 1 Free Bingo Bash      │ │  ← reward row
 *   │  │       Valid until 12th July  │ │
 *   │  └──────────────────────────────┘ │
 *   │  ┌──────────────────────────────┐ │
 *   │  │       See all Rewards         │ │  ← secondary CTA → /rewards
 *   │  └──────────────────────────────┘ │
 *   └───────────────────────────────────┘
 *
 * Surface:
 *   • Brand-blue #0b2fcb body, rounded-12.
 *   • Yellow "Your Q Rewards" headline with the swirly MrQ Q glyph
 *     inserted between the two words (top-left).
 *   • Wrapped-ribbon gift box graphic top-right, rotated ~12°.
 *
 * Each reward row uses the same Brand/900 #0a2392 fill so it sits
 * one step deeper than the outer card, with the game/promo art on
 * the left and the title + valid-until copy stacked next to it.
 *
 * Replaces the older <QClubCard /> on the home feed.
 */

type Reward = {
  /** Game / promo art square. */
  src: string;
  /** Headline number ("20 Free", "1 Free"). */
  highlight: string;
  /** Rest of the title ("Spins Available", "Bingo Bash"). */
  rest: string;
  /** Sub-line copy (expiry date). */
  validUntil: string;
};

const REWARDS: Reward[] = [
  {
    src: "/assets/qrewards/sweet-bonanza.png",
    highlight: "20 Free",
    rest: "Spins Available",
    validUntil: "Valid until 30th June",
  },
  {
    src: "/assets/qrewards/cheap-as-chips.png",
    highlight: "1 Free",
    rest: "Bingo Bash",
    validUntil: "Valid until 12th July",
  },
];

export function QRewardsCard() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label="Your Q Rewards"
      className="px-[16px] pt-[12px] pb-[16px]"
      initial={false}
      animate={reduce ? undefined : { opacity: [0, 1], y: [10, 0] }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative w-full overflow-hidden rounded-[16px]"
        style={{
          backgroundColor: "#0b2fcb",
          padding: 15,
        }}
      >
        {/* Gift box graphic — top-right, slightly oversized so it
            bleeds toward the corner. Rotation matches the Figma's
            playful tilt. Pointer-events:none so it never steals
            clicks from the rewards beneath. */}
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: 6,
            right: 6,
            width: 86,
            height: 92,
            transform: "rotate(11.55deg)",
            transformOrigin: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/qrewards/gift-box.svg"
            alt=""
            width={86}
            height={92}
            style={{ width: 86, height: 92 }}
            draggable={false}
          />
        </span>

        {/* Heading row — "Your [Q] Rewards", with the Q rendered as
            a separate SVG between the two words. Yellow brand colour
            so it reads as a celebratory header against the
            brand-blue surface. */}
        <div
          className="relative flex items-center"
          style={{ height: 32, gap: 6 }}
        >
          <span
            className="font-extrabold"
            style={{
              color: "#ffdf00",
              fontSize: 22,
              lineHeight: 1.6,
              letterSpacing: 0.15,
            }}
          >
            Your
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/qrewards/q-letter.svg"
            alt=""
            width={26}
            height={20}
            style={{ width: 26, height: 20 }}
            draggable={false}
          />
          <span
            className="font-extrabold"
            style={{
              color: "#ffdf00",
              fontSize: 22,
              lineHeight: 1.6,
              letterSpacing: 0.15,
            }}
          >
            Rewards
          </span>
        </div>

        {/* Reward rows */}
        <div className="relative flex flex-col" style={{ gap: 13, marginTop: 14 }}>
          {REWARDS.map((reward, i) => (
            <RewardRow key={i} reward={reward} />
          ))}
        </div>

        {/* See all Rewards CTA — routes to /rewards. White fill with
            navy text reads as a clear primary action against the
            brand-blue card surface. */}
        <Link
          href="/rewards"
          className="relative mt-[13px] flex items-center justify-center rounded-[12px] active:scale-[0.99] transition-transform"
          style={{
            height: 48,
            backgroundColor: "#ffffff",
            color: "var(--mrq-blue-dark)",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: -0.2,
          }}
        >
          See all Rewards
        </Link>
      </div>
    </motion.section>
  );
}

function RewardRow({ reward }: { reward: Reward }) {
  return (
    <div
      className="flex items-center"
      style={{
        height: 68,
        paddingLeft: 8,
        paddingRight: 12,
        gap: 12,
        backgroundColor: "#0a2392",
        borderRadius: 12,
      }}
    >
      <span
        className="relative shrink-0 overflow-hidden rounded-[8px]"
        style={{ width: 52, height: 52 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reward.src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </span>
      <div className="flex flex-1 flex-col min-w-0">
        <p
          className="leading-tight"
          style={{ color: "#f2f3f3", fontSize: 17 }}
        >
          <span style={{ color: "#fde031", fontWeight: 700 }}>
            {reward.highlight}
          </span>
          <span style={{ fontWeight: 700 }}> {reward.rest}</span>
        </p>
        <p
          className="leading-[1.6] mt-[2px]"
          style={{
            color: "#f2f3f3",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: 0.2,
            opacity: 0.85,
          }}
        >
          {reward.validUntil}
        </p>
      </div>
    </div>
  );
}
