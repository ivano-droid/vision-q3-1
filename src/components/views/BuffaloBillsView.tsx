"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useShell } from "@/lib/filter-context";

/**
 * Buffalo Bills game page — Figma 1485:95206.
 *
 * Two-band layout:
 *
 *   ┌──────────────────────────────────────┐  ← #101626 dark navy
 *   │  ←                       £113.59 ▢   │  ← In-game header
 *   │  ┌────────────────────────────────┐  │
 *   │  │  [Buffalo Bills slot artwork]  │  │  ← Sticky hero (630px)
 *   │  │            ▶ (yellow)          │  │
 *   │  └────────────────────────────────┘  │
 *   ├──────────────────────────────────────┤
 *   │  ┌────────────────────────────────┐  │
 *   │  │ Game info                  MrQ │  │
 *   │  │ ──────────────────────────     │  │
 *   │  │ Medium │ 94% │ 5,000x          │  │
 *   │  │ Volatility│RTP│Max win          │  │
 *   │  │ ──────────                     │  │
 *   │  │ Category           Slot        │  │  ← Game info card (#8c5141)
 *   │  │ Theme              Animal      │  │
 *   │  │ Provider           Goosicorn   │  │
 *   │  │ Similar games  ▢ ▢ ▢ ▢ ▢...   │  │
 *   │  └────────────────────────────────┘  │
 *   │  ┌────────────────────────────────┐  │
 *   │  │ How to play                    │  │  ← Translucent brown card
 *   │  │ Choose your bet, tap spin...   │  │
 *   │  └────────────────────────────────┘  │
 *   └──────────────────────────────────────┘
 *
 * Two animation patterns work together:
 *
 *   1. The hero is `position: sticky; top: 0` so it stays anchored
 *      at the top of the viewport as the user scrolls. The game-info
 *      and how-to-play cards live below in normal flow and naturally
 *      slide up over the hero as the user scrolls down — satisfying
 *      the brief's "on scroll it appears up over the game".
 *
 *   2. On page load, the game-info section starts translated all the
 *      way below the viewport (`y: 100%`) and springs into its resting
 *      position. That's the "sneaks up from the bottom" entrance —
 *      the user lands on the hero artwork first, then the lower band
 *      animates up to invite them to scroll for more.
 *
 * AppShell hides BrandBar + BottomNav on /play/* and sets the
 * mobile-frame surface to #101626 so the page reads edge-to-edge.
 */

// ── Tokens ─────────────────────────────────────────────────────────
const PAGE_BG = "#101626";
const GAME_INFO_BG = "#8c5141"; // warm brown card
const HOW_TO_PLAY_BG = "rgba(140, 81, 65, 0.44)"; // softer translucent
const PLAY_YELLOW = "#FFBD29";

// "Similar games" tiles — re-uses existing slot-NN art for now, same
// pool the home feed pulls from so the prototype reads consistently.
const SIMILAR_GAMES = [
  { src: "/assets/games/slot-01.png", alt: "Buffalo Bills" },
  { src: "/assets/games/slot-04.png", alt: "Jewel Stepper" },
  { src: "/assets/games/slot-13.png", alt: "Snake Arena" },
  { src: "/assets/games/slot-08.png", alt: "Tiki Tumble" },
  { src: "/assets/games/slot-11.png", alt: "Maze Escape" },
  { src: "/assets/games/slot-07.png", alt: "Mummy Mania" },
  { src: "/assets/games/slot-03.png", alt: "Big Bass Splash" },
  { src: "/assets/games/slot-12.png", alt: "Western Gold" },
];

export function BuffaloBillsView() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative w-full"
      style={{ backgroundColor: PAGE_BG, minHeight: "100dvh" }}
    >
      {/* ── In-game header ────────────────────────────────────────
         Floats over the top of the hero. Translucent backdrop
         carries the warm orange glow from the artwork below
         through the safe-area gap. */}
      <GameHeader />

      {/* ── Sticky hero ───────────────────────────────────────────
         Stays anchored at the top of the viewport as the user
         scrolls. The cards below scroll up over it. */}
      <Hero />

      {/* ── Game info section ─────────────────────────────────────
         Springs up from below the viewport on mount, then sits in
         normal flow so scrolling moves it up over the sticky hero. */}
      <motion.div
        className="relative flex flex-col items-stretch px-[16px] py-[24px]"
        style={{
          backgroundColor: PAGE_BG,
          gap: 24,
          // Sits above the sticky hero so it paints on top as the
          // user scrolls the page upward over it.
          zIndex: 10,
        }}
        initial={reduce ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          reduce
            ? { duration: 0.2 }
            : {
                type: "spring",
                stiffness: 110,
                damping: 22,
                mass: 1,
                delay: 0.15,
              }
        }
      >
        <GameInfoCard />
        <HowToPlayCard />
      </motion.div>
    </div>
  );
}

/* ============================================================
   In-game header — back button + balance pill
   ============================================================ */
function GameHeader() {
  const { openSideNav, openDeposit } = useShell();

  return (
    <header
      className="absolute inset-x-0 top-0 z-20 flex items-center justify-between"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 12px)",
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        // Gentle warm gradient softens the chrome onto the slot art.
        background:
          "linear-gradient(to bottom, rgba(225, 140, 88, 0.32) 0%, rgba(225, 140, 88, 0) 100%)",
      }}
    >
      {/* Back to lobby */}
      <Link
        href="/"
        aria-label="Exit game"
        className="grid place-items-center rounded-full active:scale-[0.94] transition-transform"
        style={{
          width: 40,
          height: 40,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <ExitIcon />
      </Link>

      {/* Balance + avatar pill — mirrors the BrandBar pill so the user
          stays oriented inside the global UI. */}
      <div
        className="flex items-center rounded-full"
        style={{
          height: 40,
          paddingLeft: 16,
          paddingRight: 4,
          gap: 8,
          backgroundColor: "rgba(255, 255, 255, 0.32)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <button
          type="button"
          onClick={openDeposit}
          aria-label="Make a deposit"
          className="text-white text-[16px] leading-none font-extrabold pt-[1px] active:scale-[0.95] transition-transform"
        >
          £113.59
        </button>
        <span
          className="h-[20px] w-px"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
          aria-hidden
        />
        <button
          type="button"
          onClick={openSideNav}
          aria-label="Open account menu"
          className="relative size-[32px] rounded-full overflow-hidden bg-white shrink-0 active:scale-[0.95] transition-transform"
          style={{
            border: "1.78px solid rgba(10, 46, 203, 1)",
            boxShadow: "3.56px 3.56px 7.11px 0 rgba(10, 46, 203, 0.24)",
          }}
        >
          <Image
            src="/assets/avatar.png"
            alt=""
            fill
            sizes="32px"
            className="object-cover"
            priority
          />
        </button>
      </div>
    </header>
  );
}

/* ============================================================
   Hero — full-bleed slot artwork + yellow play button
   ============================================================ */
function Hero() {
  return (
    <div
      className="sticky top-0 w-full overflow-hidden"
      style={{
        // 630px in the Figma frame (375 wide × 812 tall). Aspect-ratio
        // hugs that target ratio so the hero fills the same proportion
        // on any frame size, including the 375-column desktop view.
        aspectRatio: "375 / 630",
        backgroundColor: PAGE_BG,
      }}
      aria-label="Buffalo Bills — Big Hunt"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/games/buffalo-bills-hero.png"
        alt=""
        className="absolute inset-0 size-full object-cover object-top pointer-events-none select-none"
        draggable={false}
      />

      {/* Yellow circular Play button — sits ~80% down the hero on
          the design. Real action would launch the slot. */}
      <button
        type="button"
        aria-label="Play Buffalo Bills"
        className="absolute left-1/2 -translate-x-1/2 grid place-items-center rounded-full active:scale-[0.94] transition-transform"
        style={{
          width: 72,
          height: 72,
          bottom: "10%",
          backgroundColor: PLAY_YELLOW,
          boxShadow:
            "0 12px 32px -8px rgba(0, 0, 0, 0.42), 0 4px 12px -4px rgba(255, 189, 41, 0.4)",
        }}
      >
        <PlayTriangle />
      </button>
    </div>
  );
}

/* ============================================================
   Game info card — stats pill + detail rows + similar games
   ============================================================ */
function GameInfoCard() {
  return (
    <section
      className="overflow-hidden rounded-[16px] w-full"
      style={{ backgroundColor: GAME_INFO_BG }}
    >
      {/* Header row — "Game info" + MrQ wordmark on the right */}
      <div className="flex items-center justify-between px-[24px] py-[14px]">
        <h2
          className="text-white text-[16px] font-extrabold leading-none"
        >
          Game info
        </h2>
        {/* MrQ wordmark — small white version sized to match Figma */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo-mrq.svg"
          alt="MrQ"
          className="h-[16px] w-auto opacity-95"
          draggable={false}
        />
      </div>

      {/* Stats pill — Volatility / RTP / Max win, three even segments
          separated by hairline white dividers. */}
      <div className="px-[16px]">
        <div
          className="flex items-center justify-center rounded-full h-[60px] px-[16px]"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.24)",
            gap: 8,
          }}
        >
          <StatCell label="Volatility" value="Medium" />
          <Divider />
          <StatCell label="RTP" value="94%" />
          <Divider />
          <StatCell label="Max win" value="5,000x" />
        </div>
      </div>

      {/* Detail rows */}
      <div className="flex flex-col px-[16px] gap-[10px] py-[24px]">
        <DetailRow label="Category" value="Slot" />
        <DetailRow label="Theme" value="Animal" />
        <DetailRow label="Provider" value="Goosicorn" last />
      </div>

      {/* Similar games — horizontal scroll. Section uses the same
          paddingLeft pattern as the Arena/Rewards rails so the
          first tile lands flush against the 16px page gutter. */}
      <section style={{ paddingLeft: 16, paddingBottom: 24 }}>
        <h3
          className="text-white text-[16px] font-bold leading-tight"
          style={{ paddingRight: 16, paddingBottom: 12, letterSpacing: 0.1 }}
        >
          Similar games
        </h3>
        <div
          className="no-scrollbar"
          style={{
            overflowX: "auto",
            scrollSnapType: "x mandatory",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              paddingRight: 16,
            }}
          >
            {SIMILAR_GAMES.map((tile, i) => (
              <div
                key={i}
                className="relative shrink-0 overflow-hidden rounded-[12px]"
                style={{
                  width: 109,
                  height: 109,
                  scrollSnapAlign: "start",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  alt={tile.alt}
                  className="absolute inset-0 size-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-white">
      <span className="text-[16px] font-extrabold leading-[16px]">{value}</span>
      <span
        className="text-[12px] font-medium leading-[16px]"
        style={{ marginTop: 2 }}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="h-[20px] w-px shrink-0"
      style={{ backgroundColor: "#d9d9d9" }}
    />
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-[4px]"
      style={
        last
          ? undefined
          : { borderBottom: "1px solid rgba(255, 255, 255, 0.4)" }
      }
    >
      <span
        className="text-[16px] font-medium leading-[1.6]"
        style={{ color: "rgba(255, 255, 255, 0.6)" }}
      >
        {label}
      </span>
      <span className="text-[16px] font-medium leading-[1.6] text-white">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   How to play — softer translucent card with copy
   ============================================================ */
function HowToPlayCard() {
  return (
    <section
      className="overflow-hidden rounded-[16px] w-full"
      style={{ backgroundColor: HOW_TO_PLAY_BG }}
    >
      <div className="flex flex-col px-[16px] pt-[12px] pb-[24px]">
        <h2
          className="text-white text-[16px] font-bold leading-tight"
          style={{ letterSpacing: 0.1, paddingTop: 12, paddingBottom: 12 }}
        >
          How to play
        </h2>
        <p
          className="text-[16px] font-medium leading-[1.6]"
          style={{ color: "rgba(255, 255, 255, 0.6)" }}
        >
          Choose your bet, tap spin, and match symbols across the reels
          to win. Special symbols can trigger bonus features, free
          spins, or extra prizes. Check the full rules for paylines,
          payouts, and feature details.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Icons
   ============================================================ */
function ExitIcon() {
  // Door / exit glyph — matches the back-button feel of the Figma
  // chevron without being a literal chevron (the spec used a custom
  // exit icon, this is the closest stock equivalent).
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      <path d="M12 4h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" />
      <path d="M9 7l-3 3 3 3" />
      <path d="M6 10h8" />
    </svg>
  );
}

function PlayTriangle() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="#0c0c0c"
      aria-hidden
      focusable={false}
    >
      <path d="M7 4.5v17l14-8.5L7 4.5Z" />
    </svg>
  );
}
