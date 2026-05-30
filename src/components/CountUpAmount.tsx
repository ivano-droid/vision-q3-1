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

export function CountUpAmount({
  value,
  durationMs = 900,
  className,
}: {
  value: string;
  durationMs?: number;
  className?: string;
}) {
  const parsed = parseAmount(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string>(() =>
    parsed ? formatNumber(0, parsed) : value,
  );
  const doneRef = useRef(false);

  useEffect(() => {
    if (!parsed) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // No IO or reduced motion → show the final value, no animation.
    if (
      prefersReduced ||
      typeof IntersectionObserver === "undefined" ||
      !ref.current
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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !doneRef.current) {
            doneRef.current = true;
            run();
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [parsed, durationMs]);

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
