"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Rewards — Figma 238:5731 (My Rewards) + 238:5824 (Offers).
 *
 * Whole page sits on a vertical brand-blue gradient
 * (#0a2ecb → #181f43). Two tabs switched via local state. Existing
 * global components (BrandBar, BottomNav, SideNav, DepositSheet,
 * ResumePlayingBar) are untouched.
 *
 * Spacing rhythm — strict Figma tokens:
 *   --spacing/10x = 4   --spacing/20x = 8   --spacing/30x = 12
 *   --spacing/40x = 16  --spacing/60x = 24
 *   --radius/lg   = 12  --radius/xl  = 16  --radius/full = 999
 *
 * Colour tokens used:
 *   Brand/500    = #0a2ecb   Brand/900       = #0c2287
 *   Yellow/500   = #ffdf00   Surface/primary = #f2f3f3
 *   Pink/500     = #d000ca   Text/secondary  = #4d505b
 *   Card surface = #eff2ff (light blue inner card)
 *
 * Typography (Gilroy, all):
 *   Body/MD-XStrong  16/1.6   ExtraBold  — section titles
 *   Body/SM-XStrong  14/1.6   ExtraBold  — card titles + tab labels
 *   Body/SM          14/1.6   Medium
 *   Body/Xs          12/1.6   Medium     — wagered, valid-date
 *   Body/Xxs-XStrong 10/1.6   ExtraBold  — pill labels
 *   Body/Xxs         10/1.6   Medium     — subtitles, T&Cs
 */

type Tab = "rewards" | "offers";

// ── colour constants ──────────────────────────────────────────────
const BRAND = "#0a2ecb"; // Brand/500
const BRAND_DARK = "#0c2287"; // Brand/900
const YELLOW = "#ffdf00"; // Yellow/500
const PINK = "#d000ca"; // Pink/500
const SURFACE_GREY = "#f2f3f3"; // Surface/primary
const TEXT_SECONDARY = "#4d505b"; // Text/secondary
const INNER_CARD = "#eff2ff"; // light blue card

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>("rewards");

  return (
    <div
      className="relative min-h-[100dvh] pt-[12px] pb-[32px]"
      style={{
        background:
          "linear-gradient(180deg, #0a2ecb 0%, #181f43 100%)",
      }}
    >
      {/* Tab switcher — Figma 238:5736. White pill, 4px padding,
          two flex-1 inner buttons.  */}
      <div className="px-[16px]">
        <div className="bg-white flex items-center p-[4px] rounded-full">
          <TabButton
            label="My Rewards"
            active={tab === "rewards"}
            onClick={() => setTab("rewards")}
          />
          <TabButton
            label="Offers"
            active={tab === "offers"}
            onClick={() => setTab("offers")}
          />
        </div>
      </div>

      {tab === "rewards" ? <MyRewardsContent /> : <OffersContent />}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 min-w-0 flex items-center justify-center px-[12px] py-[8px] rounded-full transition-colors"
      style={{
        backgroundColor: active ? BRAND_DARK : "transparent",
        color: active ? "#ffffff" : BRAND_DARK,
      }}
    >
      <span
        className="font-extrabold text-[14px]"
        style={{ letterSpacing: 0.1, lineHeight: 1.6 }}
      >
        {label}
      </span>
    </button>
  );
}

/* ============================================================
   MY REWARDS
   ============================================================ */

function MyRewardsContent() {
  return (
    <div className="mt-[24px] flex flex-col gap-[24px]">
      <YourQRewardsHero />
      <AvailableToCollect />
      <InProgress />
    </div>
  );
}

/** "Your Q Rewards" headline block.
 *  Figma 238:5741 — relative-positioned ellipse behind, then the
 *  tagline + 200 + Free Spins stacked centred. */
function YourQRewardsHero() {
  return (
    <div className="relative flex flex-col items-center gap-[8px] px-[16px]">
      {/* Ellipse backdrop — Figma 238:5742 (518×252 positioned at
          left=-87.5 top=30 inside a 343-wide page). Drawn behind
          the number, adds the soft darker halo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/rewards/ellipse.svg"
        alt=""
        aria-hidden
        className="absolute -translate-x-1/2 max-w-none pointer-events-none"
        style={{
          left: "50%",
          top: 30,
          width: 518,
          height: 252,
        }}
      />

      {/* Tagline: "Your [Q] Rewards" — yellow text wrapping the
          Q logo inline. Q SVG is ~22px wide, sits between the
          two words with the same baseline. */}
      <div className="relative flex items-center justify-center gap-[6px] h-[22px]">
        <span
          className="text-[14px] font-medium"
          style={{ color: YELLOW, lineHeight: 1.6, letterSpacing: 0.1 }}
        >
          Your
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/rewards/q-title.svg"
          alt="Q"
          className="h-[20px] w-auto"
        />
        <span
          className="text-[14px] font-medium"
          style={{ color: YELLOW, lineHeight: 1.6, letterSpacing: 0.1 }}
        >
          Rewards
        </span>
      </div>

      {/* Big 200 — Figma 238:5748: 59.874px, tracking -0.998,
          leading 1.2. */}
      <p
        className="relative text-center text-white font-extrabold"
        style={{
          fontSize: 60,
          letterSpacing: -1,
          lineHeight: 1.2,
        }}
      >
        200
      </p>

      {/* "Free Spins" with coin icon to the left. Figma 238:5749. */}
      <div className="relative flex items-center justify-center gap-[6px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/rewards/spins-icon.png"
          alt=""
          aria-hidden
          className="size-[18px] object-contain"
        />
        <span
          className="text-white font-extrabold text-[14px]"
          style={{ letterSpacing: 0.1, lineHeight: 1.6 }}
        >
          Free Spins
        </span>
      </div>
    </div>
  );
}

/** "Available to collect" — Figma 238:5752.
 *  Horizontal scroll of reward cards. */
function AvailableToCollect() {
  const cards: AvailableCardData[] = [
    {
      gameSrc: "/assets/rewards/u-vs-q-1.png",
      title: "U vs. Q",
      subtitle: "Play for free every day",
    },
    {
      gameSrc: "/assets/games/slot-04.png",
      title: "Western Gold",
      subtitle: "Free spin reward",
    },
    {
      gameSrc: "/assets/games/slot-08.png",
      title: "Tiki Tumble",
      subtitle: "Free spin reward",
    },
  ];

  return (
    <section>
      <h2
        className="px-[16px] text-white font-extrabold text-[16px]"
        style={{ lineHeight: 1.6 }}
      >
        Available to collect
      </h2>
      <div
        className="mt-[12px] flex gap-[16px] overflow-x-auto no-scrollbar px-[16px] pb-[2px]"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {cards.map((c, i) => (
          <AvailableCard key={i} {...c} />
        ))}
      </div>
    </section>
  );
}

type AvailableCardData = {
  gameSrc: string;
  title: string;
  subtitle: string;
};

/** Single "Available to collect" card. Figma 238:5755.
 *
 *  Structure:
 *    [bg-white outer, rounded-16]
 *      [bg-#eff2ff inner, rounded-12, p-12]
 *        [game tile 56×56 with "Free" badge bottom-left]
 *        [content column: title / subtitle / "Available to play"]
 *      [white footer, p-12, T&Cs in gray]
 */
function AvailableCard({
  gameSrc,
  title,
  subtitle,
}: AvailableCardData) {
  return (
    <div
      className="shrink-0 w-[300px] bg-white rounded-[16px] overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="p-[8px]">
        <div
          className="flex gap-[16px] items-start p-[12px] rounded-[12px]"
          style={{ backgroundColor: INNER_CARD }}
        >
          {/* Game tile 56×56 — white border, rounded-12, with a
              "Free" gift badge at the bottom-left. */}
          <div
            className="relative shrink-0 size-[56px] rounded-[12px] overflow-hidden"
            style={{ border: "2px solid #ffffff", backgroundColor: "#cccdd0" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gameSrc}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            {/* "Free" badge — sits below+left of the tile, half
                hanging off. */}
            <div
              className="absolute -bottom-[6px] -left-[6px] flex items-center gap-[3px] px-[6px] h-[18px] rounded-full"
              style={{
                backgroundColor: BRAND_DARK,
                color: "#ffffff",
                border: "1.5px solid #ffffff",
              }}
            >
              <GiftIconSmall className="size-[10px]" />
              <span
                className="text-[9px] font-extrabold"
                style={{ letterSpacing: 0.2, lineHeight: 1 }}
              >
                Free
              </span>
            </div>
          </div>

          {/* Content column — title / subtitle / "Available to
              play" pill. All text in Brand/900. */}
          <div
            className="flex-1 min-w-0 flex flex-col gap-[4px]"
            style={{ color: BRAND_DARK }}
          >
            <p
              className="text-[14px] font-extrabold"
              style={{ letterSpacing: 0.1, lineHeight: 1.4 }}
            >
              {title}
            </p>
            <p
              className="text-[10px] font-medium"
              style={{ letterSpacing: 0.2, lineHeight: 1.4 }}
            >
              {subtitle}
            </p>
            <div
              className="inline-flex items-center self-start px-[8px] h-[22px] rounded-full"
              style={{
                backgroundColor: BRAND_DARK,
                color: "#ffffff",
                marginTop: 2,
              }}
            >
              <span
                className="text-[10px] font-extrabold"
                style={{ letterSpacing: 0.2, lineHeight: 1 }}
              >
                Available to play
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* T&Cs footer — sits in the outer white card, below the
          light-blue inner card. */}
      <div className="px-[12px] pb-[10px] pt-[2px]">
        <p
          className="text-[10px] font-medium opacity-70"
          style={{
            color: "#0e1120",
            letterSpacing: 0.2,
            lineHeight: 1.5,
          }}
        >
          Play daily. Max 20 spins. 24h credit. Expiry &amp; game
          restrictions apply.{" "}
          <span className="font-extrabold underline">Full T&amp;Cs</span>
        </p>
      </div>
    </div>
  );
}

/** "In Progress" featured reward — Figma 238:5783.
 *
 *  Surface: var(--surface/primary, #f2f3f3) — NOT white.
 *  Layout:
 *    [pt-16 px-16 pb-8, rounded-16, gap-12]
 *      [reward header: 60×60 image | content column]
 *      [progress bar + "Wagered £14 of £20"]
 *      [Complete CTA — disabled brand-blue at 50%]
 *      [T&Cs footer]
 *    [pink indicator dot, absolute top-0 right-0, with halo] */
function InProgress() {
  const PROGRESS_PCT = 70; // 14 of 20

  return (
    <section className="px-[16px]">
      <h2
        className="text-white font-extrabold text-[16px]"
        style={{ lineHeight: 1.6 }}
      >
        In Progress
      </h2>

      <div
        className="relative mt-[12px] flex flex-col gap-[12px] rounded-[16px] px-[16px] pt-[16px] pb-[8px]"
        style={{ backgroundColor: SURFACE_GREY }}
      >
        {/* Pink indicator dot — top-right corner with a soft halo
            (Figma 238:5803). */}
        <span
          aria-hidden
          className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 size-[10px] rounded-full"
          style={{
            backgroundColor: PINK,
            boxShadow:
              "0 0 0 6px rgba(208, 0, 202, 0.20), 0 0 0 12px rgba(208, 0, 202, 0.08)",
          }}
        />

        {/* Reward header — image + title/date/pill stack. Figma
            238:5786, gap is 17px (sic). */}
        <div className="flex items-center" style={{ gap: 17 }}>
          <div
            className="shrink-0 size-[60px] rounded-[8px] overflow-hidden"
            style={{ border: "1.8px solid rgba(255,255,255,0.6)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/rewards/dab-disco.png"
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div
            className="flex-1 min-w-0 flex flex-col gap-[4px]"
            style={{ color: BRAND_DARK }}
          >
            <p
              className="text-[14px] font-bold"
              style={{ lineHeight: 1.45 }}
            >
              May Megahaul Cash Bonus
            </p>
            <p
              className="text-[10px] font-medium"
              style={{ letterSpacing: 0.2, lineHeight: 1.5 }}
            >
              Valid until 30th May
            </p>
            {/* In Progress pill — WHITE bg, brand-dark text +
                clock icon. */}
            <div
              className="inline-flex items-center self-start gap-[4px] px-[8px] h-[22px] rounded-full bg-white"
              style={{ color: BRAND_DARK, marginTop: 2 }}
            >
              <ClockIcon className="size-[11px]" />
              <span
                className="text-[10px] font-extrabold"
                style={{ letterSpacing: 0.2, lineHeight: 1 }}
              >
                In Progress
              </span>
            </div>
          </div>
        </div>

        {/* Progress container — 8px-tall bar + caption. */}
        <div className="flex flex-col gap-[4px]">
          <div
            className="relative h-[8px] w-full rounded-full overflow-hidden bg-white"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${PROGRESS_PCT}%`,
                background:
                  "linear-gradient(to right, #f05cd2 0%, #d000ca 54%, #8f47f1 100%)",
              }}
            />
          </div>
          <p
            className="text-[12px] font-medium"
            style={{
              color: BRAND_DARK,
              letterSpacing: 0.2,
              lineHeight: 1.6,
            }}
          >
            Wagered £14 of £20
          </p>
        </div>

        {/* Complete CTA — Figma uses hierarchy=primary state=disabled,
            which renders brand-blue at 50% opacity. */}
        <button
          type="button"
          disabled
          className="h-[48px] w-full rounded-[12px] flex items-center justify-center text-white font-extrabold text-[16px]"
          style={{
            backgroundColor: BRAND,
            opacity: 0.5,
            lineHeight: "24px",
            letterSpacing: 0,
          }}
        >
          Complete to unlock £20
        </button>

        {/* T&Cs footer — small gray, with underlined Full T&Cs. */}
        <p
          className="text-[10px] font-medium opacity-70"
          style={{
            color: TEXT_SECONDARY,
            letterSpacing: 0.2,
            lineHeight: 1.6,
          }}
        >
          Get a £20 cash reward when you&apos;ve wagered £20. Opt
          in &amp; meet wager reqs today.{" "}
          <span className="font-extrabold underline">Full T&amp;Cs</span>.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   OFFERS
   ============================================================ */

function OffersContent() {
  return (
    <div className="mt-[24px] flex flex-col gap-[24px]">
      <FeaturedOffers />
      <ThisWeeksOffers />
      <AllOffers />
    </div>
  );
}

function FeaturedOffers() {
  return (
    <section>
      <h2
        className="px-[16px] text-white font-extrabold text-[16px]"
        style={{ lineHeight: 1.6 }}
      >
        Featured offers
      </h2>
      <div
        className="mt-[12px] flex gap-[12px] overflow-x-auto no-scrollbar px-[16px]"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <FeaturedOfferCard
          src="/assets/rewards/offer-friday-frenzy.png"
          alt="Q's Friday Night Frenzy"
          ctaLabel="More info"
        />
        <FeaturedOfferCard
          src="/assets/rewards/offer-extra-2.png"
          alt="Featured offer"
          ctaLabel="More info"
        />
      </div>
    </section>
  );
}

function FeaturedOfferCard({
  src,
  alt,
  ctaLabel,
}: {
  src: string;
  alt: string;
  ctaLabel: string;
}) {
  return (
    <div
      className="relative shrink-0 w-[320px] rounded-[14px] overflow-hidden"
      style={{ aspectRatio: "320 / 122", scrollSnapAlign: "start" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
      />
      <button
        type="button"
        className="absolute bottom-[12px] right-[12px] bg-white px-[14px] py-[8px] rounded-full text-[13px] font-extrabold active:scale-[0.97] transition-transform"
        style={{ color: BRAND_DARK, letterSpacing: 0.1 }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function ThisWeeksOffers() {
  return (
    <section className="px-[16px]">
      <h2
        className="text-white font-extrabold text-[16px]"
        style={{ lineHeight: 1.6 }}
      >
        This weeks offers
      </h2>
      <div className="mt-[12px] grid grid-cols-2 gap-[12px]">
        <WeekOfferCard
          src="/assets/rewards/offer-big-catch.png"
          title="Catch 25 free spins"
          meta="Deposit & Play £50 on The Big Catch 2"
        />
        <WeekOfferCard
          src="/assets/rewards/offer-lobstermania.png"
          title="Catch 25 free spins"
          meta="Lobstermania is back in the house!"
        />
      </div>
    </section>
  );
}

function WeekOfferCard({
  src,
  title,
  meta,
}: {
  src: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div
        className="rounded-[12px] overflow-hidden"
        style={{ aspectRatio: "162 / 96" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="size-full object-cover"
        />
      </div>
      <p
        className="text-white font-extrabold text-[14px]"
        style={{ letterSpacing: 0.1, lineHeight: 1.4 }}
      >
        {title}
      </p>
      <p
        className="text-white text-[10px] font-medium opacity-80"
        style={{ letterSpacing: 0.2, lineHeight: 1.45 }}
      >
        {meta}
      </p>
      <button
        type="button"
        className="self-start bg-white px-[14px] py-[6px] rounded-full text-[13px] font-extrabold active:scale-[0.97] transition-transform"
        style={{ color: BRAND_DARK, letterSpacing: 0.1 }}
      >
        View offer
      </button>
    </div>
  );
}

function AllOffers() {
  return (
    <section className="px-[16px]">
      <h2
        className="text-white font-extrabold text-[16px]"
        style={{ lineHeight: 1.6 }}
      >
        All offers
      </h2>
      <div className="mt-[12px] bg-white rounded-[16px] overflow-hidden">
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "343 / 170" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/rewards/offer-best-deals.png"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="px-[16px] pt-[14px] pb-[16px] flex flex-col gap-[6px]">
          <p
            className="font-extrabold text-[16px]"
            style={{ color: BRAND_DARK, lineHeight: 1.4 }}
          >
            Q&apos;s Friday Night Frenzy
          </p>
          <p
            className="text-[12px] font-medium"
            style={{
              color: PINK,
              letterSpacing: 0.2,
              lineHeight: 1.45,
            }}
          >
            Valid till 29th April
          </p>
          <p
            className="text-[12px] font-medium opacity-80"
            style={{
              color: TEXT_SECONDARY,
              letterSpacing: 0.2,
              lineHeight: 1.6,
            }}
          >
            Caveats here. Full T&amp;Cs apply.
          </p>
          <div className="mt-[10px] flex items-center gap-[10px]">
            <button
              type="button"
              className="flex-1 h-[44px] rounded-[10px] font-extrabold text-[14px]"
              style={{
                backgroundColor: SURFACE_GREY,
                color: BRAND_DARK,
              }}
            >
              Read more
            </button>
            <Link
              href="#"
              className="flex-1 h-[44px] rounded-[10px] flex items-center justify-center font-extrabold text-[14px] text-white"
              style={{ backgroundColor: BRAND }}
            >
              Claim offer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ICONS
   ============================================================ */

function GiftIconSmall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <rect x="3" y="8" width="18" height="13" rx="1.5" />
      <rect x="2" y="6" width="20" height="4" rx="1" />
      <path d="M12 6v15" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5L10 10" />
    </svg>
  );
}
