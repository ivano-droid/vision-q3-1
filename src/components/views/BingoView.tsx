"use client";

import { BINGO_ROOMS, type BingoRoom } from "@/lib/bingo-rooms";

/**
 * Bingo homepage — mirrors the Casino page chrome so the user gets a
 * familiar landing pattern across verticals.
 *
 *   ┌──────────────────────────────────────┐
 *   │  ←                          £113.59 ▢│  ← BrandBar (back arrow)
 *   ├──────────────────────────────────────┤
 *   │  Bingo                                │  ← Title only
 *   ├──────────────────────────────────────┤
 *   │  All rooms                            │
 *   │  ┌────────────────────────────────┐  │
 *   │  │ ☆35   [artwork]            30  │  │
 *   │  │                                │  │  ← Lobby-style room cards:
 *   │  │  ⏱ 02:55:25  🏷 10P  👑 £74.66 │  │    big artwork + 3-cell
 *   │  └────────────────────────────────┘  │    info strip below
 *   │  ... (5 rooms)                        │
 *   └──────────────────────────────────────┘
 *
 * The room cards mirror MrQ's bingo lobby tile language: each room's
 * lobby PNG carries the branded title art, with a white player-count
 * pill overlaid top-left, a pink/magenta ball-count badge top-right,
 * and a 3-cell info strip (clock + countdown, tag + ticket, crown +
 * jackpot) underneath.
 *
 * Previously this view had a "featured" hero card at the top
 * (Tropic Like It's Hot) — dropped because it duplicated the first
 * tile of the All Rooms list with no extra information.
 */
export function BingoView() {
  return (
    <>
      {/* In-page header — title only. No CTA pill on bingo since the
          page is single-surface (rooms list lives right below). */}
      <div className="px-[16px] pt-[16px] pb-[18px]">
        <h1 className="text-[28px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
          Bingo
        </h1>
      </div>

      {/* Rooms list — no section header, the "Bingo" h1 above is the
          only label the page needs. */}
      <section className="px-[16px] pt-[4px] pb-[24px]">
        <div className="flex flex-col gap-[12px]">
          {BINGO_ROOMS.map((room) => (
            <RoomCard key={room.key} room={room} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ============================================================
   Room list card — lobby tile pattern with artwork + info strip.
   ============================================================ */
function RoomCard({ room }: { room: BingoRoom }) {
  return (
    <button
      type="button"
      aria-label={`Join ${room.name}`}
      className="relative w-full overflow-hidden rounded-[18px] bg-white active:scale-[0.99] transition-transform text-left"
      style={{
        boxShadow:
          "0 8px 20px -10px rgba(10, 46, 203, 0.22), 0 2px 6px -2px rgba(10, 46, 203, 0.10)",
      }}
    >
      {/* ── Top section: artwork + badges ─────────────────────────
         Same lobby PNG used on the Explore mega-card preview. The
         room name is baked into the artwork, so the card chrome
         just needs to layer the badges and info strip around it. */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "343 / 175" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={room.image}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        />

        {/* Player count — white pill top-left. */}
        <div
          className="absolute top-[12px] left-[12px] flex items-center rounded-[10px] bg-white"
          style={{
            height: 28,
            paddingLeft: 8,
            paddingRight: 10,
            gap: 4,
            boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <PersonIcon className="size-[14px] text-[var(--mrq-blue-dark)]" />
          <span className="text-[13px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
            {room.players}
          </span>
        </div>

        {/* Ball count — circular pink/magenta badge top-right. */}
        <div
          className="absolute top-[10px] right-[10px] grid place-items-center rounded-full bg-white"
          style={{
            width: 36,
            height: 36,
            // Pink/magenta ring around the white centre — Figma's
            // bingo-ball badge styling.
            border: "3px solid #E83E8C",
            boxShadow:
              "0 2px 8px -2px rgba(232, 62, 140, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
          }}
        >
          <span className="text-[13px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
            {room.ballCount}
          </span>
        </div>
      </div>

      {/* ── Bottom strip: 3 cells with icons + values ─────────────
         Clock + countdown / tag + ticket / crown + jackpot.
         Equal-width cells split by hairline dividers. */}
      <div
        className="flex items-center"
        style={{
          height: 56,
          paddingLeft: 14,
          paddingRight: 14,
        }}
      >
        <InfoCell
          icon={<ClockBubbleIcon />}
          value={room.nextGameTime}
        />
        <VDivider />
        <InfoCell
          icon={<TagBubbleIcon />}
          value={room.ticketPrice}
        />
        <VDivider />
        <InfoCell
          icon={<CrownBubbleIcon />}
          value={room.jackpot}
        />
      </div>
    </button>
  );
}

function InfoCell({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-start gap-[8px] min-w-0 px-[6px]">
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-[14px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
        {value}
      </span>
    </div>
  );
}

function VDivider() {
  return (
    <span
      aria-hidden
      className="h-[24px] w-px shrink-0"
      style={{ backgroundColor: "rgba(10, 46, 203, 0.12)" }}
    />
  );
}

/* ============================================================
   Icons — small inline SVGs.
   The "bubble" variants are filled circles holding a glyph, used
   in the info strip. Matches MrQ's branded round-icon style.
   ============================================================ */
function ClockBubbleIcon() {
  return (
    <span
      className="grid place-items-center rounded-full text-white"
      style={{
        width: 26,
        height: 26,
        backgroundColor: "var(--mrq-blue)",
      }}
      aria-hidden
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7" cy="7" r="5.5" />
        <path d="M7 4v3l2 1.4" />
      </svg>
    </span>
  );
}

function TagBubbleIcon() {
  return (
    <span
      className="grid place-items-center rounded-full text-white"
      style={{
        width: 26,
        height: 26,
        backgroundColor: "var(--mrq-blue)",
      }}
      aria-hidden
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 6.5V2.5a.5.5 0 0 1 .5-.5h4l5.5 5.5-4.5 4.5L2 6.5Z" />
        <circle cx="5" cy="5" r="0.9" fill="currentColor" />
      </svg>
    </span>
  );
}

function CrownBubbleIcon() {
  return (
    <span
      className="grid place-items-center rounded-full"
      style={{
        width: 26,
        height: 26,
        // Yellow crown bubble — pops jackpot as the prize signal.
        backgroundColor: "#FFBD29",
      }}
      aria-hidden
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="var(--mrq-blue-dark)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 10.5h10M2 4.5l2.5 2L7 2.5l2.5 4 2.5-2v6H2v-4Z" fill="var(--mrq-blue-dark)" />
      </svg>
    </span>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <circle cx="7" cy="4.5" r="2.2" />
      <path d="M2.5 12c0-2.2 2-3.8 4.5-3.8s4.5 1.6 4.5 3.8H2.5Z" />
    </svg>
  );
}
