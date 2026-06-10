"use client";

/**
 * Rewards page — rebuilt from Figma node 373-32406.
 *
 * Layout:
 *   1. "For you" — blue header with a compact horizontal reward card
 *   2. "Offers"  — list of offer cards with wide banner images
 */

// ── For You ───────────────────────────────────────────────────────

const FOR_YOU = {
  image: "/assets/rewards/u-vs-q-1.png",
  title: "U vs. Q",
  subtitle: "Play for free every day",
  tc: "Play daily. Max 20 spins. 24h credit. Expiry & game restrictions apply.",
};

// ── Offers ────────────────────────────────────────────────────────

const OFFERS = [
  {
    image: "/assets/rewards/offer-friday-frenzy.png",
    title: "Q's Friday Night Frenzy",
    subtitle: "Every Friday. 5pm.",
    cta: "Play Friday",
    tc: "Free spins drop at 5pm every Friday. Spins expire in 7 days once credited.",
    hasTCs: true,
  },
  {
    image: "/assets/rewards/offer-big-catch.png",
    title: "Claim 25 free spins",
    subtitle: "When you Deposit & Play £50",
    cta: "Claim Offer",
    tc: "Deposit & wager £50+. Use code GOONIES25. 25 x 10p free spins credited. Spins expire 24hrs once claimed.",
    hasTCs: true,
  },
  {
    image: "/assets/rewards/slingoreward.png",
    title: "Feeling hot or cold? 🔥❄️",
    subtitle: "Get 10 Free Rounds on Slingo",
    cta: "Claim Offer",
    tc: "Deposit & Play £25 on Slingo Fire & Ice with code ICEFIRE & get 10 rounds, each worth £0.20. Ends on 07.06.26",
    hasTCs: true,
  },
  {
    image: "/assets/rewards/u-vs-q-2.png",
    title: "Take on Q. Win free spins",
    subtitle: "Crack Q before it cracks you",
    cta: "Play for free",
    tc: "Play daily. Max 20 spins. 24h credit. Expiry & game restrictions apply.",
    hasTCs: false,
  },
  {
    image: "/assets/rewards/offer-lobstermania.png",
    title: "No wagering. No hoops",
    subtitle: "We're a casino. Not an obstacle course",
    cta: "Play",
    tc: "You win it once. You keep it. No nonsense.",
    hasTCs: false,
  },
  {
    image: "/assets/rewards/offer-extra-1.png",
    title: "Thumbs up to emails",
    subtitle: "Free spins, promos & more",
    cta: "Update Here",
    tc: "No spam, just the good stuff. Marketing preferences can be updated at any time.",
    hasTCs: false,
  },
  {
    image: "/assets/rewards/offer-extra-2.png",
    title: "Invite a friend. Get spins",
    subtitle: "You both win (for now)",
    cta: "Claim offer",
    tc: "New referees only. £10 lifetime deposit & wager for both. 7-day expiry.",
    hasTCs: true,
  },
  {
    image: "/assets/rewards/catchreward.png",
    title: "Do the admin. Get spins.",
    subtitle: "30 seconds. 10 free spins. Job done.",
    cta: "Claim offer",
    tc: "Deposit £10+ for 10 free spins on Squealin' Riches. 24h expiry.",
    hasTCs: true,
  },
];

// ── Components ────────────────────────────────────────────────────

function GiftIcon() {
  return (
    <svg
      aria-hidden
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--mrq-blue-dark)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden
      width={12}
      height={13}
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

function ForYouCard() {
  return (
    <div
      className="mx-[16px] mt-[12px] rounded-[16px] overflow-hidden bg-white"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.14)" }}
    >
      {/* Content — light-blue inner box */}
      <div className="p-[8px]">
        <div
          className="flex items-center gap-[16px] rounded-[12px] p-[12px]"
          style={{ backgroundColor: "#eff2ff" }}
        >
          {/* Thumbnail with overlapping Free badge */}
          <div className="relative shrink-0" style={{ width: 56 }}>
            <div
              className="overflow-hidden rounded-[12px]"
              style={{ width: 56, height: 56, border: "2px solid white" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FOR_YOU.image}
                alt={FOR_YOU.title}
                draggable={false}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className="absolute inline-flex items-center justify-center gap-[4px] h-[20px] rounded-[4px]"
              style={{
                left: 8,
                bottom: -3,
                paddingLeft: 4,
                paddingRight: 8,
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 4px rgba(10, 46, 203, 0.24)",
              }}
            >
              <GiftIcon />
              <span
                className="font-extrabold"
                style={{ fontSize: 10, lineHeight: 1.6, letterSpacing: 0.2, color: "var(--mrq-blue-dark)" }}
              >
                Free
              </span>
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-[2px]">
            <p
              className="font-extrabold truncate"
              style={{ fontSize: 14, lineHeight: 1.6, letterSpacing: 0.1, color: "var(--mrq-blue-dark)" }}
            >
              {FOR_YOU.title}
            </p>
            <p
              className="font-medium truncate"
              style={{ fontSize: 12, lineHeight: 1.6, letterSpacing: 0.2, color: "var(--mrq-blue-dark)" }}
            >
              {FOR_YOU.subtitle}
            </p>
          </div>

          {/* Play button */}
          <button
            type="button"
            aria-label={`Play ${FOR_YOU.title}`}
            className="shrink-0 inline-flex items-center justify-center rounded-full active:scale-[0.95] transition-transform"
            style={{ width: 32, height: 32, backgroundColor: "var(--mrq-blue)" }}
          >
            <PlayIcon />
          </button>
        </div>
      </div>

      {/* Footer T&C */}
      <p
        className="px-[12px] pt-[4px] pb-[8px]"
        style={{ fontSize: 10, lineHeight: 1.6, letterSpacing: 0.2, color: "#0e1120", opacity: 0.7 }}
      >
        {FOR_YOU.tc}{" "}
        <span className="font-extrabold underline">Full T&amp;Cs</span>
      </p>
    </div>
  );
}

function OfferCard({ offer }: { offer: typeof OFFERS[0] }) {
  return (
    <div
      className="rounded-[16px] overflow-hidden bg-white"
      style={{ boxShadow: "0 1px 2px rgba(14,17,32,0.12)" }}
    >
      {/* Banner image — inset 8px, rounded-8 (310×120 aspect from Figma) */}
      <div className="p-[8px] pb-0">
        <div
          className="relative w-full overflow-hidden rounded-[8px]"
          style={{ aspectRatio: "310/120" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={offer.image}
            alt={offer.title}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Card body */}
      <div className="px-[16px] pt-[12px] pb-[16px]">
        {/* Title — 18px ExtraBold brand-dark */}
        <p
          className="font-extrabold"
          style={{ fontSize: 18, lineHeight: 1.6, letterSpacing: "-0.3px", color: "var(--mrq-blue-dark)" }}
        >
          {offer.title}
        </p>
        {/* Subtitle — 12px Medium pink */}
        <p
          className="font-medium"
          style={{ fontSize: 12, lineHeight: 1.6, letterSpacing: 0.2, color: "#e75be3" }}
        >
          {offer.subtitle}
        </p>
        {/* Caveat / T&Cs — 12px SemiBold neutral */}
        <p
          className="mt-[4px] font-semibold"
          style={{ fontSize: 12, lineHeight: 1.6, letterSpacing: 0.2, color: "#808289" }}
        >
          {offer.tc}
          {offer.hasTCs && (
            <>
              {" "}
              <span className="font-extrabold underline">Full T&amp;Cs</span>
            </>
          )}
        </p>

        {/* Buttons — equal width, rounded-8, 40px */}
        <div className="mt-[16px] flex items-center gap-[8px]">
          <button
            type="button"
            className="flex-1 h-[40px] rounded-[8px] font-extrabold active:scale-[0.98] transition-transform"
            style={{ backgroundColor: "#f2f3f3", color: "var(--mrq-blue)", fontSize: 14, lineHeight: 1.7 }}
          >
            Read more
          </button>
          <button
            type="button"
            className="flex-1 h-[40px] rounded-[8px] font-extrabold active:scale-[0.98] transition-transform"
            style={{ backgroundColor: "var(--mrq-blue)", color: "white", fontSize: 14, lineHeight: 1.7 }}
          >
            {offer.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function RewardsPage() {
  return (
    <div style={{ backgroundColor: "#f2f3f3", minHeight: "100%" }}>

      {/* For you — blue header section */}
      <div className="pb-[24px]" style={{ backgroundColor: "var(--mrq-blue)" }}>
        <p
          className="px-[16px] pt-[16px] pb-[4px] font-bold text-white"
          style={{ fontSize: 20, letterSpacing: "-0.3px" }}
        >
          For you
        </p>
        <ForYouCard />
      </div>

      {/* Offers */}
      <div className="px-[16px] pt-[20px] pb-[32px]">
        <p
          className="mb-[14px] font-extrabold"
          style={{ fontSize: 20, color: "var(--mrq-blue)", letterSpacing: "-0.3px" }}
        >
          Offers
        </p>
        <div className="flex flex-col gap-[16px]">
          {OFFERS.map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </div>
      </div>

    </div>
  );
}
