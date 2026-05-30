"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "@/lib/haptics";

/**
 * Persistent bottom navigation — Figma 226:52056.
 *
 * Reproduces the exact pill geometry of the Figma source, sized
 * to match ResumePlayingBar so both floating elements line up.
 *
 * Bar shape (351 × 60, rounded-full):
 *
 *   ╭─────────────────────────────────────────────────────────╮
 *   │ ╭─────╮              ╭───────╮                  ╭─────╮ │
 *   │ │ ⌂   │   ▶︎       🔍         🎁          │ │ ←─┐
 *   │ ╰─────╯              ╰───────╯                  ╰─────╯ │   │
 *   │ My Q    Top Picks    Explore           Rewards          │  pills
 *   ╰─────────────────────────────────────────────────────────╯
 *      ▲       ▲              ▲                     ▲
 *      80      84             84                    80
 *
 * Spacing rule (the key insight from Figma):
 *   • Outer pills (My Q, Rewards) are PINNED at 4px from the bar's
 *     outer edge, and are 80px wide. So they read as having an
 *     intentional gap to the bar's rounded end-cap, identical on
 *     both ends.
 *   • Inner pills (Top Picks, Explore) are 84px wide and centred
 *     on their column. The extra 4px of width pulls them visually
 *     wider than the outer pills, which compensates for the lack
 *     of a bar-edge "anchor" on either side.
 *
 * Bar internal padding is asymmetric — pl-4 / pr-8 — exactly per
 * Figma. The pr-8 absorbs the 4px gap on the Rewards side AS PART
 * of the bar's padding, so Rewards is pinned at 4px (right padding
 * of bar 8 minus pill's 4px outer inset). The pl-4 is just My Q's
 * 4px inset directly.
 *
 * The pill carries BOTH x and width — the width animates between
 * 80 and 84 as the user switches between outer and inner tabs.
 *
 * SVG icons live in /public/assets/nav-icons/ (outlined inactive +
 * filled active per tab). They crossfade via AnimatePresence while
 * the pill animates to its new position+width.
 */

// ── Figma constants ────────────────────────────────────────────────
// Bar width is matched to the ResumePlayingBar's inner card width
// (mobile-frame 375 minus 12px gutter on each side = 351). Both
// floating elements above the safe area now occupy the same
// horizontal footprint, so the nav doesn't read as narrower than
// the resume bar that sits above it.
const BAR_MAX_W = 351;
const BAR_H = 60;
const BAR_PAD_L = 4; // Figma pl-4
const BAR_PAD_R = 8; // Figma pr-8 (asymmetric — see notes above)
const TAB_GAP = 4; // Figma gap-4
const PILL_W_OUTER = 80; // My Q, Rewards
const PILL_W_INNER = 84; // Top Picks, Explore (extends into gaps)
const PILL_H = 52; // Figma h-52
const PILL_TOP = 4;
const PILL_PINNED_INSET = 4; // outer pills pinned this far from bar's outer edge
const ICON_SIZE = 24;
const ICON_LABEL_GAP = 2; // Figma gap-2 between icon and label
// Bumped from 10 → 11 to align with iOS HIG tab bar conventions
// (Apple's reference is 10pt, but 11px reads more confidently on
// modern screen densities and still fits inside the 84px inner
// pill for "Top Picks" — the longest label). Line-height stays
// at 16px so the icon + label vertical rhythm doesn't shift.
const LABEL_FONT_SIZE = 11;
const LABEL_LINE_H = 16;

type TabKey = "lobby" | "discover" | "search" | "rewards";

type Tab = {
  key: TabKey;
  href: string;
  label: string;
  iconInactive: string;
  iconActive: string;
};

const OUTER_TABS = new Set<TabKey>(["lobby", "rewards"]);

const TABS: Tab[] = [
  {
    key: "lobby",
    href: "/",
    label: "My Q",
    iconInactive: "/assets/nav-icons/my-q-inactive.svg",
    iconActive: "/assets/nav-icons/my-q-active.svg",
  },
  {
    key: "discover",
    href: "/discover",
    label: "Top Picks",
    iconInactive: "/assets/nav-icons/top-picks-inactive.svg",
    iconActive: "/assets/nav-icons/top-picks-active.svg",
  },
  {
    key: "search",
    href: "/search",
    label: "Explore",
    iconInactive: "/assets/nav-icons/explore-inactive.svg",
    iconActive: "/assets/nav-icons/explore-active.svg",
  },
  {
    key: "rewards",
    href: "/rewards",
    label: "Rewards",
    iconInactive: "/assets/nav-icons/rewards-inactive.svg",
    iconActive: "/assets/nav-icons/rewards-active.svg",
  },
];

/** Which tab is "active" for the current pathname. /casino and its
 *  sub-routes light up Explore — the user is inside the browse
 *  experience which Explore represents. */
function activeTabFor(pathname: string): TabKey {
  if (pathname === "/" || pathname === "") return "lobby";
  if (pathname.startsWith("/discover")) return "discover";
  if (pathname.startsWith("/rewards")) return "rewards";
  if (pathname.startsWith("/search")) return "search";
  // /casino, /bingo and /arena are all opened from the Explore page
  // (Start Browsing tiles + mega-cards), so they keep Explore lit.
  if (pathname.startsWith("/casino")) return "search";
  if (pathname.startsWith("/bingo")) return "search";
  if (pathname.startsWith("/arena")) return "search";
  return "lobby";
}

export function BottomNav() {
  const pathname = usePathname();
  const active = activeTabFor(pathname);
  // Scrim renders on every route. The colour matches the page
  // surface at the bottom edge so the fade doesn't smear into a
  // different tone behind the nav:
  //   /discover            → #000 (black, matches the reels feed)
  //   /rewards, /arena     → #0C2287 (Brand/900 dark blue, matches
  //                          the bottom stop of both pages' gradients)
  //   everything else      → #ffffff (default for #f5f5f5 routes)
  let scrimSolid = "#ffffff";
  let scrimFade = "rgba(255, 255, 255, 0)";
  if (pathname.startsWith("/discover")) {
    scrimSolid = "#000000";
    scrimFade = "rgba(0, 0, 0, 0)";
  } else if (
    pathname.startsWith("/rewards") ||
    pathname.startsWith("/arena")
  ) {
    scrimSolid = "#0C2287";
    scrimFade = "rgba(12, 34, 135, 0)";
  }

  const rowRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<TabKey, HTMLAnchorElement | null>>({
    lobby: null,
    discover: null,
    search: null,
    rewards: null,
  });

  // Pill state carries BOTH position and width — outer tabs use 80
  // pinned to a bar edge; inner tabs use 84 centred on their column.
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      if (!row) return;

      if (active === "lobby") {
        // Pinned 4px from bar's left edge.
        setPill({ x: PILL_PINNED_INSET, w: PILL_W_OUTER });
        return;
      }
      if (active === "rewards") {
        // Pinned 4px from bar's right edge.
        const rowWidth = row.getBoundingClientRect().width;
        setPill({
          x: rowWidth - PILL_PINNED_INSET - PILL_W_OUTER,
          w: PILL_W_OUTER,
        });
        return;
      }
      // Inner tab — centre the wider 84px pill on the column.
      const el = tabRefs.current[active];
      if (!el) return;
      const rowRect = row.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const tabCentre = elRect.left - rowRect.left + elRect.width / 2;
      setPill({ x: tabCentre - PILL_W_INNER / 2, w: PILL_W_INNER });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <>
      {/* SCRIM — page-coloured gradient fade above the pill.
          Always rendered; colour swaps via scrimSolid/scrimFade
          so /rewards uses the dark-blue match and every other
          route uses the existing white fade. */}
      <div
        aria-hidden
        className="fixed bottom-0 z-30 pointer-events-none"
        style={{
          left: "var(--frame-right-offset)",
          right: "var(--frame-right-offset)",
          height: "calc(var(--bottom-nav-h) + 80px)",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[90px]"
          style={{
            background: `linear-gradient(to top, ${scrimSolid} 30%, ${scrimFade} 100%)`,
          }}
        />
      </div>

      <nav
        aria-label="Primary"
        className="bottom-nav-pad fixed bottom-0 z-40"
        style={{
          left: "var(--frame-right-offset)",
          right: "var(--frame-right-offset)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* 12px gutter to mobile-frame edge + 8px bottom lift —
            matches ResumePlayingBar's mx-12, so both floating
            elements share the same outer footprint. */}
        <div className="px-[12px] pb-[8px]">
          {/* Pill bar — Figma geometry: 343 wide, 60 tall, pl-4 pr-8,
              tabs gap-4. The asymmetric padding is a design choice;
              see header notes for the math behind it. */}
          <div
            ref={rowRef}
            className="relative mx-auto flex items-center rounded-full"
            style={{
              maxWidth: BAR_MAX_W,
              height: BAR_H,
              paddingLeft: BAR_PAD_L,
              paddingRight: BAR_PAD_R,
              gap: TAB_GAP,
              // 0.82 alpha + 18px backdrop-blur: the bar still
              // reads as a confidently white surface, but content
              // scrolling under it gives a visible frosted-glass
              // tint through the bar. At 0.95 (the previous value)
              // the bar was too opaque and the blur was invisible.
              backgroundColor: "rgba(255, 255, 255, 0.82)",
              backdropFilter: "blur(18px) saturate(140%)",
              WebkitBackdropFilter: "blur(18px) saturate(140%)",
              boxShadow: "0 4px 22px 0 rgba(17, 17, 17, 0.12)",
            }}
          >
            {/* Active pill — width animates between 80 (outer tabs)
                and 84 (inner tabs). Anchored at left: 0 so the x
                transform measures from the bar's outer-left edge. */}
            {pill && (
              <motion.span
                aria-hidden
                className="absolute rounded-full"
                style={{
                  top: PILL_TOP,
                  left: 0,
                  height: PILL_H,
                  // Was #dee3f7 → #c5d1ef → #b1c0e6 → #bccae9. The
                  // solid #bccae9 still felt too bright sitting on
                  // the translucent-white bar, so we switched to a
                  // lavender at lower opacity — the same hue family
                  // shows through softer because the bar's
                  // backdrop-blur tinted white blends in. 75%
                  // opacity reads as "lit" without competing with
                  // the active icon for attention.
                  backgroundColor: "rgba(188, 202, 233, 0.75)",
                }}
                initial={false}
                animate={{ x: pill.x, width: pill.w }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 42,
                  mass: 1,
                }}
              />
            )}

            {TABS.map((tab) => (
              <TabItem
                key={tab.key}
                tab={tab}
                active={tab.key === active}
                anchorRef={(el) => {
                  tabRefs.current[tab.key] = el;
                }}
              />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

function TabItem({
  tab,
  active,
  anchorRef,
}: {
  tab: Tab;
  active: boolean;
  anchorRef: (el: HTMLAnchorElement | null) => void;
}) {
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    if (!pressed) return;
    const t = setTimeout(() => setPressed(false), 160);
    return () => clearTimeout(t);
  }, [pressed]);

  return (
    <Link
      ref={anchorRef}
      href={tab.href}
      aria-current={active ? "page" : undefined}
      onPointerDown={() => {
        setPressed(true);
        // Only buzz when actually switching tabs, not re-tapping the
        // current one — keeps the feedback meaningful, not noisy.
        if (!active) haptics.selection();
      }}
      className="relative flex h-full flex-1 min-w-0 flex-col items-center justify-center"
      style={{
        gap: ICON_LABEL_GAP,
        color: "var(--mrq-blue)",
        transform: pressed ? "scale(0.94)" : "scale(1)",
        transition: "transform 160ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="relative"
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
      >
        <AnimatePresence initial={false}>
          {active ? (
            <motion.span
              key="active"
              aria-hidden
              className="absolute inset-0 bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${tab.iconActive}")`,
                backgroundSize: "contain",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <motion.span
              key="inactive"
              aria-hidden
              className="absolute inset-0 bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${tab.iconInactive}")`,
                backgroundSize: "contain",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>
      </div>

      <span
        className="font-extrabold whitespace-nowrap"
        style={{
          fontSize: LABEL_FONT_SIZE,
          lineHeight: `${LABEL_LINE_H}px`,
          letterSpacing: "0.2px",
        }}
      >
        {tab.label}
      </span>
    </Link>
  );
}

// Suppress unused warning for OUTER_TABS — kept exported in case
// future logic needs to query whether a tab is outer.
void OUTER_TABS;
