"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

/**
 * Categories bottom sheet — slides up from below to let the user
 * pick a sub-category on the Casino page.
 *
 *   ┌──────────────────────────┐
 *   │                       ✕  │
 *   │  Casino categories       │
 *   │  ────                    │
 *   │  ← Back to Casino Home   │  ← optional, shown via `onHome`
 *   │  All games            ▸  │
 *   │  New                  ▸  │
 *   │  Jackpot              ▸  │
 *   │  Megaways             ▸  │
 *   │  Slingo               ▸  │
 *   │  …                       │
 *   └──────────────────────────┘
 *
 * Pure presentational: the page owns the selected-category state
 * and passes the current selection + change handler in. Backdrop
 * tap + Esc + close button all dismiss; opening also locks page
 * scroll.
 *
 * When the consumer is on a casino sub-route (a category page or
 * the All Games browse) it can pass an `onHome` callback — that
 * renders a "Back to Casino Home" link at the top of the list so
 * the user can hop back to the curated /casino homepage without
 * detouring through "All games" first.
 */

export type Category = { key: string; label: string };

export function CategoriesSheet({
  open,
  selected,
  categories,
  onSelect,
  onClose,
  onHome,
  title = "Casino Categories",
}: {
  open: boolean;
  /**
   * Currently selected row to highlight:
   *   - a category key (e.g. "jackpot") → that row is active
   *   - `null` → the "All games" row is active (used on /casino/games)
   *   - `undefined` → NO row is active (used on /casino, the curated
   *     homepage, where neither a sub-category nor the all-games
   *     browse is currently in view)
   */
  selected: string | null | undefined;
  categories: Category[];
  onSelect: (key: string | null) => void;
  onClose: () => void;
  /** Optional — when provided, the sheet renders a "Back to Casino
   *  Home" link at the top of the list that calls this handler.
   *  Sub-routes (per-category, all-games) pass it; the casino
   *  homepage itself omits it since you're already there. */
  onHome?: () => void;
  title?: string;
}) {
  // Body scroll lock while the sheet is open so the page underneath
  // doesn't scroll when the user drags on the sheet.
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
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — dims the page underneath and dismisses on tap. */}
          <motion.button
            type="button"
            aria-label="Close categories"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Sheet — fixed at bottom of viewport, constrained to the
              mobile-frame's column via --frame-right-offset (matches
              the BottomNav approach so on desktop it doesn't span
              the whole monitor). */}
          <motion.div
            role="dialog"
            aria-label={title}
            className="fixed bottom-0 z-50 rounded-t-[20px] bg-white"
            style={{
              left: "var(--frame-right-offset)",
              right: "var(--frame-right-offset)",
              maxHeight: "75vh",
              boxShadow: "0 -16px 40px -10px rgba(10, 46, 203, 0.25)",
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
            <div className="grid place-items-center pt-[10px] pb-[4px]">
              <span
                aria-hidden
                className="block h-[4px] w-[44px] rounded-full"
                style={{ backgroundColor: "rgba(10, 46, 203, 0.18)" }}
              />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between px-[16px] pb-[8px]">
              <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue-dark)]">
                {title}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="grid size-[32px] place-items-center rounded-full text-[var(--mrq-blue)] active:scale-[0.92] transition-transform"
                style={{ backgroundColor: "rgba(10, 46, 203, 0.08)" }}
              >
                <CloseIcon className="size-[14px]" />
              </button>
            </div>

            {/* Category list — scrollable if it overflows. */}
            <ul
              className="overflow-y-auto px-[8px] pb-[24px]"
              style={{
                maxHeight: "calc(75vh - 80px)",
                paddingBottom:
                  "calc(env(safe-area-inset-bottom) + 24px)",
              }}
            >
              <CategoryRow
                label="All games"
                active={selected === null}
                onClick={() => {
                  onSelect(null);
                  onClose();
                }}
              />
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.key}
                  label={cat.label}
                  active={selected === cat.key}
                  onClick={() => {
                    onSelect(cat.key);
                    onClose();
                  }}
                />
              ))}

              {/* "Back to Casino Home" — only rendered when onHome
                  is provided (sub-routes only). Sits at the BOTTOM
                  of the list, after the category rows, separated
                  by a hairline divider so it reads as a distinct
                  navigation step rather than another category
                  choice. Uses a back-arrow glyph instead of the
                  forward chevron. */}
              {onHome && (
                <>
                  <li
                    aria-hidden
                    className="my-[6px] mx-[12px] h-px"
                    style={{ backgroundColor: "rgba(10, 46, 203, 0.10)" }}
                  />
                  <HomeRow
                    onClick={() => {
                      onHome();
                      onClose();
                    }}
                  />
                </>
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HomeRow({ onClick }: { onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-[10px] px-[12px] py-[14px] text-left active:scale-[0.99] transition-transform"
      >
        <span className="flex items-center gap-[10px]">
          <BackArrowIcon className="size-[16px] text-[var(--mrq-blue)]" />
          <span className="text-[16px] font-extrabold text-[var(--mrq-blue)]">
            Back to Casino Home
          </span>
        </span>
      </button>
    </li>
  );
}

function CategoryRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-[10px] px-[12px] py-[14px] text-left active:scale-[0.99] transition-transform"
        style={{
          backgroundColor: active
            ? "rgba(10, 46, 203, 0.08)"
            : "transparent",
        }}
      >
        <span
          className="text-[16px] font-extrabold"
          style={{
            color: active
              ? "var(--mrq-blue)"
              : "var(--mrq-blue-dark)",
          }}
        >
          {label}
        </span>
        <ChevronIcon className="size-[16px] text-[var(--mrq-blue-dark)] opacity-50" />
      </button>
    </li>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="m6 4 4 4-4 4" />
    </svg>
  );
}

function BackArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M10 4 6 8l4 4" />
    </svg>
  );
}
