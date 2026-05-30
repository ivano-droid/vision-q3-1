"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  EMPTY_FILTERS,
  MAX_BET_OPTIONS,
  MIN_BET_OPTIONS,
  RTP_RANGES,
  SORT_OPTIONS,
  VOLATILITY_OPTIONS,
  countActiveFilters,
  type GameFilters,
  type SortKey,
} from "@/lib/game-filters";
import { GAME_CATEGORIES } from "@/lib/searchable-games";
import { haptics } from "@/lib/haptics";

/**
 * Inline filter bar for the search takeover.
 *
 * One horizontally-scrollable line of facet chips. Category is the
 * primary narrower (Casino / Live Casino / Bingo / Arena); Provider,
 * RTP (as a range), Volatility and Min/Max wager refine. Tapping a chip
 * opens a floating dropdown anchored under the bar; picking a value
 * filters LIVE. Single-value facets close on pick; multi-value ones
 * (Category, Provider, Volatility) stay open so selections stack.
 *
 * Sort is a pure modifier and only appears once results exist (`canSort`)
 * — it never reveals the catalogue on its own.
 */

type FacetKey =
  | "category"
  | "provider"
  | "rtp"
  | "volatility"
  | "minBet"
  | "maxBet"
  | "sort";

type Row = { label: string; selected: boolean; onSelect: () => void };

export function FilterBar({
  filters,
  onChange,
  sort,
  onSortChange,
  providers,
  canSort,
}: {
  filters: GameFilters;
  onChange: (next: GameFilters) => void;
  sort: SortKey;
  onSortChange: (next: SortKey) => void;
  providers: string[];
  /** Show the Sort chip only when there's a result set to reorder. */
  canSort: boolean;
}) {
  const [open, setOpen] = useState<FacetKey | null>(null);
  const toggle = (k: FacetKey) => {
    haptics.selection();
    setOpen((cur) => (cur === k ? null : k));
  };
  const close = () => setOpen(null);

  const activeCount = countActiveFilters(filters);
  const toggleIn = <T extends string>(list: T[], v: T): T[] =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  // ----- chip labels reflect the current selection -----
  const multiLabel = (list: string[], fallback: string) =>
    list.length === 1 ? list[0] : list.length > 1 ? `${fallback} (${list.length})` : fallback;

  const rtpLabel =
    RTP_RANGES.find(
      (r) =>
        r.min === filters.minRtp &&
        r.max === filters.maxRtp &&
        (r.min != null || r.max != null),
    )?.label ?? "RTP";
  const minBetLabel =
    MIN_BET_OPTIONS.find(
      (o) => o.value === filters.minBetUpTo && o.value != null,
    )?.label ?? "Min wager";
  const maxBetLabel =
    MAX_BET_OPTIONS.find(
      (o) => o.value === filters.maxBetAtLeast && o.value != null,
    )?.label ?? "Max wager";

  // ----- rows for whichever facet is open -----
  let rows: Row[] = [];
  let closeOnSelect = true;
  if (open === "category") {
    closeOnSelect = false;
    rows = GAME_CATEGORIES.map((c) => ({
      label: c,
      selected: filters.categories.includes(c),
      onSelect: () =>
        onChange({ ...filters, categories: toggleIn(filters.categories, c) }),
    }));
  } else if (open === "provider") {
    closeOnSelect = false;
    rows = providers.map((p) => ({
      label: p,
      selected: filters.providers.includes(p),
      onSelect: () =>
        onChange({ ...filters, providers: toggleIn(filters.providers, p) }),
    }));
  } else if (open === "rtp") {
    rows = RTP_RANGES.map((r) => ({
      label: r.label,
      selected: filters.minRtp === r.min && filters.maxRtp === r.max,
      onSelect: () => onChange({ ...filters, minRtp: r.min, maxRtp: r.max }),
    }));
  } else if (open === "volatility") {
    closeOnSelect = false;
    rows = VOLATILITY_OPTIONS.map((v) => ({
      label: v,
      selected: filters.volatility.includes(v),
      onSelect: () =>
        onChange({ ...filters, volatility: toggleIn(filters.volatility, v) }),
    }));
  } else if (open === "minBet") {
    rows = MIN_BET_OPTIONS.map((o) => ({
      label: o.label,
      selected: filters.minBetUpTo === o.value,
      onSelect: () => onChange({ ...filters, minBetUpTo: o.value }),
    }));
  } else if (open === "maxBet") {
    rows = MAX_BET_OPTIONS.map((o) => ({
      label: o.label,
      selected: filters.maxBetAtLeast === o.value,
      onSelect: () => onChange({ ...filters, maxBetAtLeast: o.value }),
    }));
  } else if (open === "sort") {
    rows = SORT_OPTIONS.map((o) => ({
      label: o.label,
      selected: sort === o.key,
      onSelect: () => onSortChange(o.key),
    }));
  }

  return (
    <div className="relative shrink-0">
      {/* One line — horizontally scrollable, never wraps. */}
      <div className="flex items-center gap-[8px] overflow-x-auto px-[16px] pb-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FacetChip
          label={multiLabel(filters.categories, "All Categories")}
          active={filters.categories.length > 0}
          isOpen={open === "category"}
          onClick={() => toggle("category")}
        />
        <FacetChip
          label={multiLabel(filters.providers, "Provider")}
          active={filters.providers.length > 0}
          isOpen={open === "provider"}
          onClick={() => toggle("provider")}
        />
        <FacetChip
          label={rtpLabel}
          active={filters.minRtp != null || filters.maxRtp != null}
          isOpen={open === "rtp"}
          onClick={() => toggle("rtp")}
        />
        <FacetChip
          label={multiLabel(filters.volatility, "Volatility")}
          active={filters.volatility.length > 0}
          isOpen={open === "volatility"}
          onClick={() => toggle("volatility")}
        />
        <FacetChip
          label={minBetLabel}
          active={filters.minBetUpTo != null}
          isOpen={open === "minBet"}
          onClick={() => toggle("minBet")}
        />
        <FacetChip
          label={maxBetLabel}
          active={filters.maxBetAtLeast != null}
          isOpen={open === "maxBet"}
          onClick={() => toggle("maxBet")}
        />

        {/* Sort — divider + chip, only once there's a set to reorder. */}
        {canSort && (
          <>
            <span className="h-[20px] w-px shrink-0 bg-black/10" />
            <FacetChip
              label={SORT_OPTIONS.find((s) => s.key === sort)?.label ?? "Sort"}
              active={sort !== "relevance"}
              isOpen={open === "sort"}
              onClick={() => toggle("sort")}
              icon="sort"
            />
          </>
        )}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onChange(EMPTY_FILTERS);
              close();
            }}
            className="shrink-0 whitespace-nowrap px-[10px] text-[13px] font-bold text-[var(--mrq-blue)] underline-offset-2 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Floating dropdown — overlays the results so the list doesn't
          jump. Backdrop catches an outside tap to dismiss. */}
      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="fixed inset-0 z-[40] cursor-default"
            />
            <motion.div
              key={open}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              // Dropdown panel spans the FILTERBAR's full width
              // (matching the chip bar's 16px gutters on each side).
              // Previously it was a narrow 240px panel left-anchored
              // to the bar, which made it hard to predict where it
              // would land relative to whichever chip was tapped.
              // Full-width gives the user a consistent, generous
              // surface right under the chip strip — no matter which
              // facet they tapped, the same panel slides down in the
              // same place.
              style={{ top: "100%", left: 16, right: 16, marginTop: 4 }}
              className="absolute z-[50] max-h-[300px] overflow-y-auto rounded-[16px] bg-white py-[6px] shadow-[0_12px_40px_rgba(3,34,172,0.22)] ring-1 ring-black/5"
              role="listbox"
            >
              {rows.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  role="option"
                  aria-selected={r.selected}
                  onClick={() => {
                    haptics.selection();
                    r.onSelect();
                    if (closeOnSelect) close();
                  }}
                  className="flex w-full items-center justify-between gap-[10px] px-[16px] py-[11px] text-left text-[14px] font-bold text-[var(--mrq-blue-dark)] active:bg-[#EEF1FC]"
                >
                  <span className="truncate">{r.label}</span>
                  {r.selected && (
                    <CheckIcon className="size-[16px] shrink-0 text-[var(--mrq-blue)]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Facet chip in the bar. Filled brand-blue when it has a selection or
 *  its dropdown is open; pale-blue idle. The chevron rotates when open. */
function FacetChip({
  label,
  active,
  isOpen,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  isOpen: boolean;
  onClick: () => void;
  icon?: "sort";
}) {
  const filled = active || isOpen;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className="relative z-[60] flex h-[36px] shrink-0 items-center gap-[6px] whitespace-nowrap rounded-full pl-[14px] pr-[11px] text-[13px] font-extrabold active:scale-[0.96] transition-all"
      style={
        filled
          ? { backgroundColor: "var(--mrq-blue)", color: "#fff" }
          : { backgroundColor: "#CED5F5", color: "var(--mrq-blue-dark)" }
      }
    >
      {icon === "sort" && <SortIcon className="size-[14px]" />}
      {label}
      <Chevron open={isOpen} />
    </button>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[13px] transition-transform"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      aria-hidden
      focusable={false}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}
