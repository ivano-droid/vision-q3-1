"use client";

/**
 * Arena view — MrQ's player-vs-player feature.
 *
 * Modelled on the vibe of the "U vs Q" and "Join the Arena with 200K+
 * players" promo cards in the home hero. The headline banner introduces
 * the concept; below it sit a few sample head-to-head matchups so the
 * filter has real content instead of an empty state.
 *
 * Built in code (no PNG cards) so the matchups can be swapped, restyled
 * or wired to live data later without re-exporting from Figma.
 */
type Matchup = {
  opponent: string;
  game: string;
  stake: string;
  players: number;
  status: "live" | "starting" | "open";
};

const MATCHUPS: Matchup[] = [
  {
    opponent: "Spicy Meatballs Megaways",
    game: "Slots",
    stake: "£5",
    players: 218,
    status: "live",
  },
  {
    opponent: "Snake Arena Showdown",
    game: "Slots",
    stake: "£2",
    players: 92,
    status: "starting",
  },
  {
    opponent: "Golden Catch Cup",
    game: "Slots",
    stake: "£1",
    players: 47,
    status: "open",
  },
  {
    opponent: "Western Gold Duel",
    game: "Slots",
    stake: "£10",
    players: 14,
    status: "open",
  },
];

// Brand pink for Arena — matches the pill accent.
const ARENA_PINK = "#e0007a";

export function ArenaView() {
  return (
    <div className="px-[16px] pt-[16px] flex flex-col gap-[14px]">
      {/* Headline banner */}
      <div
        className="relative overflow-hidden rounded-[18px] px-[20px] py-[22px]"
        style={{
          background: `linear-gradient(135deg, ${ARENA_PINK} 0%, #ff4fb5 100%)`,
          boxShadow: "0 10px 24px -10px rgba(224, 0, 122, 0.4)",
        }}
      >
        <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-white/80">
          MrQ Arena
        </p>
        <h2
          className="mt-[6px] text-white"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "32px",
            lineHeight: 0.95,
            letterSpacing: "0.5px",
            textShadow: "3px 3px 0 rgba(0, 0, 0, 0.18)",
          }}
        >
          U VS Q —<br />HEAD&nbsp;TO&nbsp;HEAD
        </h2>
        <p className="mt-[10px] text-[14px] font-bold text-white/90">
          Take on 200K+ players in live tournaments. Win cash. Climb the
          board.
        </p>
      </div>

      {/* Section heading */}
      <div className="flex items-center justify-between pt-[4px]">
        <h3 className="text-[18px] font-extrabold text-[var(--mrq-blue)]">
          Live tournaments
        </h3>
        <button
          type="button"
          className="text-[14px] font-extrabold text-[var(--mrq-blue)]"
        >
          See all
        </button>
      </div>

      {/* Matchups */}
      <div className="flex flex-col gap-[10px]">
        {MATCHUPS.map((m, i) => (
          <MatchupCard key={`${m.opponent}-${i}`} matchup={m} />
        ))}
      </div>
    </div>
  );
}

function MatchupCard({ matchup }: { matchup: Matchup }) {
  const statusLabel =
    matchup.status === "live"
      ? "Live"
      : matchup.status === "starting"
        ? "Starting soon"
        : "Open";
  const statusColor =
    matchup.status === "live"
      ? "#d50000"
      : matchup.status === "starting"
        ? "#ffb800"
        : ARENA_PINK;

  return (
    <button
      type="button"
      className="flex items-center gap-[14px] rounded-[14px] bg-white px-[14px] py-[12px] text-left active:scale-[0.99] transition-transform"
      style={{
        border: "1px solid #e6e6e7",
        boxShadow: "0 4px 10px -6px rgba(10, 46, 203, 0.15)",
      }}
    >
      {/* Versus emblem — mirrors the Arena pill icon */}
      <div
        className="grid size-[44px] shrink-0 place-items-center rounded-full"
        style={{ background: `${ARENA_PINK}14` /* 8% tint */ }}
      >
        <VsIcon style={{ color: ARENA_PINK }} />
      </div>

      {/* Title block */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-extrabold text-[var(--mrq-blue-dark)]">
          {matchup.opponent}
        </p>
        <p className="mt-[2px] text-[12px] font-bold text-[var(--mrq-blue-dark)] opacity-60">
          {matchup.game} · {matchup.players} playing
        </p>
      </div>

      {/* Stake + status */}
      <div className="flex flex-col items-end gap-[4px] shrink-0">
        <span className="text-[15px] font-extrabold text-[var(--mrq-blue-dark)]">
          {matchup.stake}
        </span>
        <span
          className="text-[10px] font-extrabold uppercase leading-none rounded-full px-[7px] py-[3px]"
          style={{
            color: statusColor,
            backgroundColor: `${statusColor}1a`,
            letterSpacing: "0.04em",
          }}
        >
          {statusLabel}
        </span>
      </div>
    </button>
  );
}

function VsIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 18 14"
      width="18"
      height="14"
      fill="currentColor"
      style={style}
      aria-hidden
    >
      <path d="M1.5 1.5 L4 1.5 L9 7 L4 12.5 L1.5 12.5 L6.5 7 Z" />
      <path d="M16.5 1.5 L14 1.5 L9 7 L14 12.5 L16.5 12.5 L11.5 7 Z" />
    </svg>
  );
}
