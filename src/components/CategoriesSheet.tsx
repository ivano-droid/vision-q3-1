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
 *   │  All                  ▸  │
 *   │  New                  ▸  │
 *   │  Jackpot              ▸  │
 *   │  Megaways             ▸  │
 *   │  Slingo               ▸  │
 *   │  …                       │
 *   └──────────────────────────┘
 *
 * Pure presentational: the page owns the selected-category state and
 * passes the current selection + change handler in. Backdrop tap +
 * Esc + close button all dismiss; opening also locks page scroll.
 */

export type Category = { key: string; label: string };

export function CategoriesSheet({
  open,
  selected,
  categories,
  onSelect,
  onClose,
  title = "Casino categories",
}: {
  open: boolean;
  /** Currently selected category key, or null for "All". */
  selected: string | null;
  categories: Category[];
  onSelect: (key: string | null) => void;
  onClose: () => void;
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
            transition={{ duration: 0.2 }}
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
            transition={{ type: "spring", stiffness: 360, damping: 38, mass: 0.9 }}
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
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
