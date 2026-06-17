"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useShell } from "@/lib/filter-context";
import { CountUpAmount } from "@/components/CountUpAmount";

// Feature flag — the pink-diamond Season Pass pill. Hidden for now in
// favour of the Qoins coin pill; flip to `true` to bring it back.
const SHOW_DIAMOND_BUTTON = false;

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

/** Routes that show a back arrow instead of the MrQ logo. */
function showsBackArrow(pathname: string): boolean {
  return (
    pathname.startsWith("/casino") ||
    pathname.startsWith("/live") ||
    pathname.startsWith("/bingo") ||
    pathname.startsWith("/arena")
  );
}

/** Where the back arrow leads.
 *  - Sub-pages within a vertical → the vertical homepage
 *  - Vertical homepages → /search (Explore), since all verticals are
 *    reached from the Explore page, not the lobby
 */
function backHrefFor(pathname: string): string {
  // Sub-pages drop back to their vertical homepage
  if (pathname.startsWith("/casino/")) return "/casino";
  if (pathname.startsWith("/live/"))   return "/live";
  // Vertical homepages + bingo + arena → Explore
  return "/search";
}

export function BrandBar() {
  const { openSideNav, openDeposit, bootDone } = useShell();
  const pathname = usePathname();
  const router = useRouter();
  const isQoins = pathname.startsWith("/qoins");
  const backArrow = showsBackArrow(pathname);
  const backHref = backHrefFor(pathname);
  const backLabel =
    backHref === "/casino" ? "Back to Casino" :
    backHref === "/live"   ? "Back to Live Casino" :
    backHref === "/search" ? "Back to Explore" :
    "Back to lobby";

  // On /search the brand bar sits directly on top of the page's own
  // sticky search-input band (which is also blue). To let the two
  // surfaces merge cleanly, the BrandBar drops its rounded bottom on
  // /search and the search band picks up the 20px radius at the
  // bottom of the combined blue panel instead.
  //
  // Rounded bottom corners everywhere except /search (where the page's
  // own blue search band follows the BrandBar seamlessly). On /rewards
  // the corners read against the navy gradient the page paints — AppShell
  // paints the mobile-frame navy on that route so the wedge behind the
  // curve shows navy (like the #f5f5f5 that My Q reveals).
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
        {isQoins ? (
          // On /qoins the MrQ logo is replaced by a back pill (Figma
          // 2523:54567) carrying the same glass styling as the balance
          // pill. Taps return to the previous page.
          <motion.button
            type="button"
            data-component="Button"
            onClick={() => router.back()}
            aria-label="Back"
            className="grid size-[44px] place-items-center rounded-full"
            // Grows in on mount — i.e. when landing on the Qoins page.
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              transformOrigin: "left center",
              backgroundColor: "rgba(157, 171, 234, 0.32)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.22)",
            }}
          >
            <ArrowLeftIcon className="size-[22px] text-white" />
          </motion.button>
        ) : backArrow ? (
          // Same glass back button as the Qoins page (44px lavender pill,
          // full arrow-left icon, grow-in + whileTap interaction). It
          // still navigates to the predictable parent destination
          // (backHref) rather than router.back(), so deep links/shares
          // land somewhere sensible.
          <motion.button
            type="button"
            data-component="Button"
            onClick={() => router.push(backHref)}
            aria-label={backLabel}
            className="grid size-[44px] place-items-center rounded-full"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              transformOrigin: "left center",
              backgroundColor: "rgba(157, 171, 234, 0.32)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.22)",
            }}
          >
            <ArrowLeftIcon className="size-[22px] text-white" />
          </motion.button>
        ) : (
          <Link
            href="/"
            aria-label="Go to lobby"
            className="shrink-0 active:scale-[0.96] transition-transform"
          >
            {/* Grows in on mount — i.e. when arriving at a logo route
                (e.g. tapping the Qoins back button to return to My Q),
                rather than appearing instantly. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src="/assets/logo-mrq.svg"
              alt="MrQ"
              className="h-[26px] w-[67px]"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            />
          </Link>
        )}

        {/* Right side: pass pill + wallet pill. */}
        <div className="flex items-center gap-[8px]">
          {/* Qoins entry — gold "Q" coin in the same glass pill family
              as the diamond/balance. Routes to the /qoins page (the
              Qoins prototype embedded inside the app shell), so it's a
              normal in-app navigation that keeps the BrandBar +
              BottomNav in place. */}
          <Link
            href="/qoins"
            aria-label="Open Qoins"
            data-component="Button"
            data-qoins-pill
            className="flex h-[44px] items-center gap-[6px] rounded-full active:scale-[0.95] transition-transform"
            style={{
              paddingLeft: 12,
              paddingRight: 16,
              // Translucent pink pill — Figma bg-pink (2519:54379) —
              // with the same glass treatment (blur + hairline border +
              // top inner-highlight) as the balance pill beside it.
              // design decision needed — this brand-pink hue (rgb 255,99,246)
              // is not tokenised in the DS; the only DS pink is
              // --colour-brand-pink-500 (#d000ca), a different magenta, so no
              // faithful token match. Left as-is pending a DS decision.
              backgroundColor: "rgba(255, 99, 246, 0.4)",
              backdropFilter: "blur(20px) saturate(140%)",
              WebkitBackdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.22)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/nav-icons/qoin.png"
              alt=""
              data-component="Icon"
              style={{ width: 24, height: 24, display: "block" }}
              draggable={false}
            />
            <span data-component="Typography" className="text-white text-[16px] font-extrabold leading-none pt-[2px]">
              87
            </span>
          </Link>

          {/* Season Pass entry — pink diamond inside the same glass
              pill family as the balance/avatar. Routes to /passes
              (Weekly Pass landing, Figma 266:47065). Hidden for now
              (replaced by the Qoins coin above); flip
              SHOW_DIAMOND_BUTTON back to `true` to restore it. */}
          {SHOW_DIAMOND_BUTTON && (
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
          )}

          {/* Wallet pill — two tappable halves inside one rounded
              container. The cash text on the left opens the deposit
              sheet (mirrors the vision-01 pattern); the avatar on the
              right opens the side nav. A neutral divider sits between
              them inside the row. The container itself is a div, not
              a button, so each half captures its own taps without
              one stealing from the other. */}
          <div
            className="flex items-center gap-[12px] h-[44px] pl-[18px] pr-[5px] rounded-full"
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
            data-component="Button"
            onClick={openDeposit}
            aria-label="Make a deposit"
            className="text-white text-[16px] leading-none font-extrabold pt-[2px] active:scale-[0.95] transition-transform"
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
            data-component="Button"
            onClick={openSideNav}
            aria-label="Open account menu"
            className="relative size-[36px] rounded-full overflow-hidden bg-white shrink-0 active:scale-[0.95] transition-transform"
            style={{
              border: "2px solid #ffffff",
            }}
          >
            <Image
              src="/assets/avatar.png"
              alt=""
              fill
              sizes="36px"
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

// Full arrow-left (shaft + head) — Figma "Icons/outline/arrow-left".
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      data-component="Icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable={false}
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

