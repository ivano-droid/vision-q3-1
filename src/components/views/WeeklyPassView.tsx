"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Weekly Pass landing — Figma 266:47065 ("Plus expanded").
 *
 *   ┌──────────────────────────────┐
 *   │  ←   ( Plus )  Flex  Premium │  ← brand-blue header band
 *   │                              │
 *   │  ┌────────────────────────┐  │
 *   │  │ Plus  [Worth £50]      │  │
 *   │  │  ✓ Q's cashback        │  │  ← benefits card
 *   │  │  ✓ 100 Spins or Chips  │  │
 *   │  │  ✓ Withdrawal guar.    │  │      💎 ← gem decoration
 *   │  │  ✓ Prizepool           │  │      (sits over the seam)
 *   │  │  ✓ Coffee voucher      │  │
 *   │  └────────────────────────┘  │
 *   │                              │
 *   │   What you miss              │
 *   │  ┌────────────────────────┐  │
 *   │  │  ◯ Netflix       ✓     │  │  ← comparison card
 *   │  │  ◯ Spotify       ✓     │  │
 *   │  │  ◯ Disney+       ✓     │  │
 *   │  └────────────────────────┘  │
 *   │                              │
 *   │  [ One-time ]  [ Monthly ]   │  ← sticky footer
 *   │  [   Start free trial   ]    │
 *   └──────────────────────────────┘
 *
 * The Plus tab is the only one wired with full content in this
 * build. Flex / Premium tabs swap the title + benefits list with
 * placeholder data so the tab interaction still feels real on tap.
 */

const PAGE_BG = "#f2f3f3";
const HEADER_BG = "#0322ab"; // Figma's deeper brand-blue (slightly darker than --mrq-blue)
const TIER_TEXT = "#0c2287"; // --mrq-blue-dark / Brand/900
const BODY_TEXT = "#0e1120"; // text/primary
const TERTIARY_TEXT = "#676972"; // text/tertiary

type Tier = "plus" | "flex" | "premium";
type Plan = "once" | "monthly";

const TIERS: ReadonlyArray<{ id: Tier; label: string }> = [
  { id: "plus", label: "Plus" },
  { id: "flex", label: "Flex" },
  { id: "premium", label: "Premium" },
];

// Bullet styles. Plus and Premium use a filled brand-blue circle
// with a white tick; Flex uses small radio buttons (selected or
// unselected) so the user can pick which benefits to "claim" at
// the £2 paywall (mock interaction).
type Bullet = "tick" | "radio-on" | "radio-off";

type Benefit = {
  title: string;
  body?: string;
  /** Per-row pill (e.g. "£2 worth £10" on the Flex tier). */
  pill?: string;
  /** Renders the Netflix/Spotify/Disney+ icon row in place of body. */
  subscriptions?: true;
  /** Override the tier's default bullet style. */
  bullet?: Bullet;
};

// Plus benefits — copy lifted from Figma 266:47075.
const PLUS_BENEFITS: ReadonlyArray<Benefit> = [
  {
    title: "Q's cashback",
    body: "On real money loses, 5% up to £10.",
  },
  {
    title: "100 Spins or 100 Chips",
    body: "On a game of your choice every Friday.",
  },
  {
    title: "Withdrawal guarantee",
    body: "If we're not instant, you get £30.",
  },
  {
    title: "Prizepool",
    body: "Get access to an exclusive monthly Prizepool.",
  },
  {
    title: "Coffee voucher",
    body: "In any of the selected stores.",
  },
];

// Flex benefits — Figma 271:61827. Each row carries a "£2 worth £10"
// pill and a radio button (the first two pre-selected to model the
// pay-per-benefit price). The 4th row swaps its body text for the
// brand-icon row.
const FLEX_BENEFITS: ReadonlyArray<Benefit> = [
  {
    title: "Q's cashback",
    body: "Wager £20, get £1 back each week.",
    pill: "£2 worth £10",
    bullet: "radio-on",
  },
  {
    title: "100 Spins or 100 Chips",
    body: "On a game of your choice every Friday.",
    pill: "£2 worth £10",
    bullet: "radio-on",
  },
  {
    title: "Prizepool",
    body: "Get access to an exclusive weekly Prizepool.",
    pill: "£2 worth £10",
    bullet: "radio-off",
  },
  {
    title: "Includes 3 subscriptions",
    subscriptions: true,
    bullet: "radio-off",
  },
  {
    title: "Withdrawal guarantee",
    body: "If we're not instant, you get £30.",
    pill: "£2 worth £10",
    bullet: "radio-off",
  },
];

// Premium benefits — Figma 271:62102. All rows ticked; one of them
// renders the brand-icon row in place of body text.
const PREMIUM_BENEFITS: ReadonlyArray<Benefit> = [
  {
    title: "Prizepool",
    body: "Get access to an exclusive weekly Prizepool.",
  },
  {
    title: "100 Spins or 100 Chips",
    body: "On a game of your choice every Friday.",
  },
  {
    title: "Includes 3 subscriptions",
    subscriptions: true,
  },
  {
    title: "Access to exclusive games",
    body: "Games you won't find anywhere else.",
  },
  {
    title: "Q's cashback",
    body: "Wager £20, get £1 back each week.",
  },
];

// Per-tier prices for the sticky footer.
const PRICING: Record<Tier, { once: string; monthly: string }> = {
  plus: { once: "£10 / mo", monthly: "£100 / year" },
  flex: { once: "£10 / mo", monthly: "£100 / year" },
  premium: { once: "£50 / mo", monthly: "£500 / year" },
};

// Per-tier "Worth" badge (none for Flex — it's pay-as-you-go).
const WORTH: Record<Tier, string | undefined> = {
  plus: "Worth £50",
  flex: undefined,
  premium: "Worth £100",
};

// Per-tier gem PNG (Figma 266:47154 / 271:61796 / 271:61983).
const GEMS: Record<Tier, string> = {
  plus: "/assets/passes/plus-gem.png",
  flex: "/assets/passes/flex-gem.png",
  premium: "/assets/passes/premium-gem.png",
};


// "What you miss" comparison list — three monthly services at
// roughly the same price as a Plus pass.
const COMPARABLES: ReadonlyArray<{
  brand: "netflix" | "spotify" | "disney";
  name: string;
  sub: string;
}> = [
  { brand: "netflix", name: "Netflix", sub: "Monthly pass" },
  { brand: "spotify", name: "Spotify", sub: "Individual monthly plan" },
  { brand: "disney", name: "Disney+", sub: "Monthly pass" },
];

export function WeeklyPassView() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("plus");
  const [plan, setPlan] = useState<Plan>("once");
  const tierIndex = TIERS.findIndex((t) => t.id === tier);

  // Horizontal swipe rail — three panels (one per tier) live side
  // by side inside an overflow:hidden viewport; the motion.div's
  // `x` motion-value translates the rail to bring the active panel
  // into view. Width is measured on mount + resize so the snap
  // distance matches the actual mobile-frame column rather than
  // assuming 375px.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      if (viewportRef.current) {
        const w = viewportRef.current.clientWidth;
        setPanelWidth(w);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Force the document scroll to the top whenever this view
  // mounts. Without this the page would inherit whatever scroll
  // position the previous route was sitting at, so opening the
  // Weekly Pass from a scrolled-down lobby would dump the user
  // straight at the bottom (price tiles + CTA) instead of the
  // top (Weekly Pass header).
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Snap x to the active tier whenever the tier changes (tap on
  // a tier pill) or the panel width changes (resize). The drag
  // handler below also calls setTier, which triggers this effect
  // — so swipe-release re-uses the same snap path.
  useEffect(() => {
    if (panelWidth === 0) return;
    animate(x, -tierIndex * panelWidth, {
      type: "spring",
      stiffness: 360,
      damping: 36,
      mass: 0.8,
    });
  }, [tierIndex, panelWidth, x]);

  const dismiss = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    // Page entrance: dissolves in while drifting up a touch — a
    // softer arrival than the previous full slide-up from the
    // viewport bottom. The transform still creates a containing
    // block for any `position: fixed` descendants (the bottom
    // CTA), so the footer is anchored to this motion.div rather
    // than the viewport.
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backgroundColor: PAGE_BG,
        // Reserve enough room at the bottom of the scroll area so the
        // sticky footer doesn't cover the last comparison card. ~220px
        // = footer body (~150) + breathing room + safe-area.
        paddingBottom: "calc(env(safe-area-inset-bottom) + 220px)",
        minHeight: "100vh",
      }}
    >
      {/* ────────────────────────────────────────────────────────
          Top section — one continuous brand-blue band that holds
          the chrome (title + X + tier tabs) AND extends down past
          it with curved bottom corners. The content underneath is
          pulled up with negative margin so the Plus card overlaps
          the bottom of this band, matching Figma 266:47065 where
          the curved blue sits behind the top of the Plus card.
          Whole composition scrolls together — no sticky chrome —
          so it reads as one cohesive page rather than a separate
          floating bar.
          ──────────────────────────────────────────────────────── */}
      <section
        className="relative w-full"
        style={{
          backgroundColor: HEADER_BG,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          paddingTop: "calc(env(safe-area-inset-top) + 10px)",
          paddingLeft: 16,
          paddingRight: 16,
          // Extra blue below the tier tabs so the curve carries on
          // past the chrome and sits behind the Plus card's top
          // section. Combined with content marginTop:-72, the Plus
          // card overlaps the band by ~72px on entry.
          paddingBottom: 96,
        }}
      >
        {/* Title row — "Weekly Pass" left, X close right. */}
        <div className="flex items-center justify-between" style={{ height: 40 }}>
          <h1
            style={{
              fontFamily: "'Gilroy', sans-serif",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 1.6,
              letterSpacing: 0.1,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Weekly Pass
          </h1>
          <button
            type="button"
            aria-label="Close"
            onClick={dismiss}
            className="grid place-items-center -mr-[4px] p-[8px] rounded-full active:scale-[0.92] transition-transform"
            style={{ color: "#ffffff" }}
          >
            <XIcon className="size-[20px] text-white" />
          </button>
        </div>

        {/* Tier tabs — three fixed-width pills (109px × 34px,
            Figma 266:47148) sitting in a row with 8px gaps. Active
            pill flips to white-90%; the rest stay at white-40%. */}
        <div className="flex items-center" style={{ gap: 8, marginTop: 12 }}>
          {TIERS.map((t) => {
            const active = t.id === tier;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTier(t.id)}
                className="flex items-center justify-center rounded-[16px] transition-colors"
                style={{
                  width: 109,
                  height: 34,
                  backgroundColor: active
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(255, 255, 255, 0.4)",
                  color: TIER_TEXT,
                  fontFamily: "'Gilroy', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: 0.1,
                }}
                aria-pressed={active}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
            Swipeable tier panels — three full-width panels (Plus,
            Flex, Premium) live side-by-side inside an overflow-
            hidden viewport. Dragging horizontally past a small
            offset/velocity threshold steps to the neighbouring
            tier; the pill row above stays in sync via the shared
            `tier` state.

            marginTop: -72 pulls the rail up under the bottom of
            the blue band so the curved background sits behind the
            top ~72px of the active panel — same overlap that was
            here before, just one level higher in the tree.
          ──────────────────────────────────────────────────────── */}
      <div
        ref={viewportRef}
        className="relative overflow-hidden"
        style={{ marginTop: -72 }}
      >
        <motion.div
          className="flex"
          style={{ x, width: panelWidth * TIERS.length, touchAction: "pan-y" }}
          drag="x"
          dragConstraints={{
            left: -((TIERS.length - 1) * panelWidth),
            right: 0,
          }}
          dragElastic={0.18}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const SWIPE_OFFSET = 50; // px
            const SWIPE_VELOCITY = 350; // px/s
            const offset = info.offset.x;
            const velocity = info.velocity.x;
            let nextIndex = tierIndex;
            if (
              (offset < -SWIPE_OFFSET || velocity < -SWIPE_VELOCITY) &&
              tierIndex < TIERS.length - 1
            ) {
              nextIndex = tierIndex + 1;
            } else if (
              (offset > SWIPE_OFFSET || velocity > SWIPE_VELOCITY) &&
              tierIndex > 0
            ) {
              nextIndex = tierIndex - 1;
            }
            if (nextIndex === tierIndex) {
              // Didn't commit a swipe — snap back to the current
              // tier's resting position.
              animate(x, -tierIndex * panelWidth, {
                type: "spring",
                stiffness: 360,
                damping: 36,
              });
            } else {
              setTier(TIERS[nextIndex].id);
            }
          }}
        >
          {TIERS.map((t) => {
            const benefits =
              t.id === "plus"
                ? PLUS_BENEFITS
                : t.id === "flex"
                  ? FLEX_BENEFITS
                  : PREMIUM_BENEFITS;
            const defaultBullet: Bullet =
              t.id === "flex" ? "radio-off" : "tick";
            return (
              <div
                key={t.id}
                className="shrink-0 flex flex-col"
                style={{
                  width: panelWidth || "100%",
                  paddingLeft: 16,
                  paddingRight: 16,
                  gap: 16,
                }}
              >
                <BenefitsCard
                  title={t.label}
                  worth={WORTH[t.id]}
                  benefits={benefits}
                  defaultBullet={defaultBullet}
                  // Pass the global active tier as the animation
                  // key so the benefits list reruns its staggered
                  // rise-up animation every time the user changes
                  // tabs — a visual nudge that something changed.
                  animationKey={tier}
                />
                {/* "What you miss" comparison card — only the Plus
                    tier carries the price-comparison story; Flex
                    and Premium don't pitch it. */}
                {t.id === "plus" && (
                  <section className="flex flex-col" style={{ gap: 8 }}>
                    <h2
                      className="text-[16px]"
                      style={{
                        fontFamily: "'Gilroy', sans-serif",
                        fontWeight: 700,
                        letterSpacing: 0.1,
                        color: TERTIARY_TEXT,
                        lineHeight: 1.6,
                      }}
                    >
                      What you miss
                    </h2>
                    <ComparablesCard />
                  </section>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* ────────────────────────────────────────────────────────
          Floating corner gem — lives outside the swipe rail's
          overflow:hidden so its peek above the benefits card
          isn't clipped. Anchored at the same visual spot as the
          card's top-right corner (top: ~safe-area + 100, right:
          ~20). Asset cross-fades when the tier changes so the
          yellow / pink / blue gem swap reads as a single morph.
          ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tier}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            // safe-area + 105 = previous resting position + 5px so
            // the gem sits a touch lower on the seam. Size shaved
            // 5% (124 → 118) for a slightly tidier ornament.
            top: "calc(env(safe-area-inset-top) + 105px)",
            right: 20,
            width: 118,
            height: 118,
            transform: "rotate(15deg)",
            zIndex: 6,
          }}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
          }}
          exit={{
            opacity: 0,
            scale: 0.92,
            transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GEMS[tier]}
            alt=""
            draggable={false}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────
          Sticky footer — price selector + Start free trial CTA.
          Clamped to the mobile-frame column via --frame-right-offset
          so on desktop it hugs the 375px column rather than the
          whole viewport.
          ──────────────────────────────────────────────────────── */}
      <PassesFooter plan={plan} setPlan={setPlan} tier={tier} />
    </motion.div>
  );
}

/* ============================================================
   Benefits card — Plus tier full content.
   ============================================================ */
function BenefitsCard({
  title,
  worth,
  benefits,
  defaultBullet,
  animationKey,
}: {
  title: string;
  /** Optional "Worth £50"-style pill next to the tier title. */
  worth?: string;
  benefits: ReadonlyArray<Benefit>;
  /** Bullet style used when a benefit doesn't specify its own. */
  defaultBullet: Bullet;
  /** Changes whenever the active tier changes — used as a remount
   *  key on the benefits list so the staggered rise animation
   *  replays. */
  animationKey: string;
}) {
  return (
    <div
      className="relative bg-white"
      style={{
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >

      {/* Title row: tier name + optional Worth pill. Right padded so
          the tier name doesn't collide with the corner gem. */}
      <div className="flex items-center" style={{ gap: 8, paddingRight: 96 }}>
        <h1
          style={{
            fontFamily: "'Gilroy', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            color: TIER_TEXT,
            letterSpacing: 0.1,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {worth && <WorthPill>{worth}</WorthPill>}
      </div>

      {/* Benefit list — wrapped in a motion.ul that remounts on
          tier change (key={animationKey}). Each row rises into
          place with a small Y offset + fade and a staggered delay
          so the user sees a subtle "something just changed" cue
          when they swipe / tap between tabs. */}
      <motion.ul
        key={animationKey}
        className="flex flex-col"
        style={{ gap: 16, margin: 0, padding: 0 }}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.04, delayChildren: 0.04 },
          },
        }}
      >
        {benefits.map((b) => {
          const bullet: Bullet = b.bullet ?? defaultBullet;
          return (
            <motion.li
              key={b.title}
              className="flex items-start"
              style={{ gap: 8, listStyle: "none" }}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.32,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
            >
              <span
                className="shrink-0 flex items-center justify-center"
                style={{ width: 24, height: 24, marginTop: 4 }}
              >
                <BulletGlyph variant={bullet} />
              </span>
              <div className="flex flex-col" style={{ flex: "1 0 0" }}>
                {/* Title + optional per-row pill. */}
                <div
                  className="flex items-center flex-wrap"
                  style={{ gap: 8 }}
                >
                  <span
                    style={{
                      fontFamily: "'Gilroy', sans-serif",
                      fontWeight: 800,
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: TIER_TEXT,
                    }}
                  >
                    {b.title}
                  </span>
                  {b.pill && <WorthPill light>{b.pill}</WorthPill>}
                </div>
                {/* Body: either a short paragraph (most rows) or the
                    Netflix/Spotify/Disney+ icon row (one row per
                    Flex/Premium panel). */}
                {b.subscriptions ? (
                  <div
                    className="flex items-center"
                    style={{ gap: 4, marginTop: 4 }}
                  >
                    <SubscriptionIcon brand="netflix" />
                    <SubscriptionIcon brand="spotify" />
                    <SubscriptionIcon brand="disney" />
                  </div>
                ) : (
                  <span
                    style={{
                      fontFamily: "'Gilroy', sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: 1.6,
                      letterSpacing: 0.1,
                      color: BODY_TEXT,
                    }}
                  >
                    {b.body}{" "}
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        textDecoration: "underline",
                        color: BODY_TEXT,
                      }}
                    >
                      T&amp;Cs
                    </a>
                  </span>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ul>

      {/* Fine print under the list */}
      <p
        style={{
          fontFamily: "'Gilroy', sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: 1.6,
          letterSpacing: 0.2,
          color: TERTIARY_TEXT,
          margin: 0,
        }}
      >
        Your purchase will be available in your transaction history at any
        time.{" "}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ textDecoration: "underline", color: TERTIARY_TEXT }}
        >
          T&amp;Cs
        </a>{" "}
        apply.
      </p>
    </div>
  );
}

/* ============================================================
   "What you miss" comparison card.
   Three rows of comparable monthly subscriptions, each with a
   check on the right showing the equivalent value.
   ============================================================ */
function ComparablesCard() {
  return (
    <div
      className="bg-white"
      style={{
        borderRadius: 16,
        padding: 16,
        width: "100%",
      }}
    >
      <div className="flex" style={{ alignItems: "stretch" }}>
        <div className="flex flex-col" style={{ flex: "1 0 0", gap: 16 }}>
          {COMPARABLES.map((c) => (
            <div
              key={c.brand}
              className="flex items-start"
              style={{ gap: 8 }}
            >
              <span
                className="shrink-0"
                style={{ width: 24.49, height: 24.49 }}
              >
                <BrandIcon brand={c.brand} />
              </span>
              <div className="flex flex-col" style={{ flex: "1 0 0" }}>
                <span
                  style={{
                    fontFamily: "'Gilroy', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: TIER_TEXT,
                  }}
                >
                  {c.name}
                </span>
                <span
                  style={{
                    fontFamily: "'Gilroy', sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: 1.6,
                    letterSpacing: 0.1,
                    color: BODY_TEXT,
                  }}
                >
                  {c.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right-rail of checks. Justify-between so the three checks
            align vertically with the three rows on the left. */}
        <div
          className="flex flex-col items-end justify-between shrink-0"
          style={{ width: 28, alignSelf: "stretch" }}
        >
          {COMPARABLES.map((c) => (
            <CheckOutline key={c.brand} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Placeholder card for Flex / Premium tabs (no content yet).
   ============================================================ */
/* ============================================================
   Small pill used both for the tier "Worth £50" badge and the
   per-row "£2 worth £10" pill on the Flex panel. `light` swaps
   the border colour to the lighter brand stroke used in Flex.
   ============================================================ */
function WorthPill({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <span
      className="flex items-center justify-center shrink-0"
      style={{
        paddingLeft: 6.316,
        paddingRight: 6.316,
        borderRadius: 6.316,
        border: light
          ? "1px solid #ced5f5"
          : "1px solid rgba(12, 34, 135, 0.25)",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: TIER_TEXT,
        fontFamily: "'Gilroy', sans-serif",
        fontWeight: 800,
        fontSize: 12.632,
        letterSpacing: 0.21,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   Benefit row bullet — switches between the brand-blue tick
   badge (Plus / Premium) and a radio button (Flex), where the
   radio can be filled (selected) or empty.
   ============================================================ */
function BulletGlyph({ variant }: { variant: Bullet }) {
  if (variant === "tick") return <TickBadge />;
  // Radio variants — 24×24 circle, brand-blue when selected, grey
  // when not. Selected has a filled brand-blue dot in the middle.
  const selected = variant === "radio-on";
  return (
    <span
      className="relative block rounded-full"
      style={{
        width: 24,
        height: 24,
        backgroundColor: "#f2f3f3",
        border: selected ? `2px solid ${HEADER_BG}` : "2px solid #cccdd0",
      }}
    >
      {selected && (
        <span
          className="absolute rounded-full"
          style={{
            top: 4,
            left: 4,
            width: 12,
            height: 12,
            backgroundColor: HEADER_BG,
          }}
        />
      )}
    </span>
  );
}

/* ============================================================
   "Includes 3 subscriptions" inline icon row — Netflix /
   Spotify / Disney+ rendered side-by-side with a small overlap
   so they read as a stacked group.
   ============================================================ */
function SubscriptionIcon({
  brand,
}: {
  brand: "netflix" | "spotify" | "disney";
}) {
  return (
    <span
      className="block shrink-0"
      style={{
        width: 24,
        height: 24,
        // -10px overlap between consecutive icons. The CSS gap on
        // the parent is 4, so each icon's effective horizontal
        // contribution is 24 - 10 + 4 = 18px.
        marginRight: -10,
      }}
    >
      <BrandIcon brand={brand} />
    </span>
  );
}

/* ============================================================
   Sticky footer — price selector (One-time / Monthly) and
   the "Start free trial" CTA. Position fixed; clamped to the
   mobile-frame column on desktop via --frame-right-offset.
   ============================================================ */
function PassesFooter({
  plan,
  setPlan,
  tier,
}: {
  plan: Plan;
  setPlan: (p: Plan) => void;
  tier: Tier;
}) {
  const prices = PRICING[tier];
  return (
    <div
      className="fixed bottom-0 z-30"
      style={{
        left: "var(--frame-right-offset, 0px)",
        right: "var(--frame-right-offset, 0px)",
        backgroundColor: PAGE_BG,
        paddingTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
      }}
    >
      {/* Soft gradient fade above the footer. We deliberately let
          the gradient max out around 65% opacity (instead of solid
          PAGE_BG) so content scrolling underneath stays partially
          visible — users could otherwise mistake the opaque band
          for the end of the page and miss the rest of the list. */}
      <div
        aria-hidden
        className="absolute"
        style={{
          top: -72,
          left: 0,
          right: 0,
          height: 72,
          background:
            "linear-gradient(to top, rgba(242, 243, 243, 0.65), rgba(242, 243, 243, 0))",
          pointerEvents: "none",
        }}
      />

      {/* Plan toggle — two pill tiles side-by-side. The selected
          tile gets the heavier 2px brand border + brand-blue text;
          the other stays at 1px brand-light. */}
      <div
        className="flex justify-between w-full"
        style={{ gap: 12 }}
      >
        <PlanTile
          selected={plan === "once"}
          onClick={() => setPlan("once")}
          label="One-time buy"
          price={prices.once}
        />
        <PlanTile
          selected={plan === "monthly"}
          onClick={() => setPlan("monthly")}
          label="Monthly"
          price={prices.monthly}
          badge="Save 20%"
        />
      </div>

      {/* Start free trial — full-width brand-blue button */}
      <button
        type="button"
        className="w-full active:scale-[0.985] transition-transform"
        style={{
          backgroundColor: HEADER_BG,
          borderRadius: 12,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 28,
          paddingRight: 32,
          color: "white",
          fontFamily: "'Gilroy', sans-serif",
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: -0.2,
          lineHeight: "24px",
        }}
        onClick={() => {
          if (typeof window !== "undefined") {
            // eslint-disable-next-line no-console
            console.log("[WeeklyPass] start free trial →", plan);
          }
        }}
      >
        Start free trial
      </button>
    </div>
  );
}

function PlanTile({
  selected,
  onClick,
  label,
  price,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  price: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start bg-white active:scale-[0.985] transition-transform"
      style={{
        flex: "1 1 0",
        borderRadius: 16,
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 14,
        paddingRight: 14,
        border: selected
          ? "2px solid var(--mrq-blue, #0a2ecb)"
          : "1px solid #ced5f5",
        boxShadow: "0px 8px 6px rgba(204, 205, 208, 0.32)",
        gap: 4,
        textAlign: "left",
      }}
      aria-pressed={selected}
    >
      <div className="flex items-center" style={{ gap: 4 }}>
        <span
          style={{
            fontFamily: "'Gilroy', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 1.6,
            letterSpacing: 0.1,
            color: TIER_TEXT,
          }}
        >
          {label}
        </span>
        {badge && (
          <span
            className="flex items-center justify-center"
            style={{
              paddingLeft: 5,
              paddingRight: 5,
              paddingTop: 1,
              paddingBottom: 1,
              borderRadius: 6,
              border: "1px solid rgba(12, 34, 135, 0.25)",
              backgroundColor: "rgba(206, 213, 245, 0.4)",
              color: TIER_TEXT,
              fontFamily: "'Gilroy', sans-serif",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: 0.2,
              lineHeight: 1.4,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: "'Gilroy', sans-serif",
          fontWeight: 800,
          fontSize: 16,
          lineHeight: 1.6,
          color: TIER_TEXT,
        }}
      >
        {price}
      </span>
    </button>
  );
}

/* ============================================================
   Inline SVG art
   ============================================================ */

/** Brand-blue circle with a white tick — for the Plus benefits list. */
function TickBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden
      focusable={false}
    >
      <circle cx="12" cy="12" r="12" fill={HEADER_BG} />
      <path
        d="M6.5 12.5L10 16L17 8.5"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Outline tick — for the right rail of the comparison card. */
function CheckOutline() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden
      focusable={false}
    >
      <path
        d="M5 12.5L10 17.5L19 7.5"
        fill="none"
        stroke={TIER_TEXT}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* ============================================================
   Brand mark icons for the comparison row. Stylised; each is a
   recognisable colour + simple glyph rather than the real brand
   logo (prototype-safe).
   ============================================================ */
function BrandIcon({ brand }: { brand: "netflix" | "spotify" | "disney" }) {
  if (brand === "netflix") {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
        <rect width="24" height="24" rx="5" fill="#000000" />
        <path
          d="M8.4 5.6 V18.4 H10 V11.2 L13.6 18.4 H15.6 V5.6 H14 V12.8 L10.4 5.6 Z"
          fill="#E50914"
        />
      </svg>
    );
  }
  if (brand === "spotify") {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path
          d="M6.5 10.2c3.6-1 8 -.6 10.8 1.2"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M7.4 13.1c2.8-.8 6.4-.5 8.8 1"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M8.4 15.6c2-.6 4.8-.3 6.6.7"
          fill="none"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // disney
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#0E3A82" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontFamily="'Gilroy', sans-serif"
        fontWeight="800"
        fontSize="11"
        letterSpacing="-0.2"
      >
        D+
      </text>
    </svg>
  );
}
