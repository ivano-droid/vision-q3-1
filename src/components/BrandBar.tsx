"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShell } from "@/lib/filter-context";
import { CountUpAmount } from "@/components/CountUpAmount";

// Tappable wallet pill = a flex row that's NOT a button, with the
// cash text on the left acting as its own button (opens deposit
// sheet) and the avatar on the right also its own button (opens
// side nav). The divider between them lives inside the row and
// stays neutral.

/**
 * Sticky brand bar — left side switches by route, right side is the
 * balance + avatar pill on every page.
 *
 *   On `/` (Lobby)              : MrQ logo (Link to `/`)
 *   On `/casino`,
 *     `/casino/[category]`      : back arrow (no title) — title lives in
 *                                 the page content now so it sits beside
 *                                 its category CTA (Categories+) instead
 *                                 of stacking with the brand bar.
 *   On `/search`, `/discover`,
 *      `/rewards`               : MrQ logo (treated as top-level routes)
 *
 * `/live`, `/bingo`, and `/arena` used to land here too, but those
 * routes have been removed while we focus on perfecting the Casino
 * flow. Re-add them here once their pages return.
 *
 * The back arrow always returns to `/` (the Lobby) rather than using
 * router.back() — predictable behaviour regardless of how the user got
 * to the page (deep link, share, history, etc.). If we later want it
 * to "really go back" we can swap to router.back() guarded by a
 * `history.length > 1` check.
 */

/** Routes that get a back arrow in the brand bar. The page itself owns
 *  the visible title now (Casino page renders "Casino" next to its
 *  Categories+ CTA, etc.), so we don't render a title here. */
function showsBackArrow(pathname: string): boolean {
  return (
    pathname === "/casino" ||
    pathname.startsWith("/casino/") ||
    pathname.startsWith("/arena") ||
    pathname.startsWith("/bingo")
  );
}

/** Where the back arrow leads. Sub-routes under /casino (per-category
 *  pages, the all-games browse) drop one level back to /casino — the
 *  casino homepage. /arena and /bingo land the user on /search (the
 *  Explore page) since both verticals are opened from the Explore
 *  mega-card carousel, not directly from the lobby. Anything else
 *  goes to the lobby. */
function backHrefFor(pathname: string): string {
  if (pathname.startsWith("/casino/")) return "/casino";
  if (pathname.startsWith("/arena")) return "/search";
  if (pathname.startsWith("/bingo")) return "/search";
  return "/";
}

export function BrandBar() {
  const { openSideNav, openDeposit, bootDone } = useShell();
  const pathname = usePathname();
  const backArrow = showsBackArrow(pathname);
  const backHref = backHrefFor(pathname);
  const backLabel =
    backHref === "/casino"
      ? "Back to Casino"
      : backHref === "/search"
        ? "Back to Explore"
        : "Back to lobby";

  // On /search the brand bar sits directly on top of the page's own
  // sticky search-input band (which is also blue). To let the two
  // surfaces merge cleanly, the BrandBar drops its rounded bottom on
  // /search and the search band picks up the 20px radius at the
  // bottom of the combined blue panel instead.
  //
  // On /rewards the rounded bottom is kept — but AppShell paints
  // the mobile-frame surface brand-blue on that route, so the
  // small wedge of "behind the BrandBar" that the curve exposes
  // shows blue (matching the BrandBar) instead of #f5f5f5.
  const roundedBottom = pathname !== "/search";

  return (
    <header
      className="sticky top-0 z-30 bg-mrq-blue pb-[14px]"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 10px)",
        // Soft rounded bottom corners so the blue header reads as a
        // floating panel against the #f5f5f5 page canvas instead of a
        // flat band running edge-to-edge.
        borderBottomLeftRadius: roundedBottom ? "20px" : 0,
        borderBottomRightRadius: roundedBottom ? "20px" : 0,
      }}
    >
      <div className="relative h-[48px] px-[16px] flex items-center justify-between">
        {/* Left side: logo OR back-arrow, depending on route. Title is
            now rendered by the page itself so the brand bar stays
            visually quiet. */}
        {backArrow ? (
          // Translucent white pill mirroring the balance/avatar pill on
          // the right edge of the bar — matches Figma 177:35024 where
          // the back arrow sits inside the same glass chrome instead of
          // floating as a bare chevron.
          <Link
            href={backHref}
            aria-label={backLabel}
            className="grid size-[40px] place-items-center rounded-full active:scale-[0.96] transition-transform"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.18)",
              border: "1px solid rgba(255, 255, 255, 0.20)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.24)",
            }}
          >
            <BackIcon className="size-[20px] text-white" />
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

        {/* Right side: pass pill + wallet pill. */}
        <div className="flex items-center gap-[8px]">
          {/* Season Pass entry — pink diamond inside the same glass
              pill family as the balance/avatar. Routes to /passes
              (Weekly Pass landing, Figma 266:47065). Visible on every
              route that renders the BrandBar; AppShell already hides
              the BrandBar entirely on /passes/* and /play/* so the
              pill doesn't appear where it shouldn't. */}
          <Link
            href="/passes"
            aria-label="Open Season Pass"
            className="grid h-[48px] place-items-center rounded-full active:scale-[0.95] transition-transform"
            style={{
              paddingLeft: 18,
              paddingRight: 18,
              backgroundColor: "rgba(157, 171, 234, 0.32)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.22)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/nav-icons/diamond.svg"
              alt=""
              // Source SVG is 23×19 (≈1.21 ratio) — explicit width
              // + auto height preserves the aspect so the gem
              // doesn't squash. Sized to ~24px tall to sit
              // proportionally inside the 48px pill.
              style={{ width: 26, height: "auto", display: "block" }}
              draggable={false}
            />
          </Link>

          {/* Wallet pill — two tappable halves inside one rounded
              container. The cash text on the left opens the deposit
              sheet (mirrors the vision-01 pattern); the avatar on the
              right opens the side nav. A neutral divider sits between
              them inside the row. The container itself is a div, not
              a button, so each half captures its own taps without
              one stealing from the other. */}
          <div
            className="flex items-center gap-[12px] h-[48px] pl-[22px] pr-[5px] rounded-full"
            style={{
              backgroundColor: "rgba(157, 171, 234, 0.32)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.22)",
            }}
          >
          <button
            type="button"
            onClick={openDeposit}
            aria-label="Make a deposit"
            className="text-white text-[16px] leading-none font-extrabold pt-[1px] active:scale-[0.95] transition-transform"
          >
            {/* Wallet count-up — gated on bootDone so it waits for
                the SimpleSplashGate (z-65) to clear before the IO
                attaches. CountUpAmount holds 320ms after the gate
                flips so the splash exit (~220ms) is fully out of
                the way and the count-up's first frame is the
                visible "£0". 1500ms duration gives the 4-digit
                balance room to actually tick over.

                sessionKey pins this to first-load-of-session only.
                Without it, AppShell unmounts the BrandBar entirely
                on /passes and /play (those routes own their chrome),
                so navigating into a weekly-pass page and back here
                remounts a fresh CountUpAmount that re-animates from
                £0 — felt buggy because the "balance" appeared to
                reset every time. sessionStorage flag survives
                mount/unmount within the tab and clears on a hard
                reload. */}
            <CountUpAmount
              value="£113.48"
              gate={bootDone}
              durationMs={3500}
              sessionKey="brandbar-wallet-balance"
            />
          </button>
          <span
            className="h-[20px] w-px"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.22)" }}
            aria-hidden
          />
          <button
            type="button"
            onClick={openSideNav}
            aria-label="Open account menu"
            className="relative size-[38px] rounded-full overflow-hidden bg-white shrink-0 active:scale-[0.95] transition-transform"
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
          </button>
          </div>
        </div>
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

