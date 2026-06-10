"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

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
    sub: "Play for free every day",
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
        className="relative w-full overflow-hidden rounded-[16px]"
        style={{ backgroundColor: "#0b2fcb", padding: 15 }}
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
            className="font-extrabold"
            style={{ color: "#ffdf00", fontSize: 22, lineHeight: 1.6, letterSpacing: 0.15 }}
          >
            My
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
            style={{ color: "#ffdf00", fontSize: 22, lineHeight: 1.6, letterSpacing: 0.15 }}
          >
            Rewards
          </span>
        </div>

        <div className="relative flex flex-col" style={{ gap: 13, marginTop: 14 }}>
          {REWARDS.map((reward, i) =>
            reward.kind === "free" ? (
              <FreeRewardRow key={i} reward={reward} />
            ) : (
              <ProgressRewardRow key={i} reward={reward} />
            )
          )}
        </div>

        <Link
          href="/rewards"
          className="relative mt-[13px] flex items-center justify-center rounded-[12px] active:scale-[0.99] transition-transform"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 32,
            paddingRight: 32,
            backgroundColor: "#ffffff",
            color: "#0a2ecb",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: -0.2,
            lineHeight: "24px",
          }}
        >
          See all Rewards
        </Link>
      </div>
    </motion.section>
  );
}

function FreeRewardRow({ reward }: { reward: FreeReward }) {
  return (
    <div
      className="flex items-center"
      style={{
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 12,
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
          style={{ color: "#ffffff", fontSize: 17, fontWeight: 700 }}
        >
          {reward.title}
        </p>
        <p
          className="leading-[1.6] mt-[2px]"
          style={{ color: "#f2f3f3", fontSize: 12, fontWeight: 500, letterSpacing: 0.2 }}
        >
          {reward.sub}
        </p>
      </div>
      <FreeBadge />
    </div>
  );
}

function FreeBadge() {
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center"
      style={{
        gap: 4,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: "#ffffff",
        borderRadius: 4,
        boxShadow: "0 4px 4px rgba(10, 46, 203, 0.24)",
      }}
    >
      <GiftIcon />
      <span
        style={{
          color: "#0c2287",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.2,
          lineHeight: 1.6,
        }}
      >
        Free
      </span>
    </span>
  );
}

function GiftIcon() {
  return (
    <svg
      aria-hidden
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4H8.85a1.75 1.75 0 0 0-2.85-2 1.75 1.75 0 0 0-2.85 2H2a1 1 0 0 0-1 1v1.5a.5.5 0 0 0 .5.5H2v3.5A1 1 0 0 0 3 11.5h6a1 1 0 0 0 1-1V7h.5a.5.5 0 0 0 .5-.5V5a1 1 0 0 0-1-1ZM7 3a.75.75 0 1 1 1.5 0c0 .55-.5 1-1.25 1H7V3Zm-3.5 0A.75.75 0 0 1 4.25 2.25.75.75 0 0 1 5 3v1h-.25C4 4 3.5 3.55 3.5 3ZM2 5h3.5v1H2V5Zm1 5.5V7h2.5v3.5H3Zm3.5 0V7H9v3.5H6.5ZM10 6H6.5V5H10v1Z"
        fill="#0c2287"
      />
    </svg>
  );
}

function ProgressRewardRow({ reward }: { reward: ProgressReward }) {
  const pct = Math.max(0, Math.min(1, reward.wagered / reward.target));

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 12,
        backgroundColor: "#0a2392",
        borderRadius: 12,
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <span
          className="relative shrink-0 overflow-hidden"
          style={{
            width: 52,
            height: 52,
            borderRadius: 7.172,
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
                  "linear-gradient(to right, #f05cd2 0%, #d000ca 54.327%, #8f47f1 99.038%)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ width: "100%" }}>
        <p
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
