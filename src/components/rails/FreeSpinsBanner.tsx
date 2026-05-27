"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useShell } from "@/lib/filter-context";

/**
 * "You've got X free spins" inline banner.
 *
 * Centred bold text inside a tall white card — sits between rails on
 * the home feed as an attention-grabber for promotional offers. No
 * heavy decoration; the typography does the work.
 */
export function FreeSpinsBanner({
  label = "You've got 100 free spins",
}: {
  label?: string;
}) {
  const reduce = useReducedMotion();
  const { bootDone } = useShell();

  return (
    <motion.section
      aria-label={label}
      className="px-[16px] pt-2 pb-3"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={
        reduce || bootDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="flex w-full items-center justify-center rounded-[14px] bg-white h-[78px] px-[20px] active:scale-[0.99] transition-transform"
        style={{
          boxShadow: "0 4px 12px -6px rgba(10, 46, 203, 0.14)",
        }}
      >
        <span className="text-center text-[16px] font-extrabold text-[var(--mrq-blue-dark)]">
          {label}
        </span>
      </button>
    </motion.section>
  );
}
