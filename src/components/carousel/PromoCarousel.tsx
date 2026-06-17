"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

/**
 * Promo carousel — brand-blue "GET FREE SPINS" promo cards (Figma
 * CR-Q2 29105:5526). Horizontal scroll-snap rail; each card carries an
 * eyebrow, a big headline, a white CTA pill, a per-card illustration on
 * the right, and a blurred "promo belt" with the T&Cs at the bottom.
 *
 *   ┌──────────────────────────────────┐
 *   │ GET FREE SPINS            ╱artwork│
 *   │ Play for free and                 │
 *   │ win real money                    │
 *   │ ┌──────────┐                      │
 *   │ │ Play now │                      │
 *   │ └──────────┘                      │
 *   │ ── promo belt: Get 50 Free Spins… │
 *   └──────────────────────────────────┘
 *
 * Replaces the PNG-based HeroCarousel for now (that one is kept behind
 * a flag in HomeView so it can be switched back).
 */

type PromoVariant = "qplus" | "q" | "meatballs" | "person" | "giveaway";

type PromoCardData = {
  key: string;
  eyebrow: string;
  /** Headline split into the lines the design breaks at. */
  lines: string[];
  /** Optional rich headline (lets a word be coloured); takes priority
   *  over `lines` for rendering. */
  linesNode?: ReactNode[];
  /** Accessible title used for aria-label when linesNode is set. */
  label?: string;
  cta: string;
  href?: string;
  variant: PromoVariant;
  /** Max width of the text column so it clears the right-side art. */
  textMaxW: number;
  /** Per-card promo-belt caveat (defaults to the free-spins one). */
  caveat?: string;
};

const CARDS: PromoCardData[] = [
  {
    key: "qplus",
    eyebrow: "DISCOVER Q+",
    lines: ["Where things", "get interesting"],
    linesNode: [
      "Where things",
      <>
        get <span style={{ color: "#00b3ff" }}>interesting</span>
      </>,
    ],
    label: "Where things get interesting",
    cta: "Upgrade to Q+",
    href: "/passes",
    variant: "qplus",
    textMaxW: 205,
    caveat:
      "Get tons of spins, cashback, chips, and Triple payout withdrawal guarantee with Q+ ",
  },
  {
    key: "play-free",
    eyebrow: "GET FREE SPINS",
    lines: ["Play for free and", "win real money"],
    cta: "Play now",
    href: "/passes",
    variant: "q",
    textMaxW: 205,
  },
  {
    key: "refer-meatballs",
    eyebrow: "SPICY MEATBALLS",
    lines: ["Turn up the heat &", "spin for big wins"],
    cta: "Play now",
    variant: "meatballs",
    textMaxW: 230,
  },
  {
    key: "refer-person",
    eyebrow: "GET FREE SPINS",
    lines: ["Refer a mate!", "& get 50 free spins"],
    cta: "Refer now",
    variant: "person",
    textMaxW: 220,
  },
  {
    key: "giveaway",
    eyebrow: "WILD SWARM",
    lines: ["Our Biggest", "Giveaway, Ever!"],
    cta: "Play now",
    variant: "giveaway",
    textMaxW: 220,
  },
];

const CAVEAT =
  "Get 50 Free Spins on selected games when you log in 00:00 - 23:59 on 25/12/2026. Opt in & meet wager reqs today. ";

export function PromoCarousel() {
  const railRef = useDraggableScroll<HTMLDivElement>();
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-label="Featured promotions"
      className="relative"
      initial={false}
      animate={
        reduce ? undefined : { opacity: [0, 1], y: [24, 0], scale: [0.96, 1] }
      }
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={railRef}
        className="no-scrollbar flex gap-[12px] overflow-x-auto overflow-y-hidden px-[16px] pt-[14px] pb-[12px]"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: "16px",
        }}
      >
        {CARDS.map((card) => (
          <PromoCard key={card.key} card={card} />
        ))}
      </div>
    </motion.section>
  );
}

function PromoCard({ card }: { card: PromoCardData }) {
  const router = useRouter();
  const { eyebrow, lines, linesNode, label, cta, href, variant, textMaxW, caveat } = card;
  const titleLines = linesNode ?? lines;

  return (
    <button
      type="button"
      data-component="OfferCard"
      aria-label={label ?? lines.join(" ")}
      onClick={() => {
        if (href) {
          router.push(href);
          return;
        }
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.log("[PromoCarousel] tap →", lines.join(" "));
        }
      }}
      className="relative shrink-0 snap-start h-[205px] overflow-hidden rounded-[12px] bg-[#0a2ecb] text-left active:scale-[0.99] transition-transform"
      style={{ width: "calc(100% - 16px)" }}
    >
      {/* Right-side illustration (per variant) */}
      <Illustration variant={variant} />

      {/* Curtain — darkens the left so the copy stays legible over any
          artwork; fades to transparent before the right-side art. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0) 66%)",
        }}
      />

      {/* Content */}
      <div className="absolute left-0 right-0 top-0 flex flex-col items-start gap-[8px] p-[16px]">
        <span
          data-component="Typography"
          className="text-[12px] font-extrabold uppercase leading-[1.6] text-[#9dabea]"
          style={{ letterSpacing: "0.2px" }}
        >
          {eyebrow}
        </span>
        <h3
          data-component="Typography"
          className="font-extrabold text-white"
          style={{
            fontSize: 26,
            lineHeight: 1.12,
            letterSpacing: "-0.325px",
            textShadow: "4px 0px 12px rgba(0,0,0,0.44)",
            maxWidth: textMaxW,
          }}
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h3>
        <span data-component="Button" className="mt-[2px] inline-flex h-[32px] items-center justify-center rounded-[8px] bg-white px-[14px] text-[14px] font-extrabold text-[#0a2ecb]">
          {cta}
        </span>
      </div>

      {/* Promo belt — blurred dark strip with the T&Cs caveat. */}
      <div
        className="absolute bottom-0 left-0 right-0 flex h-[48px] items-center px-[16px]"
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      >
        <p
          data-component="Typography"
          className="text-[10px] font-medium leading-[1.6] text-[#9dabea]"
          style={{
            letterSpacing: "0.2px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {caveat ?? CAVEAT}
          <span className="underline">Full T&amp;Cs.</span>
        </p>
      </div>
    </button>
  );
}

/* Per-variant right-side artwork. All images are decorative + clipped
   by the card's `overflow-hidden`. */
function Illustration({ variant }: { variant: PromoVariant }) {
  switch (variant) {
    case "qplus":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/assets/promo/qplus.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{ top: 38, right: 2, width: 148, height: "auto", maxWidth: "none" }}
        />
      );
    case "q":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/assets/promo/q.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute -top-[54px] -right-[40px] h-[235px] w-auto rotate-12 select-none"
        />
      );
    case "meatballs":
      return (
        <>
          {/* Flame — flattened export, positioned per Figma 29106:5527
              (relative to the card: top -19, right -89, 170×385). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/promo/flame.svg"
            alt=""
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              top: -19,
              right: -89,
              width: 170,
              height: 385,
              maxWidth: "none",
            }}
          />
          {/* Meatballs game thumbnail — top-right of the content row. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/promo/meatballs.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute right-[16px] top-[16px] size-[64px] select-none rounded-[10px] border-[2.37px] border-white object-cover"
          />
        </>
      );
    case "person":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/assets/promo/person.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute right-0 top-0 h-full w-[195px] select-none object-cover object-left"
        />
      );
    case "giveaway":
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/promo/gift.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute -right-[10px] bottom-0 h-[120px] w-auto select-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/promo/thumb-giveaway.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute right-[16px] top-[16px] size-[64px] select-none rounded-[12px] border-[3px] border-white object-cover"
            style={{ boxShadow: "0px 8px 12px 0px rgba(204,205,208,0.6)" }}
          />
        </>
      );
  }
}
