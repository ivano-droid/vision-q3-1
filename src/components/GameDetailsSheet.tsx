"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "@/lib/filter-context";

/**
 * Game-details bottom sheet.
 *
 *   ┌──────────────────────────┐
 *   │            ─             │  ← grab handle
 *   │  ┌──────┐  Buffalo Bills │  ← artwork + title
 *   │  │ art  │  Slot          │
 *   │  └──────┘                │
 *   │  ┌────────────────────┐  │
 *   │  │ Med │ 94% │ 5,000x │  │  ← stats pill
 *   │  └────────────────────┘  │
 *   │  Min/max bet  £0.10-…    │
 *   │  Game type    Slot       │
 *   │  Provider     Goosicorn  │  ← detail rows
 *   │  ┌────────────────────┐  │
 *   │  │      Play game     │  │  ← brand-blue CTA
 *   │  └────────────────────┘  │
 *   └──────────────────────────┘
 *
 * White surface variant of the Buffalo Bills game-screen Game Info
 * card. Driven by `useShell().gameDetails` — when that's non-null,
 * the sheet slides up; when null, it's closed. Tile components
 * call `openGameDetails(getGameDetails(name, src))` to surface it.
 *
 * The Play CTA routes to `details.href` when set (e.g. Buffalo Bills
 * → /play/buffalo-bills) and falls back to closing the sheet for
 * games that don't have a real game page yet.
 */
export function GameDetailsSheet() {
  const { gameDetails, closeGameDetails } = useShell();
  const router = useRouter();
  const open = gameDetails !== null;

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGameDetails();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeGameDetails]);

  const handlePlay = () => {
    if (gameDetails?.href) {
      router.push(gameDetails.href);
      closeGameDetails();
      return;
    }
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.log("[GameDetails] play →", gameDetails?.name);
    }
    closeGameDetails();
  };

  return (
    <AnimatePresence>
      {open && gameDetails && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close game info"
            onClick={closeGameDetails}
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Sheet — clamped to the mobile-frame column. Now a
              flex column so the Play CTA can pin to the bottom
              while the rest of the content scrolls independently
              above it. Without this, a long sheet pushes the CTA
              off-screen and the primary action becomes unreachable
              without first scrolling the rest of the content. */}
          <motion.div
            role="dialog"
            aria-label={`${gameDetails.name} info`}
            className="fixed bottom-0 z-50 rounded-t-[20px] bg-white flex flex-col"
            style={{
              left: "var(--frame-right-offset)",
              right: "var(--frame-right-offset)",
              maxHeight: "85vh",
              boxShadow: "0 -16px 40px -10px rgba(10, 46, 203, 0.20)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 38,
              mass: 0.9,
            }}
          >
            {/* Grab handle */}
            <div className="grid place-items-center pt-[10px] pb-[6px] shrink-0">
              <span
                aria-hidden
                className="block h-[4px] w-[44px] rounded-full"
                style={{ backgroundColor: "rgba(10, 46, 203, 0.15)" }}
              />
            </div>

            <div
              className="flex-1 min-h-0 overflow-y-auto"
              style={{
                // Trailing scroll padding so the last detail row +
                // copy don't sit flush against the pinned CTA.
                paddingBottom: 12,
              }}
            >
              {/* Title block. When a `preview` is present, the
                  small artwork thumbnail is hidden — the preview
                  below already shows what the game looks like, and
                  freeing up the horizontal space here lets long
                  titles ("Buffalo Bills Hypercharged") render in
                  full instead of being truncated. When no preview
                  is available, the thumbnail stays so the sheet
                  always has a visual anchor. */}
              <div className="flex items-center gap-[14px] px-[20px] pt-[10px] pb-[14px]">
                {!gameDetails.preview && (
                  <span
                    className="relative shrink-0 overflow-hidden rounded-[14px]"
                    style={{
                      width: 92,
                      height: 92,
                      boxShadow: "0 6px 16px -8px rgba(10, 46, 203, 0.25)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gameDetails.src}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 size-full object-cover"
                    />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-[22px] font-extrabold leading-tight text-[var(--mrq-blue-dark)]">
                    {gameDetails.name}
                  </h2>
                  <p
                    className="text-[14px] font-medium leading-tight mt-[4px]"
                    style={{ color: "rgba(10, 46, 203, 0.6)" }}
                  >
                    {gameDetails.gameType} · {gameDetails.provider}
                  </p>
                </div>
              </div>

              {/* Gameplay preview — optional per game. When the
                  catalogue carries a `preview` image, show it as a
                  landscape card right under the title so the user
                  sees what the game looks like before reading the
                  data. Subtle "Preview" chip in the corner sets the
                  context (static image, not a tappable trailer). */}
              {gameDetails.preview && (
                <div className="px-[16px] pb-[6px]">
                  <div
                    className="relative w-full overflow-hidden rounded-[14px]"
                    style={{
                      aspectRatio: "16 / 10",
                      boxShadow:
                        "0 6px 18px -8px rgba(10, 46, 203, 0.20)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gameDetails.preview}
                      alt={`${gameDetails.name} gameplay preview`}
                      draggable={false}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-[10px] left-[10px] px-[8px] py-[3px] rounded-[6px] text-[10px] font-extrabold uppercase tracking-[0.4px] text-white"
                      style={{
                        backgroundColor: "rgba(8, 16, 50, 0.55)",
                        backdropFilter: "blur(10px) saturate(140%)",
                        WebkitBackdropFilter: "blur(10px) saturate(140%)",
                      }}
                    >
                      Preview
                    </span>
                  </div>
                </div>
              )}

              {/* Stats pill — pale brand-blue surface (instead of
                  brown rgba like the game screen) so the sheet
                  reads white & clean. */}
              <div className="px-[16px]">
                <div
                  className="flex items-center justify-center rounded-[16px] h-[64px] px-[14px]"
                  style={{
                    backgroundColor: "rgba(10, 46, 203, 0.06)",
                    gap: 8,
                  }}
                >
                  <StatCell label="Volatility" value={gameDetails.volatility} />
                  <Divider />
                  <StatCell label="RTP" value={gameDetails.rtp} />
                  <Divider />
                  <StatCell label="Max win" value={gameDetails.maxWin} />
                </div>
              </div>

              {/* Detail rows */}
              <div className="flex flex-col px-[20px] pt-[18px] gap-[2px]">
                <DetailRow label="Min/max bet" value={gameDetails.betRange} />
                <DetailRow label="Game type" value={gameDetails.gameType} />
                <DetailRow label="Provider" value={gameDetails.provider} last />
              </div>

              {/* How to play — mirrors the same block on the Buffalo
                  Bills game screen, just in white-surface tone. */}
              <div className="px-[20px] pt-[24px]">
                <h3
                  className="text-[16px] font-extrabold leading-none"
                  style={{ color: "var(--mrq-blue-dark)" }}
                >
                  How to play
                </h3>
                <p
                  className="text-[14px] font-medium leading-[1.55] mt-[8px]"
                  style={{ color: "rgba(10, 46, 203, 0.65)" }}
                >
                  Choose your bet, tap spin, and match symbols across
                  the reels to win. Special symbols can trigger bonus
                  features, free spins, or extra prizes. Check the
                  full rules for paylines, payouts, and feature
                  details.
                </p>
              </div>

            </div>

            {/* Pinned Play CTA — lives OUTSIDE the scrollable area
                so the primary action stays visible no matter how
                much content sits above it. Soft fading divider on
                top (a 12px linear gradient) so the scroll area
                feathers into the pinned region instead of hitting
                it at a hard edge. */}
            <div
              className="shrink-0 relative bg-white"
              style={{
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 12,
                paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0"
                style={{
                  top: -12,
                  height: 12,
                  background:
                    "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
                }}
              />
              <button
                type="button"
                onClick={handlePlay}
                className="w-full flex items-center justify-center rounded-[14px] active:scale-[0.98] transition-transform"
                style={{
                  height: 52,
                  backgroundColor: "var(--mrq-blue)",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: -0.1,
                  boxShadow:
                    "0 8px 20px -10px rgba(10, 46, 203, 0.45)",
                }}
              >
                Play game
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-w-0">
      <span
        className="text-[16px] font-extrabold leading-tight truncate"
        style={{ color: "var(--mrq-blue-dark)" }}
      >
        {value}
      </span>
      <span
        className="text-[12px] font-medium leading-tight mt-[2px]"
        style={{ color: "rgba(10, 46, 203, 0.55)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="h-[24px] w-px shrink-0"
      style={{ backgroundColor: "rgba(10, 46, 203, 0.12)" }}
    />
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-[10px]"
      style={
        last
          ? undefined
          : { borderBottom: "1px solid rgba(10, 46, 203, 0.08)" }
      }
    >
      <span
        className="text-[15px] font-medium"
        style={{ color: "rgba(10, 46, 203, 0.6)" }}
      >
        {label}
      </span>
      <span
        className="text-[15px] font-extrabold"
        style={{ color: "var(--mrq-blue-dark)" }}
      >
        {value}
      </span>
    </div>
  );
}
