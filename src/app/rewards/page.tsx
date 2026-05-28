"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
      className="relative min-h-[100dvh] pt-[20px] pb-[32px]"
      style={{
        // Two surface treatments per tab:
        //   • My Rewards → solid #0a2ecb with an overlaid
        //                  <RewardsBackdrop /> creating the
        //                  two-tone effect (ellipse hides the
        //                  seam between top brand-blue and
        //                  bottom #181f43).
        //   • Offers     → smooth vertical gradient from
        //                  brand-blue to #181f43 over the full
        //                  page height, no ellipse, no
        //                  backdrop overlay.
        background:
          tab === "rewards"
            ? "#0a2ecb"
            : "linear-gradient(180deg, #0a2ecb 0%, #0C2287 100%)",
        // `isolation: isolate` forces this wrapper to be a new
        // stacking context so the rewards backdrop's z-index:-1
        // stays contained.
        isolation: "isolate",
      }}
    >
      {tab === "rewards" && <RewardsBackdrop />}
      <TabSwitcher tab={tab} setTab={setTab} />

      {/* Tab content — soft opacity fade only. Content stays in
          place; the toggle pill above is what animates between
          tabs (see <TabSwitcher />). */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === "rewards" ? <MyRewardsContent /> : <OffersContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Dark-blue layer that covers everything from the ellipse's
 *  vertical centre down to the end of the page. The ellipse
 *  SVG (positioned inside the hero) sits ON TOP of this layer's
 *  hard top edge, and is wider than the mobile-frame at its own
 *  vertical centre — so the seam between #0a2ecb (above) and
 *  #181f43 (below) is hidden behind the ellipse's curve, and the
 *  effect reads as "the ellipse fades the page from brand-blue
 *  into darker blue".
 *
 *  Page wrapper coords (origin = wrapper's top, below BrandBar):
 *    pt-20                                            =  20
 *    tab switcher (px-16 wrapper + 44px pill)         =  52
 *    MyRewardsContent mt-24                           =  24
 *    Hero top                                         =  96
 *    Ellipse top within hero (top:33)                 =  33
 *    → ellipse top in page coords                     = 129
 *    Ellipse height                                   = 130
 *    → ellipse vertical centre                        = 194
 *
 *  So the dark layer starts at 194px from the wrapper's top.
 *  At that y, the ellipse is at its widest (518px in render
 *  space, > 375px mobile-frame), so the seam is hidden across
 *  the full visible width.
 */
function RewardsBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute left-0 right-0 bottom-0 pointer-events-none"
      style={{
        top: 194,
        background: "#0C2287",
        // z-index: -1 puts this between the wrapper's bg and
        // the page's static content. Previously z-index: 0 made
        // the backdrop paint ABOVE non-positioned siblings
        // (tabs, hero, cards), covering them entirely. The
        // negative value places the backdrop in the wrapper's
        // "negative stack levels" layer, which paints above
        // the wrapper's background but below static content.
        zIndex: -1,
      }}
    />
  );
}

/** Tab switcher (Figma 238:5736). White outer pill with a
 *  brand-dark inner "pill" that slides between the two tabs as
 *  the user swaps. Pill x/width are measured from the active
 *  tab button's DOM rect, then animated via a soft spring. */
function TabSwitcher({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const rewardsBtnRef = useRef<HTMLButtonElement | null>(null);
  const offersBtnRef = useRef<HTMLButtonElement | null>(null);

  const [pill, setPill] = useState<{ x: number; w: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      const el =
        tab === "rewards" ? rewardsBtnRef.current : offersBtnRef.current;
      if (!row || !el) return;
      const rowRect = row.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPill({
        x: elRect.left - rowRect.left,
        w: elRect.width,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab]);

  return (
    <div className="px-[16px]">
      <div
        ref={rowRef}
        className="relative bg-white flex items-center p-[4px] rounded-full"
      >
        {/* Sliding pill — absolute, animates x/width when the
            active tab changes. left: 0 anchors the x transform
            to the row's outer-left edge. */}
        {pill && (
          <motion.span
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              top: 4,
              bottom: 4,
              left: 0,
              backgroundColor: BRAND_DARK,
            }}
            initial={false}
            animate={{ x: pill.x, width: pill.w }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 35,
              mass: 0.9,
            }}
          />
        )}

        <button
          ref={rewardsBtnRef}
          type="button"
          onClick={() => setTab("rewards")}
          className="relative z-[1] flex-1 min-w-0 flex items-center justify-center px-[12px] py-[8px] rounded-full"
          style={{
            color: tab === "rewards" ? "#ffffff" : BRAND_DARK,
            transition: "color 200ms",
          }}
        >
          <span
            className="font-extrabold text-[14px]"
            style={{ letterSpacing: 0.1, lineHeight: 1.6 }}
          >
            My Rewards
          </span>
        </button>
        <button
          ref={offersBtnRef}
          type="button"
          onClick={() => setTab("offers")}
          className="relative z-[1] flex-1 min-w-0 flex items-center justify-center px-[12px] py-[8px] rounded-full"
          style={{
            color: tab === "offers" ? "#ffffff" : BRAND_DARK,
            transition: "color 200ms",
          }}
        >
          <span
            className="font-extrabold text-[14px]"
            style={{ letterSpacing: 0.1, lineHeight: 1.6 }}
          >
            Offers
          </span>
        </button>
      </div>
    </div>
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
    <div className="relative flex flex-col items-center gap-[2px] px-[16px]">
      {/* Ellipse backdrop — Figma 238:5742 in spirit, but
          compressed vertically so it stops inside the hero's
          own footprint. The Figma asset is 518×252 which is
          taller than the entire hero, so we render the SVG at
          518×130 — content gets squished into a flatter
          ellipse but with preserveAspectRatio="none" it just
          becomes a wider, shorter halo, which is what we
          actually want here. Combined with a steep mask
          (solid for the first 50%, then fades to transparent
          by 90%), the halo is visible behind the tagline + 200
          and is fully transparent before reaching the
          "Available to collect" section title below the hero. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/rewards/ellipse.svg"
        alt=""
        aria-hidden
        className="absolute -translate-x-1/2 max-w-none pointer-events-none"
        style={{
          left: "50%",
          // 18 → 33 — pushed ~15px down so the ellipse sits
          // BETWEEN the "Your Q Rewards" tagline and the "200"
          // (Figma 238:5742), rather than starting up near the
          // tagline.
          top: 33,
          width: 518,
          height: 130,
          zIndex: 0,
          maskImage:
            "linear-gradient(to bottom, black 0%, black 50%, transparent 90%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 50%, transparent 90%)",
        }}
      />

      {/* Tagline: "Your [Q] Rewards". Yellow Medium text, white Q
          SVG (the MrQ "Q" mark — Figma 238:5745) at 28px so it
          reads as a prominent logo between the words rather than
          just inline punctuation. */}
      <div className="relative z-[1] flex items-center justify-center gap-[6px]">
        <span
          className="font-medium text-[14px]"
          style={{ color: YELLOW, lineHeight: 1.6, letterSpacing: 0.1 }}
        >
          Your
        </span>
        {/* Inline SVG so we control the aspect ratio.
            The exported q-title.svg has preserveAspectRatio="none"
            and width="100%" height="100%", which was stretching
            the Q vertically when rendered as <img>. Going inline
            with explicit viewBox + default preserveAspectRatio
            (xMidYMid meet) keeps the Q's natural 25×19.44 shape
            scaled into a 28×22 box. */}
        <QLogo width={28} height={22} />
        <span
          className="font-medium text-[14px]"
          style={{ color: YELLOW, lineHeight: 1.6, letterSpacing: 0.1 }}
        >
          Rewards
        </span>
      </div>

      {/* Big 200 — Figma 238:5748: 59.874px ExtraBold, tracking
          -0.998, leading 1.2. 20px top margin pushes the
          number down off the ellipse top curve so it doesn't
          feel cramped against the dark dome edge. */}
      <p
        className="relative z-[1] text-center text-white font-extrabold"
        style={{
          marginTop: 20,
          fontSize: 60,
          letterSpacing: "-1px",
          lineHeight: 1.2,
        }}
      >
        200
      </p>

      {/* "Free Spins" with coin icon to the left.
          Figma 238:5750: 15.592px ExtraBold, tracking -0.26,
          leading 1.6. Coin icon (Figma 238:5751) sized 18×17 in
          the source — rendering at 18 square for simplicity. */}
      <div className="relative z-[1] flex items-center justify-center gap-[6px] mt-[4px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/rewards/spins-icon.png"
          alt=""
          aria-hidden
          className="size-[18px] object-contain"
        />
        <span
          className="text-white font-extrabold"
          style={{
            fontSize: 15.5,
            letterSpacing: "-0.26px",
            lineHeight: 1.6,
          }}
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
    // SECTION has padding-left: 16 (same as the In Progress
    // section which the user has confirmed lines up correctly).
    // Title and scroll BOTH sit inside this padding, so they
    // share the same 16px page gutter. No nested padding, no
    // negative margins, no inline-flex tricks — just the
    // section's own padding doing the work.
    <section style={{ paddingLeft: 16 }}>
      <h2
        className="text-white font-extrabold text-[16px]"
        style={{ paddingRight: 16, lineHeight: 1.6 }}
      >
        Available to collect
      </h2>
      <div
        className="no-scrollbar"
        style={{
          marginTop: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            paddingRight: 16,
            paddingBottom: 2,
            gap: 16,
          }}
        >
          {cards.map((c, i) => (
            <div key={i} style={{ flexShrink: 0 }}>
              <AvailableCard {...c} />
            </div>
          ))}
        </div>
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
      className="shrink-0 w-[300px] bg-white rounded-[16px]"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="p-[8px]">
        <div
          className="flex gap-[16px] items-start p-[12px] rounded-[12px]"
          style={{ backgroundColor: INNER_CARD }}
        >
          {/* Game tile 56×56 — image clipped to a rounded inner
              div with the white border, then the "Free" badge is
              a SIBLING of that inner div so it can hang off the
              bottom-left corner without being clipped. (Earlier
              the badge was inside the overflow-hidden div and got
              silently clipped to almost nothing.) */}
          <div className="relative shrink-0 size-[56px]">
            <div
              className="absolute inset-0 rounded-[12px] overflow-hidden"
              style={{
                border: "2px solid #ffffff",
                backgroundColor: "#cccdd0",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gameSrc}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            {/* "Free" gift badge — hangs off the bottom-left
                corner of the tile. */}
            <div
              className="absolute flex items-center gap-[3px] px-[6px] h-[18px] rounded-full"
              style={{
                bottom: -6,
                left: -6,
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
        {/* Indicator badge — Figma 238:5803. Concentric circles:
            #D000CA pink centre, white middle ring, 5.75px
            #12257C (brand-dark) outer ring. The badge is 22px
            wide and its CENTRE sits exactly at the card's
            top-right corner (top: -11, right: -11), so it
            reads as a half-outside notification dot. */}
        <IndicatorBadge />

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
      <ThisWeeksOffers />
      <AllOffers />
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
          title="Slingo spins"
          meta="Lobstermania is back in the house!"
        />
      </div>
    </section>
  );
}

/** Single "This weeks offers" card — white outer container,
 *  with the image sitting INSET from the card edges via an 8px
 *  white margin around it (the image has its own rounded
 *  corners). Below the image: title + meta + full-width
 *  "View offer" CTA. */
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
    <div className="bg-white rounded-[16px] flex flex-col">
      {/* Image — wrapped in an 8px white padding box so the
          card's white bg shows on all four sides of the image.
          Image itself has its own rounded-12 corners. */}
      <div className="p-[8px]">
        <div
          className="rounded-[12px] overflow-hidden"
          style={{ aspectRatio: "162 / 110" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="size-full object-cover"
          />
        </div>
      </div>
      {/* Text + CTA block. */}
      <div className="flex flex-col gap-[6px] px-[12px] pb-[12px]">
        <p
          className="font-extrabold text-[14px]"
          style={{ color: BRAND_DARK, lineHeight: 1.4 }}
        >
          {title}
        </p>
        <p
          className="text-[11px] font-medium"
          style={{
            color: TEXT_SECONDARY,
            letterSpacing: 0.2,
            lineHeight: 1.45,
          }}
        >
          {meta}
        </p>
        <button
          type="button"
          className="mt-[6px] w-full h-[40px] rounded-[10px] font-extrabold text-[13px] text-white active:scale-[0.98] transition-transform"
          style={{ backgroundColor: BRAND_DARK, letterSpacing: 0.1 }}
        >
          View offer
        </button>
      </div>
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
      <div className="mt-[12px] bg-white rounded-[16px] flex flex-col">
        {/* Banner image with 8px white margin (matching the
            This-weeks-offers cards). The image has its own
            rounded-12 corners + overflow-hidden so the inset is
            cleanly visible on all four sides. */}
        <div className="p-[8px]">
          <div
            className="rounded-[12px] overflow-hidden"
            style={{ aspectRatio: "343 / 170" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/rewards/offer_bannerimg.png"
              alt=""
              className="size-full object-cover"
            />
          </div>
        </div>
        <div className="px-[16px] pb-[16px] flex flex-col gap-[6px]">
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

/** White "Q" mark inline SVG — used in the "Your [Q] Rewards"
 *  headline. Inlined because the Figma-exported q-title.svg uses
 *  preserveAspectRatio="none" + width="100%" height="100%", which
 *  was stretching the Q vertically when rendered via <img>.
 *  Inline SVG with explicit viewBox + default preserveAspectRatio
 *  ("xMidYMid meet") keeps the Q's natural 25×19.44 shape scaled
 *  proportionally into whatever width/height we pass. */
function QLogo({
  width = 28,
  height = 22,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 25 19.4427"
      fill="none"
      aria-hidden
    >
      <path
        d="M21.2899 15.7952C20.0532 15.7952 18.9105 15.4352 17.9399 14.8403C18.8635 13.3532 19.4114 11.5842 19.4114 9.7057C19.4114 4.35191 15.0595 0 9.7057 0C4.35191 0 0 4.35191 0 9.7057C0 15.0595 4.35191 19.4114 9.7057 19.4114C11.8503 19.4114 13.8384 18.707 15.4352 17.5329C17.0789 18.7226 19.0983 19.4427 21.2899 19.4427C22.6049 19.4427 23.8572 19.1922 25 18.7226V14.5899C23.9668 15.3569 22.6832 15.7952 21.2899 15.7952ZM15.2004 11.5216C14.4803 10.7545 13.6349 10.0814 12.6644 9.54916C11.7095 9.03256 10.7076 8.68816 9.7057 8.50031V12.2261C10.1284 12.3513 10.5354 12.5235 10.9267 12.727C11.7564 13.181 12.4452 13.7915 12.9775 14.4959C12.0539 15.1378 10.9267 15.5135 9.72134 15.5135C6.52786 15.5291 3.92924 12.9461 3.92924 9.75266C3.92924 6.55917 6.51221 3.97621 9.7057 3.97621C12.8992 3.97621 15.4822 6.55917 15.4822 9.75266C15.4822 10.3788 15.3882 10.9737 15.2004 11.5216Z"
        fill="white"
      />
    </svg>
  );
}

/** Pink notification-dot indicator with white ring + dark-blue
 *  outer ring — Figma 238:5803 indicator.svg ported to an inline
 *  SVG for reliable rendering at a fixed size. Positioned by the
 *  caller (absolute, top: -11, right: -11) so its CENTRE lands
 *  on the card's top-right corner. */
function IndicatorBadge() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: -11,
        right: -11,
        width: 22,
        height: 22,
        pointerEvents: "none",
      }}
    >
      <svg
        width={22}
        height={22}
        viewBox="0 0 21.5 21.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* White centre disc with the brand-dark outer stroke
            (stroke-width 5.75 = the dark ring). */}
        <circle
          cx="10.75"
          cy="10.75"
          r="7.875"
          fill="#ffffff"
          stroke="#12257C"
          strokeWidth="5.75"
        />
        {/* Pink dot — the actual indicator centre. */}
        <circle cx="10.75" cy="10.75" r="4" fill="#D000CA" />
      </svg>
    </div>
  );
}

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
