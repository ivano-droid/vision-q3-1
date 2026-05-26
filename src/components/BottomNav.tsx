"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useShell } from "@/lib/filter-context";

/**
 * Persistent bottom navigation — Lobby / Search / Discover / Rewards.
 *
 * Replaces the old single-page BottomBar (home + search pill + gift).
 * Now that Search/Discover/Rewards are real Next.js routes, the bar is
 * a tab bar: each item is a `<Link>`, and the visually active tab is
 * derived from `usePathname()` — survives reloads, deep links, the back
 * button, the lot.
 *
 * Visual treatment (matches Figma node 103:24911):
 *   • Active tab: rounded blue pill behind icon + label, white foreground
 *   • Inactive tabs: just icon + label in MrQ blue, no fill
 *   • Active pill slides between tabs via Framer Motion `layoutId` —
 *     subtle, smooth, no big bounce.
 *
 * Persists across every route in the shell, sitting above the bottom
 * safe-area inset so it clears the iOS home indicator / Safari chrome.
 */

type Tab = {
  key: string;
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

// Tab keys still mirror the route segments (lobby = /, search-page
// = /search, discover-page = /discover) for active-state matching;
// only the visible labels + icons have moved. If we later want
// `/search` → `/games` and `/discover` → `/for-you` as real URLs,
// those are file-rename moves under src/app/.
const TABS: Tab[] = [
  { key: "lobby", href: "/", label: "Home", Icon: HomeIcon },
  { key: "search", href: "/search", label: "Games", Icon: GamesIcon },
  { key: "discover", href: "/discover", label: "For You", Icon: ForYouIcon },
  { key: "rewards", href: "/rewards", label: "Rewards", Icon: GiftIcon },
];

/** Which tab is "active" given the current pathname. Only the four
 *  top-level destinations light their tab. Category pages (/casino,
 *  /live, /bingo, /arena) return `null` — the user is "inside" one
 *  of the verticals, no bottom-nav tab represents that, so none are
 *  lit. (Previously these defaulted to "lobby"; the user noted it
 *  felt wrong since they're on a Casino page, not on the Lobby.) */
function activeTabFor(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return "lobby";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/discover")) return "discover";
  if (pathname.startsWith("/rewards")) return "rewards";
  return null;
}

export function BottomNav() {
  const pathname = usePathname();
  const active = activeTabFor(pathname);
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  // One-shot entrance on first paint after the splash dissolves.
  // Controlled via CSS transition (not Framer's animate prop) so the
  // entrance fires exactly once and never re-triggers on context
  // re-renders. Bar slides up from below the bottom edge.
  const shown = reduce || bootDone;
  const entranceCss = reduce
    ? "none"
    : "opacity 0.3s 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s 0.9s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    // Full-width flat tab bar anchored to the bottom of the
    // mobile-frame. On desktop the --frame-right-offset CSS var keeps
    // the bar clamped to the centred 375px column instead of spanning
    // the entire monitor. On mobile the offset is 0 so the bar runs
    // edge-to-edge. The bar itself absorbs the iOS safe-area-inset
    // (replacing the old separate "floor" div).
    <nav
      aria-label="Primary"
      // bottom-nav-pad: sets padding-bottom to env(safe-area-inset-bottom)
      // in browser mode (full inset to clear iOS Safari's URL bar), and a
      // reduced inset in standalone PWA mode so the tabs sit closer to
      // the home indicator instead of floating above a band of white.
      // See globals.css for the @media (display-mode: standalone) rule.
      className="bottom-nav-pad fixed bottom-0 z-40"
      style={{
        left: "var(--frame-right-offset)",
        right: "var(--frame-right-offset)",
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        borderTop: "1px solid rgba(10, 46, 203, 0.10)",
        // Soft glow above the bar to lift it off the lobby content
        // without going as heavy as a drop shadow.
        boxShadow: "0 -8px 24px -12px rgba(10, 46, 203, 0.18)",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(100%)",
        transition: entranceCss,
      }}
    >
      {/* Inner row — tighter top padding now that the icons are
          26px. Was pt-[8px] but the bar visually had too much air
          above the icons; pt-[3px] keeps just enough breathing
          room before the top border. */}
      <div className="flex items-stretch px-[8px] pt-[3px] pb-[4px] gap-[4px]">
        {TABS.map((tab) => (
          <TabItem key={tab.key} tab={tab} active={tab.key === active} />
        ))}
      </div>
    </nav>
  );
}

function TabItem({ tab, active }: { tab: Tab; active: boolean }) {
  // Subtle press feedback — separate spring on tap so it feels instant.
  const [pressed, setPressed] = useState(false);
  // Reset press state after navigation so the next tap re-fires it.
  useEffect(() => {
    if (!pressed) return;
    const t = setTimeout(() => setPressed(false), 160);
    return () => clearTimeout(t);
  }, [pressed]);

  const Icon = tab.Icon;

  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      onPointerDown={() => setPressed(true)}
      className="relative flex flex-1 min-w-0 flex-col items-center justify-center rounded-full px-[6px] py-[8px]"
      style={{
        // Active foreground (icon + label) goes white because the pill
        // behind it is brand-blue; inactive sits in brand-blue on the
        // pale bar fill.
        color: active ? "#ffffff" : "var(--mrq-blue)",
        transform: pressed ? "scale(0.94)" : "scale(1)",
        transition: "transform 160ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms ease",
      }}
    >
      {/* Sliding active-pill background — shared layoutId means Framer
          animates a single pill between tab positions instead of
          fading two separate pills in/out. The motion.div only exists
          on the active tab; AnimatePresence isn't needed because
          layoutId handles the transition. */}
      {active && (
        <motion.span
          layoutId="bottom-nav-pill"
          className="absolute inset-0 rounded-full -z-10"
          style={{ backgroundColor: "var(--mrq-blue)" }}
          transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.8 }}
          aria-hidden
        />
      )}

      <Icon className="h-[26px] w-auto" />
      <span
        className="mt-[4px] text-[12px] font-extrabold leading-none whitespace-nowrap"
        style={{ letterSpacing: "0.01em" }}
      >
        {tab.label}
      </span>
    </Link>
  );
}

/* ----------- Inline icons (24×24 lucide-style outlines) ----------- */

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden focusable={false}>
      <path d="M12 3.172 3 11.05V21a1 1 0 0 0 1 1h5v-7h6v7h5a1 1 0 0 0 1-1v-9.95l-9-7.878Z" />
    </svg>
  );
}

function GamesIcon({ className }: { className?: string }) {
  // 2×2 grid of rounded tiles — reads as "games catalogue" rather
  // than the old magnifying glass (which made sense for Search but
  // not for the relabelled Games tab).
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function ForYouIcon({ className }: { className?: string }) {
  // Sparkle — iOS / Apple Music convention for personalised "For
  // You" sections. Big star + one small accent star for the
  // "twinkle" hint, the same idiom Apple uses on the For You
  // tab in Music + the lightning-style favourites in Photos.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M11 2.5l1.9 5.1L18 9.5l-5.1 1.9L11 16.5l-1.9-5.1L4 9.5l5.1-1.9L11 2.5Z" />
      <path d="M18.5 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <rect x="3" y="7" width="18" height="4" rx="1" />
      <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M12 7v14" />
      <path d="M12 7c-1.5-2-5.5-2-5.5 0 0 1 1 1.5 2.5 1.5 1.5 0 3-.5 3-1.5Z" />
      <path d="M12 7c1.5-2 5.5-2 5.5 0 0 1-1 1.5-2.5 1.5-1.5 0-3-.5-3-1.5Z" />
    </svg>
  );
}
