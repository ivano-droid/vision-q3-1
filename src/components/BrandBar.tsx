"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShell } from "@/lib/filter-context";

/**
 * Sticky brand bar — left side switches by route, right side is the
 * balance + avatar pill on every page.
 *
 *   On `/` (Lobby)            : MrQ logo (Link to `/`)
 *   On `/casino`, `/live`,
 *      `/bingo`, `/arena`     : back arrow + category title (Link to `/`)
 *   On `/search`, `/discover`,
 *      `/rewards`             : MrQ logo (treated as top-level routes)
 *
 * The back arrow always returns to `/` (the Lobby) rather than using
 * router.back() — predictable behaviour regardless of how the user got
 * to the page (deep link, share, history, etc.). If we later want it
 * to "really go back" we can swap to router.back() guarded by a
 * `history.length > 1` check.
 */

const CATEGORY_TITLES: Record<string, string> = {
  "/casino": "Casino",
  "/live": "Live",
  "/bingo": "Bingo",
  "/arena": "Arena",
};

export function BrandBar() {
  const { openSideNav } = useShell();
  const pathname = usePathname();
  const categoryTitle = CATEGORY_TITLES[pathname];

  return (
    <header
      className="sticky top-0 z-30 bg-mrq-blue pb-[10px]"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 10px)" }}
    >
      <div className="relative h-[48px] px-[16px] flex items-center justify-between">
        {/* Left side: logo OR back-arrow + title, depending on route */}
        {categoryTitle ? (
          <Link
            href="/"
            aria-label="Back to lobby"
            className="flex items-center gap-[10px] -ml-[6px] pr-[8px] active:scale-[0.96] transition-transform"
          >
            <BackIcon className="size-[24px] text-white" />
            <h1 className="text-white text-[22px] font-extrabold leading-none">
              {categoryTitle}
            </h1>
          </Link>
        ) : (
          <Link
            href="/"
            aria-label="Go to lobby"
            className="shrink-0 active:scale-[0.96] transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-mrq.svg" alt="MrQ" className="h-[32px] w-[83px]" />
          </Link>
        )}

        {/* Right side: balance + divider + avatar pill (unchanged on every route).
            Height bumped to match the filter-pill family and avatar grown to
            keep the proportions balanced. Drop shadow removed — it was
            making the pill look like it floated separately from the rest
            of the glass system below. Keeps only the inset top highlight
            for the "lit edge" Liquid Glass feel. */}
        <button
          type="button"
          onClick={openSideNav}
          aria-label="Open account menu"
          className="flex items-center gap-[10px] h-[46px] pl-[18px] pr-[5px] rounded-full active:scale-[0.97] transition-transform"
          style={{
            backgroundColor: "rgba(8, 24, 100, 0.65)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.14)",
          }}
        >
          <span className="text-white text-[16px] leading-none font-extrabold pt-[1px]">
            £113.59
          </span>
          <span
            className="h-[20px] w-px"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.22)" }}
            aria-hidden
          />
          {/* Avatar — sized 38px so it fits comfortably inside the 46px
              pill with 4px of breathing room. Ring colour matches the
              pill fill so it blends instead of standing out as a chip
              within a chip. */}
          <div
            className="relative size-[38px] rounded-full overflow-hidden bg-white"
            style={{
              border: "2px solid rgba(8, 24, 100, 0.65)",
            }}
          >
            <Image
              src="/assets/avatar.png"
              alt=""
              fill
              sizes="38px"
              className="object-cover"
              priority
            />
          </div>
        </button>
      </div>
    </header>
  );
}

function BackIcon({ className }: { className?: string }) {
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
      <path d="m14 18-6-6 6-6" />
    </svg>
  );
}
