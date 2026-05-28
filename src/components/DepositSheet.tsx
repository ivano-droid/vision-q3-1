"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useShell } from "@/lib/filter-context";

/**
 * "Make a deposit" bottom sheet — opened when the user taps the cash
 * amount in the brand bar's wallet pill. Matches the deposit flow on
 * the original vision-01 prototype:
 *
 *   ┌───────────────────────────────────┐
 *   │  ▬▬▬▬                          ✕  │
 *   │  Make a deposit                   │
 *   │                                   │
 *   │  Deposit Amount                   │
 *   │  ┌─────────────────────────────┐  │
 *   │  │           £20               │  │  ← Large amount display
 *   │  └─────────────────────────────┘  │
 *   │  [Min]  [£10] [£20] [£50] [£100]  │
 *   │                            [Max]  │
 *   │  Deposit range: £10–£200          │
 *   │                                   │
 *   │  Payment providers                │
 *   │  ┌─────────────────────────────┐  │
 *   │  │  Visa ending in 9191      ▸ │  │
 *   │  │  Expires 01/2029            │  │
 *   │  └─────────────────────────────┘  │
 *   │  ┌─────────────────────────────┐  │
 *   │  │   Apple Pay              ▸  │  │
 *   │  └─────────────────────────────┘  │
 *   │                                   │
 *   │  ┌─────────────────────────────┐  │
 *   │  │         Deposit             │  │
 *   │  └─────────────────────────────┘  │
 *   │                                   │
 *   │  Set or Update Deposit Limits     │
 *   │  Safer gambling                   │
 *   └───────────────────────────────────┘
 *
 * Pure presentational — selected amount + payment method are local
 * UI state. Deposit button is a stub (logs to console).
 */

type PaymentMethod = "card-9191" | "apple-pay";

const MIN = 10;
const MAX = 200;
const QUICK_AMOUNTS = [10, 20, 50, 100];

export function DepositSheet() {
  const { depositOpen, closeDeposit } = useShell();
  const [amount, setAmount] = useState<number>(20);
  const [method, setMethod] = useState<PaymentMethod>("card-9191");

  // Body scroll lock while the sheet is open.
  useEffect(() => {
    if (!depositOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [depositOpen]);

  // Esc to close.
  useEffect(() => {
    if (!depositOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDeposit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [depositOpen, closeDeposit]);

  return (
    <AnimatePresence>
      {depositOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close deposit"
            onClick={closeDeposit}
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            role="dialog"
            aria-label="Make a deposit"
            className="fixed bottom-0 z-50 rounded-t-[20px] bg-white"
            style={{
              left: "var(--frame-right-offset)",
              right: "var(--frame-right-offset)",
              maxHeight: "92vh",
              boxShadow: "0 -16px 40px -10px rgba(10, 46, 203, 0.25)",
              paddingBottom:
                "calc(env(safe-area-inset-bottom) + 16px)",
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

            {/* Header */}
            <div className="flex items-center justify-between px-[16px] pb-[16px]">
              <h2 className="text-[18px] font-extrabold text-[var(--mrq-blue-dark)]">
                Make a deposit
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={closeDeposit}
                className="grid size-[32px] place-items-center rounded-full text-[var(--mrq-blue)] active:scale-[0.92] transition-transform"
                style={{ backgroundColor: "rgba(10, 46, 203, 0.08)" }}
              >
                <CloseIcon className="size-[14px]" />
              </button>
            </div>

            {/* Scroll area — handles the unlikely case that the sheet
                overflows on shorter viewports. */}
            <div className="overflow-y-auto px-[16px] pb-[8px]" style={{ maxHeight: "calc(92vh - 80px)" }}>
              {/* Deposit Amount */}
              <p className="text-[14px] font-extrabold text-[var(--mrq-blue-dark)] pb-[10px]">
                Deposit Amount
              </p>

              <div
                className="grid place-items-center rounded-[14px] h-[88px] mb-[12px]"
                style={{
                  backgroundColor: "#F2F4FB",
                  border: "1px solid rgba(10, 46, 203, 0.10)",
                }}
              >
                <p className="text-[40px] font-extrabold leading-none text-[var(--mrq-blue-dark)]">
                  £{amount}
                </p>
              </div>

              {/* Chip row: Min · quick amounts · Max */}
              <div className="grid grid-cols-6 gap-[8px] pb-[10px]">
                <Chip
                  label="Min"
                  onClick={() => setAmount(MIN)}
                  active={amount === MIN}
                />
                {QUICK_AMOUNTS.map((v) => (
                  <Chip
                    key={v}
                    label={`£${v}`}
                    onClick={() => setAmount(v)}
                    active={amount === v}
                  />
                ))}
                <Chip
                  label="Max"
                  onClick={() => setAmount(MAX)}
                  active={amount === MAX}
                />
              </div>

              <p className="text-[12px] font-bold text-[var(--mrq-blue-dark)] opacity-60 pb-[18px]">
                Deposit range: £{MIN}–£{MAX}
              </p>

              {/* Payment providers */}
              <p className="text-[14px] font-extrabold text-[var(--mrq-blue-dark)] pb-[10px]">
                Payment providers
              </p>

              <div className="flex flex-col gap-[8px] pb-[16px]">
                <ProviderRow
                  active={method === "card-9191"}
                  onClick={() => setMethod("card-9191")}
                  icon={<CardIcon className="size-[20px]" />}
                  title="Visa ending in 9191"
                  subtitle="Expires 01/2029"
                />
                <ProviderRow
                  active={method === "apple-pay"}
                  onClick={() => setMethod("apple-pay")}
                  icon={<ApplePayIcon className="size-[24px]" />}
                  title="Apple Pay"
                />
              </div>

              {/* Deposit CTA */}
              <button
                type="button"
                onClick={() => {
                  // eslint-disable-next-line no-console
                  console.log(
                    "[Deposit] £" + amount + " via " + method,
                  );
                  closeDeposit();
                }}
                className="flex w-full items-center justify-center h-[52px] rounded-[12px] bg-mrq-blue text-white text-[16px] font-extrabold active:scale-[0.98] transition-transform"
              >
                Deposit £{amount}
              </button>

              {/* Footer links */}
              <div className="flex flex-col gap-[6px] pt-[14px] pb-[8px]">
                <button
                  type="button"
                  className="text-[13px] font-extrabold text-[var(--mrq-blue)] text-left"
                >
                  Set or Update Deposit Limits
                </button>
                <button
                  type="button"
                  className="text-[13px] font-extrabold text-[var(--mrq-blue)] text-left"
                >
                  Safer gambling
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Chip({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[36px] rounded-[10px] text-[13px] font-extrabold active:scale-[0.96] transition-transform"
      style={{
        backgroundColor: active ? "var(--mrq-blue)" : "#F2F4FB",
        color: active ? "#ffffff" : "var(--mrq-blue-dark)",
        border: active
          ? "1px solid var(--mrq-blue)"
          : "1px solid rgba(10, 46, 203, 0.10)",
      }}
    >
      {label}
    </button>
  );
}

function ProviderRow({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[12px] w-full rounded-[12px] pl-[14px] pr-[12px] py-[12px] text-left active:scale-[0.99] transition-transform"
      style={{
        backgroundColor: active ? "rgba(10, 46, 203, 0.08)" : "#ffffff",
        border: active
          ? "1.5px solid var(--mrq-blue)"
          : "1.5px solid rgba(10, 46, 203, 0.10)",
      }}
    >
      <span
        className="shrink-0 grid place-items-center size-[36px] rounded-[8px]"
        style={{ backgroundColor: "#F2F4FB", color: "var(--mrq-blue-dark)" }}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-extrabold text-[var(--mrq-blue-dark)]">
          {title}
        </span>
        {subtitle && (
          <span className="block text-[12px] font-bold opacity-60 text-[var(--mrq-blue-dark)]">
            {subtitle}
          </span>
        )}
      </span>
      {/* Selected indicator — a filled brand-blue dot when active. */}
      <span
        aria-hidden
        className="shrink-0 grid place-items-center size-[20px] rounded-full"
        style={{
          border: active
            ? "6px solid var(--mrq-blue)"
            : "1.5px solid rgba(10, 46, 203, 0.18)",
          backgroundColor: active ? "var(--mrq-blue)" : "transparent",
        }}
      />
    </button>
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

function CardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <rect x="2.5" y="6" width="19" height="13" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M6 15.5h3" />
    </svg>
  );
}

function ApplePayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
      focusable={false}
    >
      {/* Bitten apple silhouette */}
      <path d="M16.4 7.4c-.7.8-1.7 1.5-2.7 1.4-.2-1.1.3-2.2 1-2.9.7-.7 1.8-1.3 2.7-1.4.2 1.1-.3 2.2-1 2.9ZM17.6 9.4c-1.5-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.7-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.2.8-1.3 1.2-2.5 1.2-2.6 0 0-2.3-.9-2.3-3.5 0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.1-1.9Z" />
    </svg>
  );
}
