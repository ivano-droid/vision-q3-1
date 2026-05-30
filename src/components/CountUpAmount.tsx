"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Count-up money amount.
 *
 * Renders a formatted currency string (e.g. "£1,200", "£32.50") that
 * animates from zero up to its value the first time it scrolls into
 * view — a small, social-proofy bit of delight on the big-win rows.
 *
 * - Preserves the original formatting: currency prefix (£), thousands
 *   separators, and decimal places are all inferred from `value`, so
 *   "£1,200" counts up in whole pounds and "£32.50" keeps its pennies.
 * - Fires once (re-scrolling past it doesn't replay).
 * - Respects prefers-reduced-motion and degrades to the final value if
 *   IntersectionObserver isn't available — it never shows "£0" as a
 *   resting state.
 */

type Parsed = { prefix: string; suffix: string; target: number; decimals: number };

function parseAmount(value: string): Parsed | null {
  // prefix = leading non-numeric (e.g. "£"), then the number (with
  // optional commas + decimals), then any trailing suffix.
  const m = value.match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/);
  if (!m) return null;
  const [, prefix, numStr, suffix] = m;
  const target = parseFloat(numStr.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  const dot = numStr.indexOf(".");
  const decimals = dot === -1 ? 0 : numStr.length - dot - 1;
  return { prefix, suffix, target, decimals };
}

// Quartic ease-out (1 − (1−t)^4) — bigger initial ramp than cubic
// (so the digits feel like they're flying upward at first), then a
// more pronounced settle at the end (so the last 10–15% of the
// value crawls in, like a scoreboard locking onto its final
// reading). Reads as a clearer "slowing down" curve than the
// gentler cubic.
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

// sessionStorage helpers — guarded (private mode can throw).
function seenThisSession(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function markSeen(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

export function CountUpAmount({
  value,
  durationMs = 900,
  className,
  sessionKey,
  gate = true,
  rootMargin,
  threshold = 0.4,
}: {
  value: string;
  durationMs?: number;
  className?: string;
  /** When set, the count-up plays only the FIRST time it's seen this
   *  browser session — subsequent mounts show the final value instantly.
   *  Use for things like the wallet balance that should animate once on
   *  first app open, not on every navigation. */
  sessionKey?: string;
  /** Suppress the animation while false. Lets the parent block the
   *  count-up from firing while something is covering the screen (e.g.
   *  the SimpleSplashGate's z-65 overlay) — without this the
   *  IntersectionObserver would fire as soon as the element rendered
   *  into the DOM and the animation would play invisibly behind the
   *  splash. Flip to true after the gate clears and the count-up
   *  starts on its next IO entry. Defaults to true so consumers who
   *  don't care can ignore it. */
  gate?: boolean;
  /** CSS-style rootMargin string passed to the IntersectionObserver.
   *  Use to shrink the effective viewport so the count-up only fires
   *  when the element is clearly visible — e.g. "0px 0px -100px 0px"
   *  excludes the bottom 100px where the BottomNav sits, so a tile
   *  scrolling into the lower edge of the viewport doesn't fire its
   *  count-up while the user can't see the digits clearly. */
  rootMargin?: string;
  /** Fraction of the element that must be visible inside the IO root
   *  before the count-up fires. Defaults to 0.4. */
  threshold?: number;
}) {
  // parseAmount returns a fresh object every call; memoise on the
  // raw `value` string so the useEffect below isn't re-firing the
  // animation from near-zero on every parent re-render. Without
  // this the count-up looks "stuck" bouncing around the first 1% of
  // its target because the rAF gets cancelled and restarted on each
  // re-render of BrandBar / HomeView / etc.
  const parsed = useMemo(() => parseAmount(value), [value]);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string>(() =>
    parsed ? formatNumber(0, parsed) : value,
  );
  const doneRef = useRef(false);

  useEffect(() => {
    if (!parsed) return;
    // Held by the parent — re-run this effect once the gate flips.
    if (!gate) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Already animated this session (sessionKey set), or no IO / reduced
    // motion → show the final value, no animation.
    if (
      prefersReduced ||
      typeof IntersectionObserver === "undefined" ||
      !ref.current ||
      (sessionKey && seenThisSession(sessionKey))
    ) {
      setDisplay(formatNumber(parsed.target, parsed));
      doneRef.current = true;
      return;
    }

    const el = ref.current;
    let raf = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const current = parsed.target * easeOutQuart(t);
        setDisplay(formatNumber(current, parsed));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    let teardownIO: (() => void) | null = null;

    // Wait a small post-gate delay before attaching the IO. When
    // gate flips on bootDone, the splash overlay is still mid-
    // fade-out (~220ms transition) — kicking off the count-up the
    // same tick would animate the first few hundred ms behind the
    // disappearing splash. ~320ms gives the splash exit room to
    // clear before the count-up's first frame.
    const startTimer = window.setTimeout(() => {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !doneRef.current) {
              doneRef.current = true;
              if (sessionKey) markSeen(sessionKey);
              run();
              io.disconnect();
            }
          }
        },
        { threshold, rootMargin },
      );
      io.observe(el);
      teardownIO = () => io.disconnect();
    }, 320);

    return () => {
      window.clearTimeout(startTimer);
      teardownIO?.();
      if (raf) cancelAnimationFrame(raf);
      // Reset the "already animated" guard. Without this, React
      // Strict Mode in dev (which runs every effect twice on mount,
      // calling cleanup between the two) leaves doneRef.current=true
      // from the first cancelled run — and the second run silently
      // skips the IO trigger, so the count-up stays frozen at
      // whatever frame the cancelled rAF reached. In production
      // cleanup only fires on unmount, where this is a no-op.
      doneRef.current = false;
    };
  }, [parsed, durationMs, sessionKey, gate, rootMargin, threshold]);

  // Unparseable input → just render it verbatim.
  if (!parsed) return <span className={className}>{value}</span>;

  // Width-locked layout: the pill (or whatever parent) should size
  // itself to the FINAL value's width so it doesn't grow as the
  // count-up adds digits ("£0" → "£10" → "£100" → "£1,000.00").
  // Strategy: render the final value inside an inline-grid where
  // both children share the same cell. The "spacer" child has the
  // final value visually hidden but still taking up space — it
  // pins the width. The "live" child is the animated number,
  // overlaid on top. tabular-nums keeps each digit the same width
  // so individual digit changes don't shift the layout either.
  return (
    <span
      className={className}
      style={{
        display: "inline-grid",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span
        aria-hidden
        style={{
          gridArea: "1 / 1",
          visibility: "hidden",
          // pointerEvents off just in case — invisible spacer
          // shouldn't catch taps the parent expects to receive.
          pointerEvents: "none",
        }}
      >
        {formatNumber(parsed.target, parsed)}
      </span>
      <span ref={ref} style={{ gridArea: "1 / 1" }}>
        {display}
      </span>
    </span>
  );
}

function formatNumber(n: number, { prefix, suffix, decimals }: Parsed): string {
  const body = n.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${prefix}${body}${suffix}`;
}
