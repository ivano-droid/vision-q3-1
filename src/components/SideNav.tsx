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
        <div className="relative size-[56px] shrink-0 rounded-full overflow-hidden bg-white">
          <Image
            src="/assets/avatar.png"
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-[2px]">
          <p className="text-[22px] font-extrabold leading-tight text-[var(--mrq-blue-dark)] truncate">
            Leigh Taylor
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
          className="flex items-center justify-center gap-[8px] h-[50px] rounded-[14px] bg-white text-[var(--mrq-blue-dark)] text-[17px] font-extrabold active:scale-[0.98] transition-transform"
          style={{ border: "1px solid #e6e6e7" }}
        >
          <MinusIcon className="size-[16px]" />
          Withdraw
        </button>
        <button
          type="button"
          onClick={goToDeposit}
          className="flex items-center justify-center gap-[8px] h-[50px] rounded-[14px] bg-mrq-blue text-white text-[17px] font-extrabold active:scale-[0.98] transition-transform"
        >
          <PlusIcon className="size-[16px]" />
          Deposit
        </button>
      </div>

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
        <MenuItem icon={<GiftIcon />} label="Get 50 free spins!" accent="#D000CA" onClick={onClose} />
        <MenuItem icon={<LockIcon />} label="Privacy Policy" onClick={onClose} />
        <MenuItem icon={<DocIcon />} label="Terms & Conditions" onClick={onClose} />
        <MenuItem icon={<QuestionIcon />} label="Help & FAQs" onClick={onClose} />
      </MenuGroup>

      <div className="flex-1" />

      {/* Footer: Log out */}
      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-[8px] text-[14px] font-medium text-[var(--mrq-blue-dark)] px-[8px] py-[12px]"
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
      <span className="flex-1 text-[14px] font-medium">{label}</span>
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

/* ----------- Inline icons ----------- */

function MinusIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 14 14" fill="currentColor" className={className} aria-hidden><rect x="2" y="6" width="10" height="2" rx="1" /></svg>;
}
function PlusIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 14 14" fill="currentColor" className={className} aria-hidden><rect x="2" y="6" width="10" height="2" rx="1" /><rect x="6" y="2" width="2" height="10" rx="1" /></svg>;
}
function UserIcon() {
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "7.29% 15.63%" }}>
        <svg viewBox="0 0 11 13.6667" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M5.5 1.66667C4.30338 1.66667 3.33333 2.63672 3.33333 3.83333C3.33333 5.02995 4.30338 6 5.5 6C6.69662 6 7.66667 5.02995 7.66667 3.83333C7.66667 2.63672 6.69662 1.66667 5.5 1.66667ZM1.66667 3.83333C1.66667 1.71624 3.38291 0 5.5 0C7.61709 0 9.33333 1.71624 9.33333 3.83333C9.33333 5.95043 7.61709 7.66667 5.5 7.66667C3.38291 7.66667 1.66667 5.95043 1.66667 3.83333Z" />
          <path d="M0.621725 9.64843C1.30829 8.61858 2.46413 8 3.70185 8H7.29815C8.53587 8 9.69171 8.61858 10.3783 9.64843C10.7837 10.2565 11 10.971 11 11.7019V12.8333C11 13.2936 10.6269 13.6667 10.1667 13.6667H0.833333C0.373096 13.6667 0 13.2936 0 12.8333V11.7019C0 10.971 0.216329 10.2565 0.621725 9.64843ZM3.70185 9.66667C3.02138 9.66667 2.38593 10.0067 2.00848 10.5729C1.7856 10.9072 1.66667 11.3001 1.66667 11.7019V12H9.33333V11.7019C9.33333 11.3001 9.2144 10.9072 8.99153 10.5729C8.61407 10.0067 7.97862 9.66667 7.29815 9.66667H3.70185Z" />
        </svg>
      </span>
    </span>
  );
}
function WalletIcon() {
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "11.46% 3.12%" }}>
        <svg viewBox="0 0 15 12.3333" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M3.46788 7.14023e-07H11.5321C11.9714 -1.41474e-05 12.3504 -2.71002e-05 12.6625 0.0254761C12.992 0.0523935 13.3197 0.111823 13.635 0.272485C14.1054 0.512169 14.4878 0.89462 14.7275 1.36503C14.8882 1.68034 14.9476 2.00802 14.9745 2.33748C15 2.64962 15 3.02858 15 3.46786V8.86547C15 9.30476 15 9.68372 14.9745 9.99586C14.9476 10.3253 14.8882 10.653 14.7275 10.9683C14.4878 11.4387 14.1054 11.8212 13.635 12.0609C13.3197 12.2215 12.992 12.2809 12.6625 12.3079C12.3504 12.3334 11.9714 12.3334 11.5321 12.3333H3.46786C3.02858 12.3334 2.64962 12.3334 2.33748 12.3079C2.00802 12.2809 1.68034 12.2215 1.36503 12.0609C0.89462 11.8212 0.512169 11.4387 0.272485 10.9683C0.111823 10.653 0.0523935 10.3253 0.0254761 9.99586C-2.71002e-05 9.68371 -1.41474e-05 9.30475 7.14023e-07 8.86545V3.46788C-1.41474e-05 3.02859 -2.71002e-05 2.64962 0.0254761 2.33748C0.0523935 2.00802 0.111823 1.68034 0.272485 1.36503C0.512169 0.89462 0.89462 0.512169 1.36503 0.272485C1.68034 0.111823 2.00802 0.0523935 2.33748 0.0254761C2.64962 -2.71002e-05 3.02859 -1.41474e-05 3.46788 7.14023e-07ZM2.4732 1.68661C2.24681 1.7051 2.16288 1.7365 2.12168 1.7575C1.96487 1.83739 1.83739 1.96487 1.7575 2.12168C1.7365 2.16288 1.7051 2.24681 1.68661 2.4732C1.68176 2.5325 1.67809 2.59649 1.67531 2.66667H13.3247C13.3219 2.59649 13.3182 2.5325 13.3134 2.4732C13.2949 2.24681 13.2635 2.16288 13.2425 2.12168C13.1626 1.96487 13.0351 1.83739 12.8783 1.7575C12.8371 1.7365 12.7532 1.7051 12.5268 1.68661C12.2907 1.66732 11.9805 1.66667 11.5 1.66667H3.5C3.01954 1.66667 2.70931 1.66732 2.4732 1.68661ZM1.66667 5V8.83333C1.66667 9.3138 1.66732 9.62402 1.68661 9.86014C1.7051 10.0865 1.7365 10.1705 1.7575 10.2117C1.83739 10.3685 1.96487 10.4959 2.12168 10.5758C2.16288 10.5968 2.24681 10.6282 2.4732 10.6467C2.70931 10.666 3.01954 10.6667 3.5 10.6667H11.5C11.9805 10.6667 12.2907 10.666 12.5268 10.6467C12.7532 10.6282 12.8371 10.5968 12.8783 10.5758C13.0351 10.4959 13.1626 10.3685 13.2425 10.2117C13.2635 10.1705 13.2949 10.0865 13.3134 9.86014C13.3327 9.62402 13.3333 9.3138 13.3333 8.83333V5H1.66667ZM2.66667 8.83333C2.66667 8.3731 3.03976 8 3.5 8H5.5C5.96024 8 6.33333 8.3731 6.33333 8.83333C6.33333 9.29357 5.96024 9.66667 5.5 9.66667H3.5C3.03976 9.66667 2.66667 9.29357 2.66667 8.83333Z" />
        </svg>
      </span>
    </span>
  );
}
function HistoryIcon() {
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "7.36% 7.34% 7.29% -0.21%" }}>
        <svg viewBox="0 0 14.8598 13.6556" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M4.26137 1.13518C5.49519 0.317986 6.96117 -0.0760133 8.43845 0.0121312C9.91582 0.100298 11.3249 0.665894 12.4528 1.62411C13.5806 2.5823 14.3666 3.88105 14.6924 5.32463C15.0181 6.76832 14.8659 8.27894 14.2588 9.62867C13.6516 10.9784 12.6222 12.0943 11.3258 12.8084C10.0295 13.5224 8.53647 13.7958 7.07126 13.5877C5.60597 13.3794 4.24758 12.701 3.20147 11.6541C2.87623 11.3285 2.87668 10.801 3.20212 10.4757C3.52763 10.1504 4.05519 10.1503 4.38051 10.4757C5.17127 11.2671 6.19801 11.7805 7.30564 11.9379C8.41319 12.0953 9.54191 11.8884 10.5218 11.3487C11.5017 10.809 12.2796 9.96533 12.7386 8.94507C13.1975 7.92485 13.3129 6.78308 13.0667 5.69182C12.8205 4.6005 12.226 3.61863 11.3733 2.89429C10.5207 2.16996 9.45561 1.74218 8.33884 1.67554C7.22217 1.60898 6.11391 1.90675 5.18129 2.5245C4.24859 3.14231 3.5419 4.04703 3.16762 5.10132C3.01356 5.53478 2.53738 5.76162 2.10382 5.60783C1.6701 5.45386 1.44333 4.9771 1.59731 4.54338C2.09246 3.1487 3.02753 1.95247 4.26137 1.13518Z" />
          <path d="M7.20017 3.82235C7.20017 3.36212 7.57327 2.98902 8.0335 2.98902C8.49374 2.98902 8.86684 3.36212 8.86684 3.82235V6.726L10.8512 8.14397C11.2257 8.41145 11.3126 8.93223 11.0452 9.30673C10.7777 9.6812 10.257 9.76814 9.88246 9.50074L7.54913 7.83407C7.33013 7.67765 7.20017 7.42481 7.20017 7.15569V3.82235Z" />
          <path d="M0.0183814 3.04469L0.71142 6.30518C0.807109 6.75536 1.24962 7.04274 1.6998 6.94705L4.9603 6.25401C5.41048 6.15832 5.69785 5.7158 5.60216 5.26562C5.50647 4.81544 5.06396 4.52807 4.61378 4.62376L2.16841 5.14354L1.64863 2.69817C1.55294 2.24799 1.11042 1.96062 0.660245 2.05631C0.210065 2.152 -0.0773073 2.59451 0.0183814 3.04469Z" />
        </svg>
      </span>
    </span>
  );
}
function HeartIcon() {
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "11.46% 7.29%" }}>
        <svg viewBox="0 0 13.6667 12.3332" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M4 1.66667C2.7511 1.66667 1.66667 2.74516 1.66667 4.16667C1.66667 4.64979 1.79394 5.09681 2.0116 5.4752C2.02058 5.49082 2.02906 5.50673 2.03702 5.52291C2.65932 6.78809 3.93624 8.09969 5.13123 9.13234C5.71714 9.63866 6.26169 10.0597 6.65946 10.3538C6.72116 10.3995 6.77925 10.442 6.83333 10.4812C6.88742 10.442 6.94551 10.3995 7.00721 10.3538C7.40499 10.0597 7.94954 9.63864 8.53546 9.13232C9.73046 8.09966 11.0074 6.78806 11.6297 5.52287C11.6376 5.5067 11.6461 5.49079 11.6551 5.47517C11.8727 5.09678 12 4.64978 12 4.16667C12 2.74516 10.9156 1.66667 9.66667 1.66667C8.77735 1.66667 7.9805 2.20463 7.58588 3.03432C7.44777 3.32471 7.1549 3.50972 6.83333 3.50972C6.51177 3.50972 6.2189 3.32471 6.08078 3.03432C5.68617 2.20463 4.88932 1.66667 4 1.66667ZM6.83333 11.5C6.37108 12.1934 6.37082 12.1932 6.37082 12.1932L6.36632 12.1902L6.35562 12.183L6.31697 12.1568C6.28377 12.1341 6.23594 12.1013 6.17517 12.0588C6.05368 11.9739 5.88025 11.8505 5.66848 11.6939C5.24552 11.3811 4.66658 10.9336 4.04149 10.3934C2.82062 9.33837 1.33429 7.85493 0.553182 6.28221C0.200634 5.65989 0 4.93559 0 4.16667C0 1.90627 1.7511 0 4 0C5.11649 0 6.11451 0.474172 6.83333 1.22572C7.55216 0.474172 8.55018 0 9.66667 0C11.9156 0 13.6667 1.90627 13.6667 4.16667C13.6667 4.93558 13.466 5.65986 13.1135 6.28217C12.3324 7.85489 10.8461 9.33834 9.62519 10.3934C9.0001 10.9335 8.42116 11.3811 7.99819 11.6939C7.78642 11.8505 7.61299 11.9739 7.49149 12.0588C7.43073 12.1013 7.3829 12.1341 7.34969 12.1568L7.31105 12.183L7.30034 12.1902L7.29721 12.1923L7.29621 12.193C7.29621 12.193 7.29558 12.1934 6.83333 11.5ZM6.83333 11.5L7.29558 12.1934C7.01567 12.38 6.65073 12.3798 6.37082 12.1932L6.83333 11.5Z" />
        </svg>
      </span>
    </span>
  );
}
function GiftIcon() {
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "5.21% 3.13% 5.21% 3.12%" }}>
        <svg viewBox="0 0 15 14.3334" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M1.3335 12.1667V7.50002C1.3335 7.03978 1.70659 6.66669 2.16683 6.66669C2.62707 6.66669 3.00016 7.03978 3.00016 7.50002V12.1667C3.00016 12.4428 3.22402 12.6667 3.50016 12.6667H11.5002C11.7763 12.6667 12.0002 12.4428 12.0002 12.1667V7.50002C12.0002 7.03978 12.3733 6.66669 12.8335 6.66669C13.2937 6.66669 13.6668 7.03978 13.6668 7.50002V12.1667C13.6668 13.3633 12.6968 14.3334 11.5002 14.3334H3.50016C2.30355 14.3334 1.3335 13.3633 1.3335 12.1667Z" />
          <path d="M13.3333 5.50001C13.3333 5.22387 13.1095 5.00001 12.8333 5.00001H2.16667C1.89052 5.00001 1.66667 5.22387 1.66667 5.50001V6.16668C1.66667 6.44282 1.89069 6.66669 2.16683 6.66669H12.8335C13.1096 6.66669 13.3333 6.44282 13.3333 6.16668V5.50001ZM15 6.16668C15 7.36329 14.03 8.33334 12.8333 8.33334H2.16667C0.97005 8.33334 1.07376e-08 7.36329 0 6.16668V5.50001C0 4.30339 0.97005 3.33334 2.16667 3.33334H12.8333C14.03 3.33334 15 4.30339 15 5.50001V6.16668Z" />
          <path d="M6.66675 13.5V4.16668C6.66675 3.70644 7.03984 3.33334 7.50008 3.33334C7.96032 3.33334 8.33341 3.70644 8.33341 4.16668V13.5C8.33341 13.9602 7.96032 14.3333 7.50008 14.3333C7.03984 14.3333 6.66675 13.9602 6.66675 13.5Z" />
          <path d="M4.5 0C6.13008 0 7.09836 1.17629 7.60547 2.09831C7.86866 2.57684 8.04393 3.04805 8.15365 3.39453C8.20895 3.56919 8.24904 3.71623 8.27539 3.82161C8.28855 3.87427 8.29847 3.91715 8.30534 3.94792C8.30875 3.96318 8.31119 3.97576 8.31315 3.98503C8.31412 3.98963 8.31513 3.9937 8.31576 3.99674C8.31605 3.99817 8.31619 3.99959 8.31641 4.00065L8.31706 4.00195C8.31712 4.00225 8.31715 4.00324 7.5 4.16667L8.31706 4.00326C8.36602 4.24807 8.30281 4.50224 8.14453 4.69531C7.98625 4.88829 7.7496 5 7.5 5H4.5C3.83696 5 3.20126 4.73642 2.73242 4.26758C2.29282 3.82798 2.03385 3.2417 2.00326 2.6237L2 2.5C2 1.83696 2.26358 1.20126 2.73242 0.732422C3.20126 0.263581 3.83696 0 4.5 0ZM3.67057 2.58268C3.68957 2.77334 3.77413 2.95252 3.91081 3.08919C4.06709 3.24547 4.27899 3.33333 4.5 3.33333H6.35352C6.29274 3.19246 6.22401 3.04619 6.14453 2.90169C5.73498 2.15708 5.20323 1.66667 4.5 1.66667C4.27899 1.66667 4.06709 1.75453 3.91081 1.91081C3.75453 2.06709 3.66667 2.27899 3.66667 2.5L3.67057 2.58268Z" />
          <path d="M11.3334 2.5C11.3334 2.27899 11.2456 2.06709 11.0893 1.91081C10.933 1.75453 10.7211 1.66667 10.5001 1.66667C9.79685 1.66667 9.2651 2.15708 8.85555 2.90169C8.77608 3.04619 8.70734 3.19246 8.64657 3.33333H10.5001C10.7211 3.33333 10.933 3.24547 11.0893 3.08919C11.2456 2.93291 11.3334 2.72101 11.3334 2.5ZM13.0001 2.5C13.0001 3.16304 12.7365 3.79874 12.2677 4.26758C11.8281 4.70718 11.2418 4.96615 10.6238 4.99674L10.5001 5H7.5C7.25041 5 7.01383 4.88829 6.85555 4.69531C6.69727 4.50224 6.63406 4.24807 6.68302 4.00326L7.5 4.16667C6.68285 4.00324 6.68297 4.00355 6.68302 4.00326V4.00195L6.68368 4.00065C6.68389 3.99959 6.68403 3.99817 6.68433 3.99674C6.68495 3.9937 6.68596 3.98963 6.68693 3.98503C6.68889 3.97576 6.69133 3.96318 6.69474 3.94792C6.70161 3.91715 6.71153 3.87427 6.72469 3.82161C6.75104 3.71623 6.79113 3.56919 6.84644 3.39453C6.95615 3.04805 7.13142 2.57684 7.39461 2.09831C7.90172 1.17629 8.87 0 10.5001 0C11.1631 0 11.7988 0.263581 12.2677 0.732422C12.7365 1.20126 13.0001 1.83696 13.0001 2.5Z" />
        </svg>
      </span>
    </span>
  );
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
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "0" }}>
        <svg viewBox="0 0 24 24" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 4.25C10.4812 4.25 9.25 5.48122 9.25 7V8.75H14.75V7C14.75 5.48122 13.5188 4.25 12 4.25ZM17.25 8.75947V7C17.25 4.10051 14.8995 1.75 12 1.75C9.10051 1.75 6.75 4.10051 6.75 7V8.75947C5.07189 8.88713 3.75 10.2892 3.75 12V19C3.75 20.7949 5.20507 22.25 7 22.25H17C18.7949 22.25 20.25 20.7949 20.25 19V12C20.25 10.2892 18.9281 8.88713 17.25 8.75947ZM7 11.25C6.58579 11.25 6.25 11.5858 6.25 12V19C6.25 19.4142 6.58579 19.75 7 19.75H17C17.4142 19.75 17.75 19.4142 17.75 19V12C17.75 11.5858 17.4142 11.25 17 11.25H7Z" />
        </svg>
      </span>
    </span>
  );
}
function DocIcon() {
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "5.21% 11.46%" }}>
        <svg viewBox="0 0 12.3333 14.3333" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M0 2.16667C0 0.97005 0.97005 0 2.16667 0H10.1667C11.3633 0 12.3333 0.97005 12.3333 2.16667V12.1667C12.3333 13.3633 11.3633 14.3333 10.1667 14.3333H2.16667C0.970049 14.3333 0 13.3633 0 12.1667V2.16667ZM2.16667 1.66667C1.89052 1.66667 1.66667 1.89052 1.66667 2.16667V12.1667C1.66667 12.4428 1.89052 12.6667 2.16667 12.6667H10.1667C10.4428 12.6667 10.6667 12.4428 10.6667 12.1667V2.16667C10.6667 1.89052 10.4428 1.66667 10.1667 1.66667H2.16667ZM2.66667 4.16667C2.66667 3.70643 3.03976 3.33333 3.5 3.33333H8.83333C9.29357 3.33333 9.66667 3.70643 9.66667 4.16667C9.66667 4.6269 9.29357 5 8.83333 5H3.5C3.03976 5 2.66667 4.6269 2.66667 4.16667ZM4.66667 6.83333C4.66667 6.3731 5.03976 6 5.5 6H8.83333C9.29357 6 9.66667 6.3731 9.66667 6.83333C9.66667 7.29357 9.29357 7.66667 8.83333 7.66667H5.5C5.03976 7.66667 4.66667 7.29357 4.66667 6.83333ZM6 9.5C6 9.03976 6.3731 8.66667 6.83333 8.66667H8.83333C9.29357 8.66667 9.66667 9.03976 9.66667 9.5C9.66667 9.96024 9.29357 10.3333 8.83333 10.3333H6.83333C6.3731 10.3333 6 9.96024 6 9.5Z" />
        </svg>
      </span>
    </span>
  );
}
function QuestionIcon() {
  return (
    <span className="size-full" style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "3.11%" }}>
        <svg viewBox="0 0 15.0039 15.0039" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M13.3333 7.50195C13.3333 4.28121 10.7227 1.67057 7.50195 1.67057C4.28121 1.67057 1.67057 4.28121 1.67057 7.50195C1.67057 10.7227 4.28121 13.3333 7.50195 13.3333C10.7227 13.3333 13.3333 10.7227 13.3333 7.50195ZM15.0039 7.50195C15.0039 11.645 11.645 15.0039 7.50195 15.0039C3.3589 15.0039 0 11.645 0 7.50195C0 3.3589 3.3589 0 7.50195 0C11.645 0 15.0039 3.3589 15.0039 7.50195Z" />
          <path d="M6.01237 3.72135C6.58952 3.38221 7.26794 3.25794 7.92773 3.37109C8.58761 3.48428 9.18602 3.82765 9.61719 4.33984C10.0481 4.85178 10.284 5.49947 10.2832 6.16862L10.2741 6.37174C10.1819 7.36659 9.42751 8.01925 8.91146 8.36328C8.61092 8.56362 8.31644 8.71056 8.10026 8.80664C7.99112 8.85515 7.89889 8.89184 7.83203 8.91732C7.79852 8.93008 7.7708 8.9401 7.75065 8.94727C7.74062 8.95083 7.73229 8.95353 7.72591 8.95573C7.72282 8.95679 7.72029 8.95824 7.7181 8.95898C7.71702 8.95935 7.7157 8.95935 7.71484 8.95964L7.71354 8.96029C7.27605 9.10612 6.80208 8.86978 6.65625 8.43229C6.51067 7.9953 6.74639 7.52266 7.18294 7.3763H7.18425C7.1858 7.37576 7.1883 7.3748 7.19141 7.3737C7.20055 7.37045 7.21602 7.36475 7.23698 7.35677C7.27945 7.34059 7.34373 7.31533 7.42188 7.2806C7.58061 7.21005 7.78568 7.10619 7.98503 6.97331C8.43441 6.67372 8.61314 6.39197 8.61328 6.16862V6.16732C8.61369 5.89227 8.51693 5.62581 8.33984 5.41536C8.16266 5.20489 7.91635 5.06344 7.64518 5.01693C7.37412 4.97051 7.09518 5.02146 6.85807 5.16081C6.62094 5.30019 6.44092 5.51918 6.34961 5.77865C6.19658 6.21367 5.71953 6.44209 5.28451 6.28906C4.8497 6.13591 4.62112 5.65952 4.77409 5.22461C4.99626 4.59304 5.43516 4.06058 6.01237 3.72135Z" />
          <path d="M7.5083 10C7.96946 10 8.34359 10.3741 8.34359 10.8353C8.34359 11.2964 7.96946 11.6706 7.5083 11.6706H7.50179C7.04063 11.6706 6.6665 11.2964 6.6665 10.8353C6.6665 10.3741 7.04063 10 7.50179 10H7.5083Z" />
        </svg>
      </span>
    </span>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <span className={className ?? "size-full"} style={{ position: "relative", display: "block" }}>
      <span style={{ position: "absolute", inset: "7.29%" }}>
        <svg viewBox="0 0 13.6667 13.6667" preserveAspectRatio="none" fill="currentColor" className="block h-full w-full" aria-hidden focusable={false}>
          <path d="M0.244078 7.42259C-0.0813592 7.09715 -0.0813592 6.56951 0.244078 6.24408L3.57741 2.91074C3.90285 2.58531 4.43049 2.58531 4.75592 2.91074C5.08136 3.23618 5.08136 3.76382 4.75592 4.08926L2.84518 6H9.5C9.96024 6 10.3333 6.3731 10.3333 6.83333C10.3333 7.29357 9.96024 7.66667 9.5 7.66667H2.84518L4.75592 9.57741C5.08136 9.90285 5.08136 10.4305 4.75592 10.7559C4.43049 11.0814 3.90285 11.0814 3.57741 10.7559L0.244078 7.42259ZM8 12.8333C8 12.3731 8.3731 12 8.83333 12H11.5C11.7761 12 12 11.7761 12 11.5V2.16667C12 1.89052 11.7761 1.66667 11.5 1.66667H8.83333C8.3731 1.66667 8 1.29357 8 0.833333C8 0.373096 8.3731 0 8.83333 0H11.5C12.6966 0 13.6667 0.97005 13.6667 2.16667V11.5C13.6667 12.6966 12.6966 13.6667 11.5 13.6667H8.83333C8.3731 13.6667 8 13.2936 8 12.8333Z" />
        </svg>
      </span>
    </span>
  );
}
