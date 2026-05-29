"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

// Plus benefits — copy lifted from Figma 266:47075. Each row gets a
// title + body, with the trailing word "T&Cs" rendered as an
// underlined link.
const PLUS_BENEFITS: ReadonlyArray<{ title: string; body: string }> = [
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

  const dismiss = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    // Page reads as a sheet takeover — slides up from the bottom on
    // mount. Wrapping the whole view in a transformed motion.div
    // also makes any `position: fixed` descendants (the bottom CTA
    // bar) resolve against this container instead of the viewport,
    // so the footer rides up with the rest of the chrome during
    // the entry animation. The sticky header is inside the same
    // transform context, so it slides up as part of the page —
    // it doesn't pop into the viewport ahead of the body.
    //
    // Animation is a quick easeOut tween (≈260ms) rather than the
    // previous spring — the spring's heavy damping made the page
    // feel sluggish, particularly the moment the chrome settled at
    // the top. The tween lands in one clean motion.
    <motion.div
      className="relative w-full"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
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
          Scrollable content — benefits card + comparison card.
          marginTop: -72 pulls the cards up under the bottom of the
          blue band so the curved background sits behind the top
          ~72px of the Plus card (Figma intent: a layered seam
          between chrome and content rather than a hard edge).
          ──────────────────────────────────────────────────────── */}
      <motion.div
        key={tier} /* re-mount on tier switch for a fresh fade-in */
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col"
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          marginTop: -72,
          gap: 16,
        }}
      >
        {/* Benefits card — the Plus tier renders with a corner gem
            anchored to the card itself (see `showGem` prop) so the
            ornament tracks the card's top-right edge precisely,
            independent of any surrounding layout math. */}
        {tier === "plus" ? (
          <BenefitsCard
            title="Plus"
            worth="Worth £50"
            benefits={PLUS_BENEFITS}
            showGem
          />
        ) : (
          <PlaceholderTierCard tier={tier} />
        )}

        {/* "What you miss" subheading + comparison card. Only shown
            on the Plus tier — the other tiers don't pitch the same
            price-comparison story. */}
        {tier === "plus" && (
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
      </motion.div>

      {/* ────────────────────────────────────────────────────────
          Sticky footer — price selector + Start free trial CTA.
          Clamped to the mobile-frame column via --frame-right-offset
          so on desktop it hugs the 375px column rather than the
          whole viewport.
          ──────────────────────────────────────────────────────── */}
      <PassesFooter plan={plan} setPlan={setPlan} />
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
  showGem = false,
}: {
  title: string;
  worth: string;
  benefits: ReadonlyArray<{ title: string; body: string }>;
  /** Renders the corner diamond ornament (Plus tier only). */
  showGem?: boolean;
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
      {/* Corner diamond — anchored to the card's top-right edge so
          it tracks the card directly. Lifted 18px above the card
          top so the gem peeks into the blue band, and pulled
          slightly past the right edge (right: -2) so it nuzzles
          the corner instead of floating inward. */}
      {showGem && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: -18,
            right: -2,
            width: 56,
            height: 56,
            transform: "rotate(15deg)",
            zIndex: 5,
          }}
        >
          <DiamondGem />
        </div>
      )}
      {/* Title row: tier name + "Worth £50" pill */}
      <div className="flex items-center" style={{ gap: 8 }}>
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
        <span
          className="flex items-center justify-center"
          style={{
            paddingLeft: 6.316,
            paddingRight: 6.316,
            borderRadius: 6.316,
            border: "1px solid rgba(12, 34, 135, 0.25)",
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
          {worth}
        </span>
      </div>

      {/* Benefit list */}
      <ul className="flex flex-col" style={{ gap: 16, margin: 0, padding: 0 }}>
        {benefits.map((b) => (
          <li
            key={b.title}
            className="flex items-start"
            style={{ gap: 8, listStyle: "none" }}
          >
            <span className="shrink-0" style={{ width: 24, height: 24 }}>
              <TickBadge />
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
                {b.title}
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
            </div>
          </li>
        ))}
      </ul>

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
function PlaceholderTierCard({ tier }: { tier: Tier }) {
  const label = tier === "flex" ? "Flex" : "Premium";
  return (
    <div
      className="bg-white"
      style={{
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <h1
        style={{
          fontFamily: "'Gilroy', sans-serif",
          fontWeight: 700,
          fontSize: 24,
          color: TIER_TEXT,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {label}
      </h1>
      <p
        style={{
          fontFamily: "'Gilroy', sans-serif",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1.6,
          letterSpacing: 0.1,
          color: BODY_TEXT,
          margin: 0,
        }}
      >
        Details for the {label} pass are coming soon. Tap Plus above to see
        the full benefits list.
      </p>
    </div>
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
}: {
  plan: Plan;
  setPlan: (p: Plan) => void;
}) {
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
          price="£10 / mo"
        />
        <PlanTile
          selected={plan === "monthly"}
          onClick={() => setPlan("monthly")}
          label="Monthly"
          price="£100 / year"
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
   The decorative diamond gem — hand-drawn-feeling yellow gem
   with two tiny sparkles. Stylised; matches the Figma sticker
   without bundling the source PNG.
   ============================================================ */
function DiamondGem() {
  return (
    <svg
      viewBox="0 0 132 132"
      width="132"
      height="132"
      aria-hidden
      focusable={false}
    >
      {/* Sparkles around the gem (drawn behind so the gem reads on top) */}
      <g fill="#ffd400" stroke="#0c2287" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M118 8 L122 18 L132 22 L122 26 L118 36 L114 26 L104 22 L114 18 Z" />
        <path d="M104 56 L107 63 L114 66 L107 69 L104 76 L101 69 L94 66 L101 63 Z" />
      </g>

      {/* Main gem body — five-sided diamond outline. Filled yellow,
          outlined with dark navy strokes. Inner facet lines hint at
          the geometric cut. */}
      <g
        stroke="#0c2287"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#ffd400"
      >
        {/* Outer silhouette: flat-top "table" tilted, sloping into
            a pointed bottom. */}
        <path d="M14 48 L40 24 L92 24 L118 48 L66 122 Z" />

        {/* Crown facet lines — from the table corners straight down
            to the table edge below. */}
        <path d="M40 24 L32 48" fill="none" />
        <path d="M92 24 L100 48" fill="none" />
        <path d="M14 48 L118 48" fill="none" />

        {/* Pavilion facets — radiating from the table edge to the
            bottom point. */}
        <path d="M32 48 L66 122" fill="none" />
        <path d="M50 48 L66 122" fill="none" />
        <path d="M82 48 L66 122" fill="none" />
        <path d="M100 48 L66 122" fill="none" />
      </g>
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
