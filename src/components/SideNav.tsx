"use client";

import Image from "next/image";
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
  return (
    <div className="flex flex-col gap-[16px] px-[16px] py-[16px]">
      {/* Header: avatar + name */}
      <header className="flex items-center gap-[12px]">
        <div className="relative size-[40px] rounded-full overflow-hidden bg-white">
          <Image src="/assets/avatar.png" alt="" fill sizes="40px" className="object-cover" />
        </div>
        <p className="text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">Leigh Taylor</p>
      </header>

      {/* Withdraw / Deposit */}
      <div className="grid grid-cols-2 gap-[8px]">
        <button
          type="button"
          className="flex items-center justify-center gap-[6px] h-[42px] rounded-[12px] bg-white text-[var(--mrq-blue-dark)] text-[14px] font-extrabold active:scale-[0.98] transition-transform"
          style={{ border: "1px solid #e6e6e7" }}
        >
          <MinusIcon className="size-[14px]" />
          Withdraw
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-[6px] h-[42px] rounded-[12px] bg-mrq-blue text-white text-[14px] font-extrabold active:scale-[0.98] transition-transform"
        >
          <PlusIcon className="size-[14px]" />
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
      <span className="text-[14px] font-extrabold">{label}</span>
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
