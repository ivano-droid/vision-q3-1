"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

/**
 * "Resume playing" sticky bar — Figma 168:29380.
 *
 *   ┌────────────────────────────────────────┐
 *   │  [▢]  Resume playing               ✕   │
 *   │       Snake Arena                       │
 *   └────────────────────────────────────────┘
 *
 *   • Lives only on the My Q route (the home/lobby).
 *   • Position-fixed just above the BottomNav (uses --bottom-nav-h).
 *   • Slides up from below on first paint of the home route.
 *   • Two dismissal paths:
 *       – Tap the X
 *       – Swipe horizontally past the dismiss threshold
 *   • Dismissal is per-visit only — navigating away from My Q and
 *     back resets the dismissed flag so the bar reappears. This is a
 *     prototype affordance: in production we'd persist dismissal for
 *     the rest of the session (sessionStorage), but for demoing we
 *     want the bar to be easy to get back. Earlier versions wrote
 *     to `sessionStorage["mrq.resume-dismissed"]`; we proactively
 *     clear that on mount so anyone with a stuck dismissal from a
 *     previous build sees the bar again.
 */

const LEGACY_DISMISSED_KEY = "mrq.resume-dismissed";
const SWIPE_THRESHOLD = 90;
const SWIPE_VELOCITY_THRESHOLD = 350;

const GAME = {
  src: "/assets/games/slot-01.png",
  game: "Buffalo Bills",
  // Tapping the bar drops the user back into the live game page.
  href: "/play/buffalo-bills",
};

export function ResumePlayingBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // Default to dismissed-on-first-render so we don't flash the bar on
  // SSR HTML (which would cause a hydration mismatch). The useEffect
  // below flips it on after mount when we're on the home route.
  const [dismissed, setDismissed] = useState(true);
  const x = useMotionValue(0);
  // Set on drag start, checked by the inner "Resume playing" button's
  // onClick. Without this, swiping the bar laterally would release
  // over the button and immediately route into the game — the
  // opposite of the dismissal intent. The ref resets on each fresh
  // pointer-down so a real tap (no intervening drag) routes normally.
  const dragWasActive = useRef(false);
  // Fade out as the user drags toward dismissal so the swipe feels
  // like it's pulling the card off the screen.
  const opacity = useTransform(x, [-200, -40, 0, 40, 200], [0, 1, 1, 1, 0]);

  const onHome = pathname === "/";
  const show = mounted && onHome && !dismissed;

  // Mark mounted on first paint, kick the SSR `dismissed: true`
  // default off (so the bar can appear on the home route), and
  // scrub any legacy sessionStorage flag from older builds.
  useEffect(() => {
    setMounted(true);
    setDismissed(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(LEGACY_DISMISSED_KEY);
    }
  }, []);

  // Earlier this component reset dismissed=false on every visit
  // to the home route, which made the bar reappear each time the
  // user navigated back from another tab. Removed — once the
  // user dismisses (X or swipe), `dismissed` stays true for the
  // life of this BrowserSession (i.e. until a full page reload),
  // since the component is mounted persistently by AppShell.

  const dismiss = () => {
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          // Bar lives PERMANENTLY at z-30 — behind the BottomNav
          // (z-40). The bar's body sits 16px above the nav so the
          // body itself is fully visible above the nav. The bar's
          // drop-shadow halo extends ~35px below the body, which
          // crosses into the nav's footprint, and z-30 makes the
          // halo cleanly clip behind the nav — no shadow bleed onto
          // the nav's top edge.
          //
          // Earlier versions flipped z-index 30 → 50 once the entry
          // animation settled, but that created a visible "click"
          // at the end of entry: the moment z-50 kicked in, the
          // shadow halo that had been hidden behind the nav popped
          // into view above it, reading as a sudden opacity change.
          // Staying at z-30 keeps the shadow hidden throughout.
          //
          // Clamped to the mobile-frame's column via
          // --frame-right-offset so on desktop the bar hugs the
          // 375px column instead of spanning the whole monitor.
          className="fixed pointer-events-none z-30"
          style={{
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
            bottom: "calc(var(--bottom-nav-h) + 16px)",
          }}
          // Entry: y-only slide. The bar starts at y=140 (well
          // below the nav's footprint, hidden behind it at z-30)
          // and slides up to y=0 (resting 16px above the nav).
          // No opacity animation — bar renders at full opacity
          // from frame one, so there's no opacity "click" when
          // the animation completes. The y motion alone reveals
          // the bar because it physically emerges from behind the
          // nav as it climbs.
          initial={{ y: 140 }}
          animate={{ y: 0 }}
          // Exit: 220ms y-slide down. 130ms read as a hard cut —
          // the bar vanished behind the nav before the eye could
          // register the motion. 220ms keeps the dismissal brisk
          // (well below 250ms iOS standard) but gives the
          // descent enough time to be perceived as deliberate.
          // Still no opacity fade — z-30 keeps the bar clipped
          // behind the BottomNav as soon as it moves.
          exit={{
            y: 80,
            transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
          }}
          // Entry transition only — critically-damped-ish spring,
          // zero overshoot so the bar doesn't briefly oscillate
          // into the nav region on settle.
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 38,
            mass: 1,
          }}
        >
          <motion.div
            role="dialog"
            aria-label={`Resume playing ${GAME.game}`}
            // Inner draggable surface. Lateral drag past
            // SWIPE_THRESHOLD (or a fast flick) dismisses the bar.
            drag="x"
            dragElastic={0.4}
            dragMomentum={false}
            onPointerDown={() => {
              dragWasActive.current = false;
            }}
            onDragStart={() => {
              dragWasActive.current = true;
            }}
            onDragEnd={(_, info) => {
              if (
                Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
                Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD
              ) {
                dismiss();
              } else {
                // Snap back to centre if the user didn't drag far
                // enough to commit a dismiss.
                x.set(0);
              }
            }}
            className="mx-[12px] flex items-center gap-[12px] rounded-[16px] p-[12px] pointer-events-auto touch-pan-y"
            style={{
              x,
              opacity,
              backgroundColor: "rgba(255, 255, 255, 0.72)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              boxShadow:
                "0 10px 10px -2px rgba(15, 30, 102, 0.09), 0 22px 13px -8px rgba(15, 30, 102, 0.05), 0 2px 5px rgba(15, 30, 102, 0.10)",
            }}
          >
            {/* Game art thumbnail */}
            <span className="relative shrink-0 size-[43px] rounded-[12px] overflow-hidden">
              <Image
                src={GAME.src}
                alt=""
                fill
                sizes="43px"
                className="object-cover"
              />
            </span>

            {/* Tap-to-resume row. Filling the rest of the row so the
                user can tap the entire surface (not just the thumbnail)
                to resume their session. Routes to the game's play
                page via the router so the navigation triggers the
                shell's chrome-hiding logic (BrandBar + BottomNav +
                this bar all disappear together once /play/* is
                active). */}
            <button
              type="button"
              className="flex-1 min-w-0 flex flex-col items-start justify-center text-left active:scale-[0.99] transition-transform"
              onClick={() => {
                // Swiping the bar can land the click on this button
                // (finger releases while still over it). The
                // dragWasActive flag distinguishes a real tap from
                // a release-after-swipe.
                if (dragWasActive.current) return;
                router.push(GAME.href);
              }}
            >
              <span
                className="font-extrabold text-[14px] leading-tight"
                style={{ color: "var(--mrq-blue-dark)" }}
              >
                Resume playing
              </span>
              <span
                className="font-medium text-[12px] leading-tight opacity-80"
                style={{ color: "var(--mrq-blue-dark)" }}
              >
                {GAME.game}
              </span>
            </button>

            {/* Close X — explicit button so dismiss state mirrors what
                the user expects when they tap it directly. */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss resume prompt"
              className="grid size-[28px] place-items-center rounded-full shrink-0 active:scale-[0.9] transition-transform"
              style={{
                color: "var(--mrq-blue-dark)",
              }}
            >
              <CloseIcon className="size-[14px]" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="m3 3 8 8M11 3l-8 8" />
    </svg>
  );
}
