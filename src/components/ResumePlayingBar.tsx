"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { usePathname } from "next/navigation";

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
 *   • Dismissal persists for the rest of the session (sessionStorage
 *     `mrq.resume-dismissed`) so it doesn't keep reappearing every
 *     time the user navigates back to the lobby. Cleared on tab close.
 */

const DISMISSED_KEY = "mrq.resume-dismissed";
const SWIPE_THRESHOLD = 90;
const SWIPE_VELOCITY_THRESHOLD = 350;

const GAME = {
  src: "/assets/games/slot-13.png",
  game: "Snake Arena",
};

export function ResumePlayingBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const x = useMotionValue(0);
  // Fade out as the user drags toward dismissal so the swipe feels
  // like it's pulling the card off the screen.
  const opacity = useTransform(x, [-200, -40, 0, 40, 200], [0, 1, 1, 1, 0]);

  // Only show on the home route, and only if not already dismissed
  // in this session.
  const onHome = pathname === "/";
  const show = mounted && onHome && !dismissed;

  // Read sessionStorage on mount so we don't show the bar on the
  // server-rendered HTML (avoids hydration mismatch) and so the
  // dismissed state survives lobby navigations within the session.
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setDismissed(
        sessionStorage.getItem(DISMISSED_KEY) === "1",
      );
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          // Clamped to the mobile-frame's column via
          // --frame-right-offset so on desktop the bar hugs the 375px
          // column instead of spanning the whole monitor.
          className="fixed z-40 pointer-events-none"
          style={{
            left: "var(--frame-right-offset)",
            right: "var(--frame-right-offset)",
            // Sit immediately above the BottomNav, plus a small
            // 8px lift so the soft shadow has room to spread under it.
            bottom: "calc(var(--bottom-nav-h) + 8px)",
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 32,
            mass: 0.9,
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
                to resume their session. */}
            <button
              type="button"
              className="flex-1 min-w-0 flex flex-col items-start justify-center text-left active:scale-[0.99] transition-transform"
              onClick={() => {
                // Stub — in a real build this would deep-link back to
                // the actual game session.
                // eslint-disable-next-line no-console
                console.log("[Resume] resume →", GAME.game);
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
