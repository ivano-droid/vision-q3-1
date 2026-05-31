"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useFilter } from "@/lib/filter-context";

/**
 * SideNav drawer — slides in from the right when the user taps the
 * balance/avatar pill. Modelled on vision-01.vercel.app's profile drawer.
 *
 * Contents:
 *   • Top: avatar + name + Withdraw / Deposit buttons
 *   • Group 1: Profile / Wallet / Transaction history / Safer gambling
 *   • Q+ CTA: standalone solid-blue tile routing to /passes
 *   • Group 2: Get 50 free spins! (promo) / Privacy Policy / Terms & conditions
 *     / Help & FAQs
 *   • Footer: Log out
 *
 * Behaviour:
 *   • Slides in/out with a spring (right → 0).
 *   • Backdrop dims the lobby underneath; tap-outside or Esc to close.
 *   • Locks body scroll while open (prevents the page underneath from
 *     scrolling when the drawer is scrolled past its content).
 *   • Sits within the 375px mobile frame on desktop (constrained by the
 *     fixed positioning + max-width).
 */
export function SideNav() {
  const { sideNavOpen, closeSideNav } = useFilter();

  // Lock document scroll while the drawer is open.
  useEffect(() => {
    if (!sideNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sideNavOpen]);

  // Close on Esc
  useEffect(() => {
    if (!sideNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSideNav();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sideNavOpen, closeSideNav]);

  return (
    <AnimatePresence>
      {sideNavOpen && (
        // Fixed clip container clamped to the mobile-frame's column
        // (via --frame-right-offset). On desktop this means the
        // backdrop + drawer are masked to the centred 375px column
        // instead of spanning the whole monitor — without this, the
        // drawer's slide-in/out was visible in the empty space to
        // the right of the mobile-frame in the desktop preview.
        // pointer-events:none on the wrapper so the empty area
        // outside the clip doesn't intercept taps; the backdrop
        // and drawer re-enable pointer events on themselves.
        <div
          className="fixed inset-y-0 z-50 overflow-hidden pointer-events-none"
          style={{
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
          }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={closeSideNav}
            className="absolute inset-0 bg-black/30 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Drawer — now absolute inside the fixed clip container,
              so its exit `x: 100%` slide is masked at the
              mobile-frame's right edge instead of escaping into the
              desktop preview surround. */}
          <motion.aside
            role="dialog"
            aria-label="Account menu"
            className="absolute right-0 top-0 h-full overflow-y-auto pointer-events-auto"
            style={{
              width: "85%",
              maxWidth: "320px",
              backgroundColor: "#f2f3f3",
              boxShadow: "-12px 0 32px -8px rgba(10, 46, 203, 0.25)",
              paddingTop: "max(20px, env(safe-area-inset-top))",
              paddingBottom: "max(20px, env(safe-area-inset-bottom))",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 38, mass: 0.9 }}
          >
            <DrawerContent onClose={closeSideNav} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { openDeposit } = useFilter();

  // Tap the Q+ tile → navigate to /passes (where the weekly-pass
  // landing lives, already wired from the home hero carousel) and
  // close the drawer so the new page lands flush.
  const goToQPlus = () => {
    router.push("/passes");
    onClose();
  };

  // Deposit button → open the global DepositSheet (already wired
  // app-wide from the BrandBar's balance pill) then dismiss the
  // drawer so the sheet lands on a clean canvas instead of behind
  // the still-open side drawer.
  const goToDeposit = () => {
    onClose();
    openDeposit();
  };

  return (
    <div className="flex flex-col gap-[16px] px-[16px] py-[16px]">
      {/* Avatar (big) + identity stack on the right, painted directly
          on the drawer's #f2f3f3 surface — no wrapping card. Avatar
          sized so its diameter roughly matches the height of both
          CTAs stacked, which anchors the top of the drawer without
          needing a panel behind it. */}
      <header className="flex items-center gap-[16px]">
        <div className="relative size-[88px] shrink-0 rounded-full overflow-hidden bg-white">
          <Image
            src="/assets/avatar.png"
            alt=""
            fill
            sizes="88px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-[2px]">
          <p className="text-[22px] font-extrabold leading-tight text-[var(--mrq-blue-dark)] truncate">
            Leigh Taylor
          </p>
          {/* Static balance — must NOT animate on every drawer open
              (same bug class as the BrandBar wallet pre-fix: a
              CountUpAmount here would replay every time the drawer
              mounts, which is on every open). Static text stays in
              sync with the BrandBar's £113.48 resting value once
              that count-up has settled. */}
          <p className="text-[18px] font-bold leading-tight text-[var(--mrq-blue-dark)]">
            £113.48
          </p>
        </div>
      </header>

      {/* Withdraw / Deposit — taller + larger type than the menu
          rows below so they read as the drawer's primary actions.
          Withdraw on white-tinted neutral to lift it off the drawer
          surface; Deposit on brand blue as the primary. */}
      <div className="grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          className="flex items-center justify-center gap-[8px] h-[54px] rounded-[14px] bg-white text-[var(--mrq-blue-dark)] text-[17px] font-extrabold active:scale-[0.98] transition-transform"
          style={{ border: "1px solid #e6e6e7" }}
        >
          <MinusIcon className="size-[16px]" />
          Withdraw
        </button>
        <button
          type="button"
          onClick={goToDeposit}
          className="flex items-center justify-center gap-[8px] h-[54px] rounded-[14px] bg-mrq-blue text-white text-[17px] font-extrabold active:scale-[0.98] transition-transform"
        >
          <PlusIcon className="size-[16px]" />
          Deposit
        </button>
      </div>

      {/* Play Streak — Duolingo-style streak card. Header row
          (flame + count + label) over a 7-pip Mon–Sun day row
          showing which days in the current week have been hit.
          Prototype is static: a 4-day streak ending on Thursday
          (today). When the back-end's there we'd compute the
          `STREAK_DAYS` array from the player's session log.

          "Play Streak" rather than "Win Streak" — playing is what
          we want to celebrate, and the name keeps MrQ on the
          right side of its anti-Generic-Casino, RG-conscious tone
          (a flashing "Win Streak" badge in a casino app would be
          a flag for both regulators and players). */}
      <PlayStreakCard />

      {/* Group 1 */}
      <MenuGroup>
        <MenuItem icon={<UserIcon />} label="Profile" onClick={onClose} />
        <MenuItem icon={<WalletIcon />} label="Wallet" onClick={onClose} />
        <MenuItem icon={<HistoryIcon />} label="Transaction History" onClick={onClose} />
        <MenuItem icon={<HeartIcon />} label="Safer Gambling" onClick={onClose} />
      </MenuGroup>

      {/* Q+ — standalone solid-blue CTA sitting between the two
          MenuGroup blocks. Marks the weekly-pass upsell as a paid-
          tier promotion distinct from the regular account links;
          same height + padding as a MenuItem so it slots into the
          rhythm of the menu without breaking the column. */}
      <button
        type="button"
        onClick={goToQPlus}
        className="flex w-full items-center gap-[14px] px-[14px] py-[14px] rounded-[14px] bg-mrq-blue text-white text-left active:scale-[0.99] transition-transform"
      >
        <span className="shrink-0 size-[20px] grid place-items-center">
          <DiamondIcon />
        </span>
        <span className="text-[14px] font-extrabold">
          Get more with Q+ every week
        </span>
      </button>

      {/* Group 2 */}
      <MenuGroup>
        <MenuItem icon={<GiftIcon />} label="Get 50 free spins!" accent="#e0007a" onClick={onClose} />
        <MenuItem icon={<LockIcon />} label="Privacy Policy" onClick={onClose} />
        <MenuItem icon={<DocIcon />} label="Terms & Conditions" onClick={onClose} />
        <MenuItem icon={<QuestionIcon />} label="Help & FAQs" onClick={onClose} />
      </MenuGroup>

      <div className="flex-1" />

      {/* Footer: Log out */}
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-[8px] text-[14px] font-extrabold text-[var(--mrq-blue-dark)] px-[8px] py-[12px]"
      >
        <LogoutIcon className="size-[18px]" />
        Log out
      </button>

      {/* Dev affordance — wipes the hasLoggedIn flag and reloads so
          the next paint shows the WelcomeGate + LoginGate again.
          Kept here while the prototype is in flight; safe to ship
          since it only mutates localStorage on the current device. */}
      <button
        type="button"
        onClick={() => {
          if (typeof window === "undefined") return;
          localStorage.removeItem("hasLoggedIn");
          window.location.reload();
        }}
        className="flex items-center gap-[8px] text-[12px] font-bold px-[8px] py-[8px]"
        style={{ color: "rgba(10, 17, 32, 0.55)" }}
      >
        <RefreshIcon className="size-[14px]" />
        Reset onboarding (dev)
      </button>
    </div>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 10a7 7 0 1 0 2-5L3 7" />
      <path d="M3 3v4h4" />
    </svg>
  );
}

function MenuGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[14px] bg-white overflow-hidden"
      style={{ border: "1px solid #e6e6e7" }}
    >
      {children}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-[14px] px-[14px] py-[14px] text-left active:bg-[#f8f9fb] transition-colors"
      style={{
        color: accent ?? "var(--mrq-blue-dark)",
        borderBottom: "1px solid #f2f3f3",
      }}
    >
      <span className="shrink-0 size-[20px] grid place-items-center" style={{ color: accent ?? "var(--mrq-blue-dark)" }}>
        {icon}
      </span>
      {/* flex-1 pushes the chevron to the row's right edge while
          keeping the label hard against the icon on the left. */}
      <span className="flex-1 text-[14px] font-extrabold">{label}</span>
      {/* Right-pointing chevron — standard "tap to drill in"
          affordance on every menu row. Inherits the row's `color`
          so accent rows (e.g. the magenta "Get 50 free spins!")
          carry the chevron in the same hue as their icon + label,
          while regular rows fall back to brand navy. opacity 0.35
          so it reads as a hint, not a primary glyph. */}
      <span
        className="shrink-0 size-[16px] grid place-items-center"
        style={{ opacity: 0.35 }}
      >
        <ChevronRightIcon />
      </span>
    </button>
  );
}

/* ----------- Play Streak card ----------- */

// Prototype state — Mon–Sun for the current week with a 4-day
// streak ending Thursday (today). When the back-end's wired we'd
// derive `hit` from the player's session log keyed by day-of-week
// and `isToday` from the current weekday.
type StreakDay = { label: string; hit: boolean; isToday: boolean };
const STREAK_DAYS: StreakDay[] = [
  { label: "M", hit: true, isToday: false },
  { label: "T", hit: true, isToday: false },
  { label: "W", hit: true, isToday: false },
  { label: "T", hit: true, isToday: true },
  { label: "F", hit: false, isToday: false },
  { label: "S", hit: false, isToday: false },
  { label: "S", hit: false, isToday: false },
];

function PlayStreakCard() {
  return (
    <section
      className="rounded-[14px] bg-white px-[14px] py-[12px] flex flex-col gap-[10px]"
      style={{ border: "1px solid #e6e6e7" }}
    >
      {/* Header — single-line label. The hero fire illustration
          used to sit here but felt too heavy for a side-drawer
          card; the day pips below are the real visual story, so
          the header demotes to a tight one-line title. */}
      <p className="text-[15px] font-extrabold leading-tight text-[var(--mrq-blue-dark)]">
        4 day Play Streak
      </p>

      {/* Day pips — 7 columns, justified across the card width.
          Hit days render the fire.svg illustration; miss days are
          a small hollow hairline circle. Today is marked by the
          day label sitting at full opacity (others at 55%).

          On open, each fire pops in with a staggered spring so
          the streak builds in front of the user one day at a time
          (Mon → Tue → Wed → Thu). Static elements — labels and
          miss circles — render immediately so the row is laid out
          from frame 0 and the fires drop INTO existing slots
          instead of pushing things around. delayChildren waits
          ~350ms for the drawer's slide-in (spring stiffness 360
          damping 38) to settle before the first pop. */}
      <div className="flex justify-between">
        {STREAK_DAYS.map((day, i) => {
          // Count hits BEFORE this position so the animation
          // order follows chronological reading (Mon's fire pops
          // first, Tue's second, …) regardless of how the array
          // is laid out. Miss days get -1 so their pip skips the
          // animation path entirely.
          const hitIndex = day.hit
            ? STREAK_DAYS.slice(0, i).filter((d) => d.hit).length
            : -1;
          return (
            <DayPip
              key={`${day.label}-${i}`}
              label={day.label}
              hit={day.hit}
              isToday={day.isToday}
              hitIndex={hitIndex}
            />
          );
        })}
      </div>
    </section>
  );
}

// Stagger / delay tokens for the day-pip pop-in. Pulled out as
// named constants so the comment up in PlayStreakCard can refer
// to them without drifting.
//   • DRAWER_SETTLE_MS — drawer's spring (stiffness 360 damping
//     38) finishes its slide-in around 350 ms; the fires hold
//     until then so they don't compete with the drawer entrance.
//   • FIRE_STAGGER_MS  — gap between successive fire pops. 120 ms
//     is fast enough to feel snappy across a 4-day streak (~480
//     ms total) but slow enough that each pop reads individually.
const DRAWER_SETTLE_MS = 350;
const FIRE_STAGGER_MS = 120;

function DayPip({
  label,
  hit,
  isToday,
  hitIndex,
}: {
  label: string;
  hit: boolean;
  isToday: boolean;
  /** Chronological position of this hit day in the streak (0 =
   *  first hit of the week, 1 = second, …). Drives the fire's
   *  per-pip animation delay. -1 for miss days; the fire isn't
   *  rendered for those so the value is ignored. */
  hitIndex: number;
}) {
  // Fixed height for the content row so the day initials stay
  // baseline-aligned across hit / miss columns even though the
  // fire SVG and the hollow miss-circle have different intrinsic
  // dimensions.
  const ROW_H = 31;
  // The fire SVG's intrinsic 80×103 ratio — width 24 → height 31.
  const FIRE_W = 24;
  const FIRE_H = 31;
  // Hollow miss-day circle sized to roughly match the fire's
  // visual mass so a partially-hit week still feels balanced.
  const MISS_DIAM = 22;
  return (
    <div className="flex flex-col items-center gap-[6px]">
      <span
        className="text-[11px] font-extrabold uppercase text-[var(--mrq-blue-dark)]"
        style={{
          letterSpacing: 0.4,
          // Today's label sits at full opacity so the user can
          // still pick out "now" when every day in the week has
          // been hit and the fires look uniform.
          opacity: isToday ? 1 : 0.55,
        }}
      >
        {label}
      </span>
      <div
        className="flex items-end justify-center"
        style={{ height: ROW_H }}
      >
        {hit ? (
          // Stiff spring with low damping = a satisfying "pop"
          // with a slight overshoot. Origin set to bottom-centre
          // so the flame appears to spring UP out of the row
          // (matches the visual metaphor of a fire kindling) and
          // the day label stays anchored above.
          <motion.img
            src="/assets/fire.svg"
            alt=""
            width={FIRE_W}
            height={FIRE_H}
            draggable={false}
            style={{ display: "block", transformOrigin: "bottom center" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay:
                (DRAWER_SETTLE_MS + hitIndex * FIRE_STAGGER_MS) / 1000,
              type: "spring",
              stiffness: 420,
              damping: 16,
              mass: 0.7,
            }}
          />
        ) : (
          <span
            className="rounded-full self-center"
            style={{
              width: MISS_DIAM,
              height: MISS_DIAM,
              border: "1.5px solid #e6e6e7",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ----------- Inline icons ----------- */

function MinusIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 14 14" fill="currentColor" className={className} aria-hidden><rect x="2" y="6" width="10" height="2" rx="1" /></svg>;
}
function PlusIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 14 14" fill="currentColor" className={className} aria-hidden><rect x="2" y="6" width="10" height="2" rx="1" /><rect x="6" y="2" width="2" height="10" rx="1" /></svg>;
}
function UserIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><circle cx="10" cy="7" r="3.5" /><path d="M3 17c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>;
}
function WalletIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><rect x="2" y="5" width="16" height="12" rx="2" /><path d="M14 11h2" /><path d="M2 8h13" /></svg>;
}
function HistoryIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M3 10a7 7 0 1 0 2-5L3 7" /><path d="M3 3v4h4" /><path d="M10 6v4l3 2" /></svg>;
}
function HeartIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M10 17s-6-4-6-9a3.5 3.5 0 0 1 6-2.5A3.5 3.5 0 0 1 16 8c0 5-6 9-6 9Z" /></svg>;
}
function GiftIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><rect x="2.5" y="6" width="15" height="3.5" rx="0.5" /><path d="M4 9.5V17a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" /><path d="M10 6v12" /><path d="M10 6c-1.25-1.6-4.6-1.6-4.6 0 0 .85.85 1.3 2.1 1.3 1.25 0 2.5-.45 2.5-1.3Z" /><path d="M10 6c1.25-1.6 4.6-1.6 4.6 0 0 .85-.85 1.3-2.1 1.3-1.25 0-2.5-.45-2.5-1.3Z" /></svg>;
}
function ChevronRightIcon() {
  // Stroke-based right chevron at the same 1.8 weight + rounded
  // caps as the rest of the menu's iconography, so it sits next
  // to UserIcon / WalletIcon / etc. without looking like a
  // different design system.
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-full"
      aria-hidden
    >
      <path d="m7.5 5 5 5-5 5" />
    </svg>
  );
}
function DiamondIcon() {
  // Gem/diamond outline — trapezoidal top + V bottom + a horizontal
  // top-facet line and two short diagonals from the upper corners
  // down to the gem's centre point, so it reads as a multi-facet
  // gem rather than a flat rhombus. Matches the rest of the menu's
  // 1.8-weight stroked-icon set.
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-full"
      aria-hidden
    >
      <path d="M5 2.5h10l3.5 5L10 17.5 1.5 7.5Z" />
      <path d="M1.5 7.5h17" />
      <path d="M5 2.5 10 7.5l5-5" />
    </svg>
  );
}
function LockIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><rect x="4" y="9" width="12" height="8" rx="2" /><path d="M7 9V7a3 3 0 0 1 6 0v2" /></svg>;
}
function DocIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><path d="M5 2.5h7l3 3V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" /><path d="M7 8h6M7 11h6M7 14h4" /></svg>;
}
function QuestionIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-full" aria-hidden><circle cx="10" cy="10" r="7.5" /><path d="M7.5 8a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7" /><circle cx="10" cy="14.5" r="0.6" fill="currentColor" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><path d="M12 4H4v12h8" /><path d="M8 10h10m0 0-3-3m3 3-3 3" /></svg>;
}
