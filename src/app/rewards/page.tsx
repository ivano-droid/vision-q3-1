"use client";

/**
 * Rewards page — rebuilt from Figma node 29209:1233 (CR Q2 Iterations).
 *
 * Dark-blue gradient surface (the BrandBar + BottomNav are provided by
 * the prototype shell, so they're intentionally omitted here):
 *   1. "Evening, James"            — greeting
 *   2. "Pick your daily free game" — horizontal rail of game cards
 *   3. "In Progress"               — active reward with progress bar
 *   4. "This weeks offers"         — 2-column grid of offer cards
 *
 * The previous design is preserved in ./RewardsPageLegacy.tsx.
 */

// ── Data ──────────────────────────────────────────────────────────

const DAILY_TC =
  "Play daily. Max 20 spins. 24h credit. Expiry & game restrictions apply.";

const DAILY_GAMES = [
  {
    image: "/assets/rewards/v2/daily-uvsq.png",
    title: "U vs. Q",
    subtitle: "Crack Q before it cracks you",
  },
  {
    image: "/assets/rewards/v2/daily-spotkick.png",
    title: "Spot kick",
    subtitle: "Slot it past the keeper",
  },
];

const WEEKLY_OFFERS = [
  {
    image: "/assets/rewards/v2/weekly-frenzy.png",
    title: "Q's Friday Night Frenzy",
    subtitle: "Hop on one of the best days of the week with a chance to win big!",
  },
  {
    image: "/assets/rewards/v2/weekly-slingo.png",
    title: "Slingo spins",
    subtitle: "Lobstermania is back in the house!",
  },
  {
    image: "/assets/rewards/v2/weekly-catch.png",
    title: "Catch 25 free spins",
    subtitle: "Deposit & Play £50 on The Big Catch 2",
  },
  {
    image: "/assets/rewards/v2/weekly-disco.png",
    title: "Dab & Disco Bingo",
    subtitle: "With a bonus Bingo is cool again",
  },
];

// ── Icons ─────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg
      aria-hidden
      width={13}
      height={14}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginLeft: 1 }}
    >
      <path
        d="M8.9961 3.58413C9.5137 3.89467 9.9551 4.15949 10.2865 4.40205C10.6234 4.64864 10.9659 4.95424 11.1568 5.39073C11.4207 5.99436 11.4207 6.68075 11.1568 7.28438C10.9659 7.72087 10.6234 8.02647 10.2865 8.27306C9.9551 8.51562 9.51369 8.78045 8.99609 9.09099L4.86462 11.5699C4.31924 11.8971 3.85669 12.1747 3.47109 12.3604C3.08209 12.5478 2.63415 12.7131 2.14427 12.6674C1.47176 12.6048 0.858204 12.2574 0.458451 11.7129C0.167254 11.3164 0.0785189 10.8472 0.0390693 10.4172C-3.44493e-05 9.99104 -1.86407e-05 9.45162 0 8.8156V8.81556V3.85956V3.85951C-1.86407e-05 3.2235 -3.44478e-05 2.68408 0.0390693 2.25787C0.0785189 1.82789 0.167254 1.35874 0.458451 0.962164C0.858204 0.41775 1.47176 0.0703587 2.14427 0.00767219C2.63415 -0.0379914 3.08209 0.127295 3.47109 0.314689C3.85669 0.500444 4.31924 0.777994 4.86462 1.10525L8.9961 3.58413Z"
        fill="white"
      />
    </svg>
  );
}

// Small T&C line reused under the daily cards and the in-progress card.
function FullTcs({ light }: { light?: boolean }) {
  return (
    <span
      className="font-extrabold underline"
      style={{ color: light ? "#ffffff" : "#0e1120" }}
    >
      Full T&amp;Cs
    </span>
  );
}

// ── Components ────────────────────────────────────────────────────

function DailyGameCard({ game }: { game: (typeof DAILY_GAMES)[number] }) {
  return (
    <div className="w-full flex flex-col">
      {/* White game row */}
      <div className="bg-white flex items-center gap-[12px] rounded-[12px] px-[12px] py-[8px]">
        <div
          className="shrink-0 overflow-hidden rounded-[9px]"
          style={{ width: 56, height: 56 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={game.image}
            alt={game.title}
            draggable={false}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col" style={{ color: "var(--mrq-blue-dark)" }}>
          <p className="font-bold truncate" style={{ fontSize: 17, lineHeight: "21px" }}>
            {game.title}
          </p>
          <p
            className="font-medium truncate"
            style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.2 }}
          >
            {game.subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Play ${game.title}`}
          className="shrink-0 inline-flex items-center justify-center rounded-full active:scale-[0.95] transition-transform"
          style={{ width: 32, height: 32, backgroundColor: "var(--mrq-blue)" }}
        >
          <PlayIcon />
        </button>
      </div>

      {/* Footer T&C — sits on the gradient, in white */}
      <p
        className="font-medium pt-[8px] px-[4px]"
        style={{
          fontSize: 10,
          lineHeight: 1.6,
          letterSpacing: 0.2,
          color: "#ffffff",
          opacity: 0.7,
        }}
      >
        {DAILY_TC} <FullTcs light />
      </p>
    </div>
  );
}

function InProgressCard() {
  return (
    <div className="w-full flex flex-col">
      {/* Light-blue reward card sitting directly on the gradient */}
      <div
        className="flex flex-col gap-[12px] rounded-[12px] p-[12px]"
        style={{ backgroundColor: "#e6eafa" }}
      >
        {/* Header — reward image + title + progress */}
        <div className="flex items-center gap-[12px] w-full">
          <div
            className="shrink-0 overflow-hidden rounded-[12px]"
            style={{ width: 52, height: 52, border: "2px solid #ffffff" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/rewards/v2/progress-reward.png"
              alt="May Megahaul Cash Bonus"
              draggable={false}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
            <p
              className="font-extrabold truncate"
              style={{ fontSize: 14, lineHeight: 1.6, letterSpacing: 0.1, color: "var(--mrq-blue)" }}
            >
              May Megahaul Cash Bonus
            </p>
            {/* Progress bar */}
            <div
              className="relative w-full overflow-hidden rounded-full"
              style={{ height: 8, backgroundColor: "#ced5f5" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: "62%",
                  background:
                    "linear-gradient(90deg, #f05cd2 0%, #d000ca 54%, #8f47f1 99%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Wagered / valid-until row */}
        <div
          className="flex items-center justify-between w-full font-medium"
          style={{ fontSize: 12, lineHeight: 1.6, letterSpacing: 0.2, color: "var(--mrq-blue-dark)" }}
        >
          <p>
            Wagered <span className="font-extrabold">£14</span> of{" "}
            <span className="font-extrabold">£20</span>
          </p>
          <p>
            Valid until <span className="font-extrabold">30th</span> May
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          className="w-full flex items-center justify-center rounded-[8px] px-[16px] py-[8px] font-extrabold active:scale-[0.99] transition-transform"
          style={{ backgroundColor: "var(--mrq-blue)", color: "white", fontSize: 16, lineHeight: "24px" }}
        >
          Complete to unlock £50 cash
        </button>
      </div>

      {/* Footer T&C — white on the gradient */}
      <p
        className="font-medium pt-[8px] px-[4px]"
        style={{ fontSize: 10, lineHeight: 1.6, letterSpacing: 0.2, color: "#ffffff", opacity: 0.7 }}
      >
        {DAILY_TC} <FullTcs light />
      </p>
    </div>
  );
}

function WeeklyOfferCard({ offer }: { offer: (typeof WEEKLY_OFFERS)[number] }) {
  return (
    <div className="bg-white rounded-[16px] pt-[8px] px-[8px] pb-[12px] flex flex-col gap-[16px]">
      <div className="flex-1 flex flex-col gap-[8px]">
        <div
          className="w-full overflow-hidden rounded-[12px]"
          style={{ aspectRatio: "149.5 / 100", border: "1px solid #ffffff" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={offer.image}
            alt={offer.title}
            draggable={false}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <p
            className="font-extrabold"
            style={{ fontSize: 12, lineHeight: 1.6, letterSpacing: 0.2, color: "var(--mrq-blue)" }}
          >
            {offer.title}
          </p>
          <p
            className="font-medium"
            style={{ fontSize: 9, lineHeight: 1.6, letterSpacing: 0.2, color: "#0e1120" }}
          >
            {offer.subtitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center rounded-[7px] py-[4px] font-extrabold active:scale-[0.98] transition-transform"
        style={{ backgroundColor: "var(--mrq-blue)", color: "white", fontSize: 12, lineHeight: "21px" }}
      >
        View offer
      </button>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-extrabold text-white w-full"
      style={{ fontSize: 16, lineHeight: 1.6 }}
    >
      {children}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function RewardsPage() {
  return (
    <div
      className="relative"
      style={{
        minHeight: "100%",
        background: "linear-gradient(180deg, #0c2287 0%, #181f43 100%)",
      }}
    >
      {/* Brand-blue header (Figma shape 29218:1838) — continues the
          BrandBar's blue and curves down into the gradient. The convex
          bottom (elliptical bottom radius) dips lowest at the centre and
          rises at the left/right edges, matching the design. Pure CSS so
          it stays pinned full-width at any frame size. */}
      <div
        aria-hidden
        style={{
          height: 40,
          backgroundColor: "var(--mrq-blue)",
          borderBottomLeftRadius: "50% 20px",
          borderBottomRightRadius: "50% 20px",
        }}
      />

      <div className="flex flex-col gap-[32px] px-[16px] pt-[12px]">
        {/* Greeting */}
        <h1
          className="font-extrabold text-white text-center w-full"
          style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: -0.24 }}
        >
          Evening, James
        </h1>

        {/* Pick your daily free game */}
        <section className="flex flex-col gap-[12px]">
          <SectionTitle>Pick your daily free game</SectionTitle>
          <div
            className="flex gap-[16px] overflow-x-auto -mx-[16px] px-[16px] [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              scrollSnapType: "x mandatory",
              scrollPaddingLeft: 16,
              scrollPaddingRight: 16,
            }}
          >
            {DAILY_GAMES.map((game) => (
              <div
                key={game.title}
                className="shrink-0 w-full"
                style={{ flex: "0 0 100%", scrollSnapAlign: "start" }}
              >
                <DailyGameCard game={game} />
              </div>
            ))}
          </div>
        </section>

        {/* In Progress */}
        <section className="flex flex-col gap-[12px]">
          <SectionTitle>In Progress</SectionTitle>
          <InProgressCard />
        </section>

        {/* This weeks offers */}
        <section className="flex flex-col gap-[12px]">
          <SectionTitle>This weeks offers</SectionTitle>
          <div className="grid grid-cols-2 gap-x-[12px] gap-y-[12px]">
            {WEEKLY_OFFERS.map((offer) => (
              <WeeklyOfferCard key={offer.title} offer={offer} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
