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
  cta: "Read more",
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

function ForYouCard() {
  return (
    <div
      className="mx-[16px] mt-[12px] rounded-[16px] overflow-hidden"
      style={{
        backgroundColor: "#fff7e5",
        boxShadow: "0 2px 16px rgba(0,0,0,0.14)",
      }}
    >
      {/* Horizontal row: thumbnail left, info right */}
      <div className="flex items-start gap-[12px] p-[14px]">
        {/* Thumbnail */}
        <div className="relative shrink-0">
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
          {/* Free badge below thumbnail */}
          <div
            className="mt-[6px] flex items-center justify-center gap-[4px] px-[8px] h-[22px] rounded-full"
            style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
          >
            <span className="text-[11px] font-extrabold" style={{ color: "var(--mrq-blue)" }}>
              Free
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-extrabold leading-tight" style={{ color: "var(--mrq-blue)" }}>
            {FOR_YOU.title}
          </p>
          <p className="mt-[2px] text-[13px] font-medium" style={{ color: "#d000c9" }}>
            {FOR_YOU.subtitle}
          </p>
          <button
            type="button"
            className="mt-[10px] h-[32px] px-[14px] rounded-full text-[12px] font-bold active:scale-[0.97] transition-transform"
            style={{ backgroundColor: "#f2f3f3", color: "#676972" }}
          >
            {FOR_YOU.cta}
          </button>
        </div>
      </div>

      {/* T&C */}
      <p className="px-[14px] pb-[12px] text-[10px] leading-[1.5]" style={{ color: "#676972" }}>
        {FOR_YOU.tc}
      </p>
    </div>
  );
}

function OfferCard({ offer }: { offer: typeof OFFERS[0] }) {
  return (
    <div
      className="rounded-[16px] overflow-hidden bg-white"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      {/* Wide banner image — 310×120 aspect ratio from Figma */}
      <div className="relative w-full" style={{ aspectRatio: "310/120" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={offer.image}
          alt={offer.title}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Card body */}
      <div className="px-[14px] pt-[12px] pb-[14px]">
        {/* Title — 20px ExtraBold blue */}
        <p
          className="font-extrabold leading-tight"
          style={{ fontSize: 20, color: "var(--mrq-blue)", letterSpacing: "-0.3px" }}
        >
          {offer.title}
        </p>
        {/* Subtitle — 16px Medium pink */}
        <p
          className="mt-[2px] font-medium"
          style={{ fontSize: 16, color: "#d000c9" }}
        >
          {offer.subtitle}
        </p>

        {/* Buttons */}
        <div className="mt-[12px] flex items-center gap-[8px]">
          <button
            type="button"
            className="h-[38px] px-[16px] rounded-full text-[14px] font-bold active:scale-[0.97] transition-transform"
            style={{ backgroundColor: "#f2f3f3", color: "var(--mrq-blue)" }}
          >
            Read More
          </button>
          <button
            type="button"
            className="h-[38px] px-[18px] rounded-full text-[14px] font-bold active:scale-[0.97] transition-transform"
            style={{ backgroundColor: "var(--mrq-blue)", color: "white" }}
          >
            {offer.cta}
          </button>
        </div>

        {/* T&Cs */}
        <p className="mt-[10px] text-[11px] leading-[1.5]" style={{ color: "#676972" }}>
          {offer.tc}
        </p>
        {offer.hasTCs && (
          <button
            type="button"
            className="mt-[2px] text-[11px] underline"
            style={{ color: "#676972" }}
          >
            Full T&Cs
          </button>
        )}
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
