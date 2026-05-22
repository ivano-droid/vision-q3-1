"use client";

/**
 * Bingo view — modelled on vision-01.vercel.app's Bingo screen.
 *
 * Layout: a vertical stack of 5 wide banner cards. Each card has:
 *   - A colourful background tied to the room theme
 *   - A chunky white headline (with an outline drop-shadow for pop)
 *   - Decorative emoji-style accents in the left + right corners
 *   - A stats footer: timer · stake · pot
 *
 * Built in code (no per-card PNG) so each banner is interactive — tap-to-enter
 * a room, swap themes, change copy, etc. without re-exporting from Figma.
 */

type BingoRoom = {
  title: string;
  /** Background gradient or solid */
  bg: string;
  /** Subtitle / theme accents on either side */
  leftAccent: string;
  rightAccent: string;
  /** Number of players currently in the room */
  players: number;
  /** Ball count badge (e.g. 30 / 90) */
  balls: number;
  /** Time until next game */
  timer: string;
  /** Ticket price */
  stake: string;
  /** Current jackpot */
  pot: string;
  /** Title accent colour (the dropshadow / outline behind the title) */
  titleShadow: string;
};

const ROOMS: BingoRoom[] = [
  {
    title: "TROPIC LIKE IT'S HOT",
    bg: "linear-gradient(135deg, #38b6ff 0%, #58c4ff 100%)",
    leftAccent: "💎",
    rightAccent: "🌴",
    players: 35,
    balls: 30,
    timer: "03:10:29",
    stake: "10P",
    pot: "£74.66",
    titleShadow: "#ffd400",
  },
  {
    title: "PINCH A PENNY",
    bg: "linear-gradient(135deg, #ffd400 0%, #ffc000 100%)",
    leftAccent: "🪙",
    rightAccent: "💰",
    players: 2,
    balls: 90,
    timer: "00:29",
    stake: "1P",
    pot: "£10.62",
    titleShadow: "#ff4fb5",
  },
  {
    title: "DAB & DISCO",
    bg: "linear-gradient(135deg, #34c759 0%, #2faf4c 100%)",
    leftAccent: "🕺",
    rightAccent: "👑",
    players: 3,
    balls: 90,
    timer: "00:29",
    stake: "20P",
    pot: "£7.34",
    titleShadow: "#ff4fb5",
  },
  {
    title: "CHEAP AS CHIPS",
    bg: "linear-gradient(135deg, #ff4fb5 0%, #ff7ad0 100%)",
    leftAccent: "🎟️",
    rightAccent: "🎲",
    players: 29,
    balls: 90,
    timer: "04:10:29",
    stake: "10P",
    pot: "£98.88",
    titleShadow: "#ffd400",
  },
  {
    title: "ON THE HOUSE",
    bg: "linear-gradient(135deg, #1d2b6e 0%, #29408a 100%)",
    leftAccent: "🔒",
    rightAccent: "🍀",
    players: 0,
    balls: 75,
    timer: "00:29",
    stake: "FREE",
    pot: "£1",
    titleShadow: "#ffd400",
  },
];

export function BingoView() {
  return (
    <div className="px-[16px] pt-[16px] flex flex-col gap-[14px]">
      {ROOMS.map((room, i) => (
        <BingoBanner key={`${room.title}-${i}`} room={room} />
      ))}
    </div>
  );
}

function BingoBanner({ room }: { room: BingoRoom }) {
  return (
    <button
      type="button"
      className="relative w-full overflow-hidden rounded-[18px] text-left active:scale-[0.99] transition-transform"
      style={{ boxShadow: "0 8px 20px -8px rgba(10, 46, 203, 0.25)" }}
    >
      {/* Coloured top section with title + accents */}
      <div
        className="relative h-[120px] flex items-center justify-center"
        style={{ background: room.bg }}
      >
        {/* Decorative accents in the corners */}
        <span className="absolute left-[14px] top-[14px] text-[28px] leading-none" aria-hidden>
          {room.leftAccent}
        </span>
        <span className="absolute right-[14px] bottom-[14px] text-[36px] leading-none" aria-hidden>
          {room.rightAccent}
        </span>

        {/* Player count chip (top-left, in front of left accent) */}
        <div
          className="absolute top-[12px] left-[12px] flex items-center gap-[4px] rounded-full bg-white px-[8px] py-[3px]"
          style={{ boxShadow: "0 2px 6px rgba(10, 46, 203, 0.18)" }}
        >
          <PersonIcon className="size-[12px] text-[var(--mrq-blue-dark)]" />
          <span className="text-[12px] font-extrabold text-[var(--mrq-blue-dark)] leading-none">
            {room.players}
          </span>
        </div>

        {/* Balls badge (top-right) */}
        <div
          className="absolute top-[10px] right-[10px] grid place-items-center size-[36px] rounded-full bg-white text-[var(--mrq-blue-dark)] text-[13px] font-extrabold"
          style={{ boxShadow: "0 2px 6px rgba(10, 46, 203, 0.18)" }}
        >
          {room.balls}
        </div>

        {/* Title with stroked shadow effect */}
        <h3
          className="relative z-10 text-center text-white whitespace-pre-line"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "30px",
            lineHeight: 0.92,
            letterSpacing: "0.5px",
            textShadow: `3px 3px 0 ${room.titleShadow}, 4px 4px 0 rgba(0,0,0,0.25)`,
          }}
        >
          {wrapTitle(room.title)}
        </h3>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between bg-white px-[16px] py-[10px]">
        <Stat icon={<ClockIcon className="size-[14px]" />} label={room.timer} />
        <Stat icon={<TicketIcon className="size-[14px]" />} label={room.stake} />
        <Stat icon={<CoinIcon className="size-[14px] text-[#ffb800]" />} label={room.pot} />
      </div>
    </button>
  );
}

/** Split long titles into two lines around the middle space. */
function wrapTitle(title: string) {
  if (title.length < 14) return title;
  const mid = Math.floor(title.length / 2);
  // find nearest space to mid
  const left = title.lastIndexOf(" ", mid);
  const right = title.indexOf(" ", mid);
  const splitAt = right === -1 || (left !== -1 && mid - left < right - mid) ? left : right;
  if (splitAt === -1) return title;
  return title.slice(0, splitAt) + "\n" + title.slice(splitAt + 1);
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <span className="text-[var(--mrq-blue-dark)]">{icon}</span>
      <span className="text-[13px] font-extrabold text-[var(--mrq-blue-dark)] leading-none">{label}</span>
    </div>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className} aria-hidden>
      <circle cx="6" cy="3.5" r="2" />
      <path d="M1.5 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4v.5h-9V11Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 4v3.5l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className={className} aria-hidden>
      <path d="M1.5 4.5A1 1 0 0 1 2.5 3.5h9A1 1 0 0 1 12.5 4.5V6a1 1 0 0 0 0 2v1.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8a1 1 0 0 0 0-2V4.5Z" />
    </svg>
  );
}

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className={className} aria-hidden>
      <circle cx="7" cy="7" r="6" />
      <text x="7" y="9.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fff" fontFamily="var(--font-display)">£</text>
    </svg>
  );
}
