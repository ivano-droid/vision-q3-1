"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { haptics } from "@/lib/haptics";

/**
 * Persistent bottom navigation — Figma 226:52056.
 *
 * Reproduces the exact pill geometry of the Figma source, sized
 * to match ResumePlayingBar so both floating elements line up.
 *
 * Bar shape (351 × 60, rounded-full):
 *
 *   ╭───────────────────────────────────────────╮
 *   │ ╭─────╮         ╭───────╮         ╭─────╮│
 *   │ │ ⌂   │        🔍               🎁      ││ ←─┐
 *   │ ╰─────╯         ╰───────╯         ╰─────╯│   │
 *   │  My Q            Explore           Rewards│  pills
 *   ╰───────────────────────────────────────────╯
 *      ▲                  ▲                  ▲
 *      80                 84                 80
 *
 * Spacing rule (the key insight from Figma):
 *   • Outer pills (My Q, Rewards) are PINNED at 4px from the bar's
 *     outer edge, and are 80px wide. So they read as having an
 *     intentional gap to the bar's rounded end-cap, identical on
 *     both ends.
 *   • Inner pill (Explore) is 84px wide and centred on its column.
 *     The extra 4px of width pulls it visually wider than the outer
 *     pills, which compensates for the lack of a bar-edge "anchor"
 *     on either side.
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

// ── Geometry ──────────────────────────────────────────────────────
// 3-tab bar: narrower than the original 4-tab Figma spec.
// Pill is always centred on whichever tab column is active — no
// edge-pinning needed with only three equally-spaced items.
const BAR_MAX_W = 272;
const BAR_H = 56;
const BAR_PAD_L = 4;
const BAR_PAD_R = 4; // symmetric
const TAB_GAP = 4;
const PILL_W = 84; // single width for all tabs
const PILL_H = 48;
const PILL_TOP = 4;
const ICON_SIZE = 24;
const ICON_LABEL_GAP = 2;
const LABEL_FONT_SIZE = 11;
const LABEL_LINE_H = 16;

// ── Tokens (single source of truth) ────────────────────────────────
// All colours / effects for the bar live here so the component can be
// isolated and its states + variants shown cleanly (e.g. for handoff).
type Surface = "light" | "rewards" | "arena";

// Frosted bar surface — per surface. Rewards is a touch less
// transparent so the bar holds up against its dark background.
const BAR_BG: Record<Surface, string> = {
  light: "rgba(255, 255, 255, 0.6)",
  rewards: "rgba(255, 255, 255, 0.72)",
  arena: "rgba(255, 255, 255, 0.6)",
};
const BAR_BLUR = "blur(20px) saturate(140%)"; // backdrop-filter
const BAR_SHADOW = "0 4px 22px 0 rgba(17, 17, 17, 0.12)";

// Active-tab pill — lavender on light pages; white on dark surfaces
// (rewards/arena) where lavender washes out to light blue.
const PILL_BG_LIGHT = "rgba(188, 202, 233, 0.75)";
const PILL_BG_DARK = "rgba(255, 255, 255, 0.92)";

// Scrim (the fade behind the floating bar). One entry per surface; the
// colour matches that page's bottom edge so the fade doesn't smear.
// `height` is the px height of the colour fade — rewards is a little
// shorter than the default.
const SCRIM: Record<Surface, { solid: string; fade: string; height: number }> = {
  light: { solid: "#ffffff", fade: "rgba(255, 255, 255, 0)", height: 90 },
  rewards: { solid: "#181f43", fade: "rgba(24, 31, 67, 0)", height: 70 },
  arena: { solid: "#0C2287", fade: "rgba(12, 34, 135, 0)", height: 90 },
};
const DARK_SURFACES: Surface[] = ["rewards", "arena"];

type TabKey = "lobby" | "search" | "rewards";

type Tab = {
  key: TabKey;
  href: string;
  label: string;
  iconInactive: string;
  iconActive: string;
};


const TABS: Tab[] = [
  {
    key: "lobby",
    href: "/",
    label: "My Q",
    iconInactive: "/assets/nav-icons/my-q-inactive.svg",
    iconActive: "/assets/nav-icons/my-q-active.svg",
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
  if (pathname.startsWith("/rewards")) return "rewards";
  if (pathname.startsWith("/search")) return "search";
  // /casino, /live, /bingo and /arena are all opened from the Explore
  // page (Start Browsing tiles + mega-cards), so they keep Explore lit.
  if (pathname.startsWith("/casino")) return "search";
  if (pathname.startsWith("/live")) return "search";
  if (pathname.startsWith("/bingo")) return "search";
  if (pathname.startsWith("/arena")) return "search";
  return "lobby";
}

// Progressive ("gradient") blur — a stack of backdrop-filter layers,
// each masked to an overlapping band, with the blur strongest at the
// bottom edge and fading to none toward the top. Behind the floating
// bottom nav on every route, so content scrolling under the bar
// dissolves into a frosted fade instead of a hard cut. Percentages are
// of the layer's own height (the scrim region).
const PROGRESSIVE_BLUR_LAYERS: { blur: number; mask: string }[] = [
  { blur: 24, mask: "linear-gradient(to top, #000 0%, #000 12.5%, transparent 25%)" },
  { blur: 16, mask: "linear-gradient(to top, transparent 0%, #000 12.5%, #000 25%, transparent 37.5%)" },
  { blur: 10, mask: "linear-gradient(to top, transparent 12.5%, #000 25%, #000 37.5%, transparent 50%)" },
  { blur: 6, mask: "linear-gradient(to top, transparent 25%, #000 37.5%, #000 50%, transparent 62.5%)" },
  { blur: 3, mask: "linear-gradient(to top, transparent 37.5%, #000 50%, #000 62.5%, transparent 75%)" },
  { blur: 1.5, mask: "linear-gradient(to top, transparent 50%, #000 62.5%, #000 75%, transparent 87.5%)" },
  { blur: 0.5, mask: "linear-gradient(to top, transparent 62.5%, #000 75%, #000 100%)" },
];

function ProgressiveBlur() {
  return (
    // Bottom-anchored, a little shorter than the full scrim region so the
    // blur band doesn't reach as high up the page.
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0"
      style={{ height: "calc(var(--bottom-nav-h) + 16px)" }}
    >
      {PROGRESSIVE_BLUR_LAYERS.map((layer, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            maskImage: layer.mask,
            WebkitMaskImage: layer.mask,
          }}
        />
      ))}
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const active = activeTabFor(pathname);
  // Which surface the bar sits on — picks the scrim colour and the
  // active-pill colour from the tokens above. The scrim renders on
  // every route EXCEPT /discover (see skipScrim below).
  const surface: Surface = pathname.startsWith("/rewards")
    ? "rewards"
    : pathname.startsWith("/arena")
      ? "arena"
      : "light";
  const { solid: scrimSolid, fade: scrimFade, height: scrimHeight } = SCRIM[surface];
  const barBg = BAR_BG[surface];
  const pillBg = DARK_SURFACES.includes(surface) ? PILL_BG_DARK : PILL_BG_LIGHT;

  const rowRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<TabKey, HTMLAnchorElement | null>>({
    lobby: null,
    search: null,
    rewards: null,
  });

  // Pill is always centred on the active tab column.
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      const el = tabRefs.current[active];
      if (!row || !el) return;
      const rowRect = row.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const centre = elRect.left - rowRect.left + elRect.width / 2;
      setPill({ x: centre - PILL_W / 2, w: PILL_W });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // /discover (Top Picks) opts out of the scrim entirely. The reels
  // are full-bleed video and the design now wants edge-to-edge frame
  // with NO dark fade behind the nav — the floating pill carries its
  // own translucent-white surface + backdrop-blur, which keeps the
  // tab icons legible against arbitrary video frames without a
  // page-coloured gradient backing it.
  const skipScrim = pathname.startsWith("/discover");

  return (
    <>
      {/* SCRIM — page-coloured gradient fade above the pill.
          Rendered on every route EXCEPT /discover; colour swaps via
          scrimSolid/scrimFade so /rewards uses the dark-blue match
          and every other route uses the existing white fade. */}
      {!skipScrim && (
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
            className="absolute inset-x-0 bottom-0"
            style={{
              height: scrimHeight,
              background: `linear-gradient(to top, ${scrimSolid} 30%, ${scrimFade} 100%)`,
            }}
          />
          {/* Progressive blur on top of the colour fade — frosted at the
              bottom edge, dissolving to clear toward the top. */}
          <ProgressiveBlur />
        </div>
      )}

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
              width: BAR_MAX_W,
              height: BAR_H,
              paddingLeft: BAR_PAD_L,
              paddingRight: BAR_PAD_R,
              gap: TAB_GAP,
              backgroundColor: barBg,
              backdropFilter: BAR_BLUR,
              WebkitBackdropFilter: BAR_BLUR,
              boxShadow: BAR_SHADOW,
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
                  // Lavender on light pages, white on dark surfaces —
                  // see PILL_BG_* tokens at the top of the file.
                  backgroundColor: pillBg,
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
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!pressed) return;
    const t = setTimeout(() => setPressed(false), 160);
    return () => clearTimeout(t);
  }, [pressed]);

  return (
    <Link
      ref={anchorRef}
      data-component="ListItem"
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
        data-component="Icon"
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
                transformOrigin: "bottom center",
              }}
              // Bouncy pop: the active icon springs up from small with a
              // slight wiggle as it crossfades in. Low damping gives the
              // playful overshoot; opacity fades faster than the spring so
              // the swap reads clean. Felt on every tab switch.
              initial={
                reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -12 }
              }
              animate={
                reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }
              }
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              transition={
                reduce
                  ? { duration: 0.18 }
                  : {
                      opacity: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
                      scale: {
                        type: "spring",
                        stiffness: 400,
                        damping: 12,
                        mass: 0.8,
                      },
                      rotate: {
                        type: "spring",
                        stiffness: 370,
                        damping: 11,
                        mass: 0.8,
                      },
                    }
              }
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
        data-component="Typography"
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

