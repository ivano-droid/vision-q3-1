"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

/**
 * Q Rewards summary card — Figma 29003:5542.
 *
 *   ┌───────────────────────────────────┐
 *   │  My [Q] Rewards         🎁       │  yellow heading + gift sticker
 *   │  ┌──────────────────────────────┐ │
 *   │  │ [art] U vs. Q       [ Free ] │ │  "free" badge row
 *   │  │       Play for free every day│ │
 *   │  └──────────────────────────────┘ │
 *   │  ┌──────────────────────────────┐ │
 *   │  │ [art] May Megahaul Cash Bonus│ │  progress row
 *   │  │       ████████████░░░░░░░░░░ │ │  bar next to title
 *   │  │ Wagered £14…    Valid 30 May │ │  wagered left / valid right
 *   │  └──────────────────────────────┘ │
 *   │  ┌──────────────────────────────┐ │
 *   │  │       See all Rewards        │ │  CTA → /rewards
 *   │  └──────────────────────────────┘ │
 *   └───────────────────────────────────┘
 */

type FreeReward = {
  kind: "free";
  src: string;
  title: string;
  sub: string;
  /** T&Cs caption shown below the card. */
  caveat: string;
};

type ProgressReward = {
  kind: "progress";
  src: string;
  title: string;
  sub: string;
  wagered: number;
  target: number;
  currency: string;
};

type Reward = FreeReward | ProgressReward;

const REWARDS: Reward[] = [
  {
    kind: "free",
    src: "/assets/qrewards/u-vs-q.png",
    title: "U vs. Q",
    sub: "Play for FREE every day",
    caveat:
      "Play daily. Max 20 spins. 24h credit. Expiry & game restrictions apply. ",
  },
  {
    kind: "progress",
    src: "/assets/qrewards/may-megahaul.png",
    title: "May Megahaul Cash Bonus",
    sub: "Valid until 30th May",
    wagered: 14,
    target: 20,
    currency: "£",
  },
];

export function QRewardsCard() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label="My Q Rewards"
      className="px-[16px] pt-[12px] pb-[16px]"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        data-component="Card"
        className="relative w-full overflow-hidden rounded-[16px]"
        // brand surface → --colour-brand-blue-500; padding → 16 (DS scale)
        style={{ backgroundColor: "#0a2ecb", padding: 16 }}
      >
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
            data-component="Icon"
            src="/assets/qrewards/gift-box.svg"
            alt=""
            width={86}
            height={92}
            style={{ width: 86, height: 92 }}
            draggable={false}
          />
        </span>

        <div className="relative flex items-center" style={{ height: 32, gap: 6 }}>
          <span
            data-component="Typography"
            className="font-extrabold"
            style={{ color: "#ffdf00", fontSize: 22, lineHeight: 1.6, letterSpacing: 0.15 }}
          >
            My
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-component="Icon"
            src="/assets/qrewards/q-letter.svg"
            alt=""
            width={26}
            height={20}
            style={{ width: 26, height: 20 }}
            draggable={false}
          />
          <span
            data-component="Typography"
            className="font-extrabold"
            style={{ color: "#ffdf00", fontSize: 22, lineHeight: 1.6, letterSpacing: 0.15 }}
          >
            Rewards
          </span>
        </div>

        <div className="relative flex flex-col" style={{ gap: 18, marginTop: 13 }}>
          {REWARDS.map((reward, i) =>
            reward.kind === "free" ? (
              <FreeRewardRow key={i} reward={reward} />
            ) : (
              <ProgressRewardRow key={i} reward={reward} />
            )
          )}
        </div>

        {/* Connected to the design-system Button via Figma Code Connect
            (node 29164:893). */}
        <div className="relative" style={{ marginTop: 24 }}>
          <Button text="See all Rewards" hierarchy="white" size="large" href="/rewards" />
        </div>
      </div>
    </motion.section>
  );
}

function FreeRewardRow({ reward }: { reward: FreeReward }) {
  return (
    <div className="flex flex-col">
      <div
        data-component="Reward"
        className="flex items-center"
        style={{
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 12,
          paddingRight: 12,
          gap: 12,
          backgroundColor: "#0c2287",
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
            data-component="Typography"
            className="leading-tight"
            style={{ color: "#ffffff", fontSize: 17, fontWeight: 700 }}
          >
            {reward.title}
          </p>
          <p
            data-component="Typography"
            className="leading-[1.6] mt-[2px]"
            style={{ color: "#f2f3f3", fontSize: 12, fontWeight: 500, letterSpacing: 0.2 }}
          >
            {reward.sub.split(/(FREE)/).map((part, i) =>
              part === "FREE" ? (
                <span key={i} style={{ fontWeight: 700 }}>
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        </div>
        <PlayButton />
      </div>

      {/* T&Cs caption (Figma 29164:872 — footer container under the card). */}
      <div className="flex items-center justify-center px-[4px] pt-[8px]">
        <p
          data-component="Typography"
          className="flex-1 min-w-0 leading-[1.6]"
          style={{
            color: "#ffffff",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: 0.2,
            opacity: 0.7,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {reward.caveat}
          <span className="font-extrabold underline">Full T&amp;Cs</span>
        </p>
      </div>
    </div>
  );
}

function PlayButton() {
  // White circular play button (Figma 29177:273) — decorative CTA affordance
  // on the free reward card. The play glyph is brand-blue (#0A2ECB).
  return (
    <span
      aria-hidden
      data-component="Button"
      className="shrink-0 inline-flex items-center justify-center rounded-full bg-white"
      style={{ width: 32, height: 32 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-component="Icon"
        src="/assets/qrewards/play.svg"
        alt=""
        width={17}
        height={17}
        draggable={false}
        style={{ width: 17.455, height: 17.455, marginLeft: 3 }}
      />
    </span>
  );
}

function ProgressRewardRow({ reward }: { reward: ProgressReward }) {
  const pct = Math.max(0, Math.min(1, reward.wagered / reward.target));

  return (
    <div
      data-component="Reward"
      className="flex flex-col"
      style={{
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 12,
        backgroundColor: "#0c2287",
        borderRadius: 12,
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <span
          className="relative shrink-0 overflow-hidden"
          style={{
            width: 52,
            height: 52,
            borderRadius: 8, // --radiusMd
            border: "1.57px solid rgba(255, 255, 255, 0.6)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={reward.src}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </span>
        <div className="flex flex-1 flex-col min-w-0" style={{ gap: 8 }}>
          <p
            data-component="Typography"
            style={{
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 0.1,
              lineHeight: 1.6,
            }}
          >
            {reward.title}
          </p>
          <div
            aria-hidden
            className="relative w-full overflow-hidden"
            style={{ height: 8, borderRadius: 100, backgroundColor: "#ffffff" }}
          >
            <div
              className="absolute left-0 top-0 h-full"
              style={{
                width: `${pct * 100}%`,
                borderRadius: 100,
                background:
                  "linear-gradient(90deg, #f05cd2 0%, #d000ca 54.33%, #1944ff 99.04%)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ width: "100%" }}>
        <p
          data-component="Typography"
          style={{
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 0.2,
            lineHeight: 1.6,
          }}
        >
          Wagered {reward.currency}
          {reward.wagered} of {reward.currency}
          {reward.target}
        </p>
        <p
          data-component="Typography"
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 0.2,
            lineHeight: 1.6,
          }}
        >
          {reward.sub}
        </p>
      </div>
    </div>
  );
}
