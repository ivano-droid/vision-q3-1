"use client";

import { useEffect, useRef, useState } from "react";

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

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

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
}) {
  const parsed = parseAmount(value);
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
        const current = parsed.target * easeOutCubic(t);
        setDisplay(formatNumber(current, parsed));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // Wait one frame + a small post-gate delay before attaching the
    // IO. When gate flips on bootDone, the splash overlay is still
    // mid-fade-out — kicking off the count-up the same tick would
    // animate the first few hundred ms behind the disappearing
    // splash. ~280ms gives the splash exit room to clear (its
    // transition is ~220ms) so the count-up is fully visible.
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
        { threshold: 0.4 },
      );
      io.observe(el);
      // Replace the outer cleanup's `io` reference.
      teardownIO = () => io.disconnect();
    }, 280);

    let teardownIO: (() => void) | null = null;

    return () => {
      window.clearTimeout(startTimer);
      teardownIO?.();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [parsed, durationMs, sessionKey, gate]);

  // Unparseable input → just render it verbatim.
  if (!parsed) return <span className={className}>{value}</span>;

  return (
    <span ref={ref} className={className}>
      {display}
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
