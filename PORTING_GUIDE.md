# Porting Guide — vision-q3-1 → single static build

This document exists for an automated **port** of this app into one self-contained,
runnable static HTML artifact (in-browser React + Babel, real CSS instead of Tailwind,
CSS/JS instead of framer-motion). It captures the **invisible scaffolding** a porter
can't easily infer from reading JSX alone.

**Fidelity contract:** verbatim port. Do not redesign, rename, restyle, or "improve".
Match this repo exactly. Where something can't port cleanly, reproduce it as closely as
possible and **flag it** — don't invent.

---

## 0. What's static-portable

- **All screen data is static** — hard-coded arrays in `src/lib/*.ts` and inline in each
  `page.tsx`/View component. There is **no server data, no API, no env-gated content**.
  So every screen can be reproduced fully client-side.
- State is local React + a small context (`src/lib/filter-context.tsx`, `useShell`) and
  `localStorage`/`sessionStorage`. No backend.

---

## 1. The mobile-frame system (critical — get this first)

The whole app renders inside a centered **mobile column**, not full-bleed.

- `--mobile-width: 375px`. On viewports ≥600px the `.mobile-frame` is `max-width:375px`,
  centered (`margin-inline:auto`) with a drop shadow — a "phone on desktop" look. The area
  outside the frame is a light-grey backdrop.
- `--frame-right-offset`: `0px` on phones; on desktop `max(0px, calc(50vw - 187.5px))`.
  **Every `position:fixed`/sticky overlay** (BottomNav, gates, sheets, search modal) uses
  `left: var(--frame-right-offset); right: var(--frame-right-offset)` so it stays pinned to
  the 375px column instead of spanning the monitor. Reproduce this exactly or fixed
  elements will span the whole window.
- `--bottom-nav-h: calc(68px + env(safe-area-inset-bottom))`.
- Safe-area insets (`env(safe-area-inset-top/bottom)`) are used throughout for top/bottom
  padding. On desktop these resolve to 0 — fine to treat as 0 in the port.

Source: `src/app/globals.css` (`:root`, `.mobile-frame`).

---

## 2. Global chrome & boot sequence

`src/app/layout.tsx` → wraps everything in `<AppShell>` (`src/components/AppShell.tsx`).
AppShell renders, in order:

1. `.mobile-frame` wrapper (background tint varies by route — see §3).
2. `<BrandBar />` — **sticky top**, brand-blue, z-30. Left = MrQ logo / back-arrow / Qoins
   back pill (route-dependent); right = Qoins coin pill + wallet/avatar pill.
3. `<main>` — the route content (with a per-route entrance transition, §6).
4. `<BottomNav />` — **fixed bottom**, floating frosted pill, z-40, with a scrim + progressive
   blur behind it (z-30).
5. `<SideNav />`, `<DepositSheet />` — slide-in overlays opened from BrandBar.
6. **Boot gate stack**, all mounted from first paint:
   - `<SimpleSplashGate />` (z-65) — brand splash.
   - `<WelcomeGate />` — first-run welcome.
   - `<LoginGate />` (z-55) — login form.

**Boot logic (localStorage key `hasLoggedIn`):**
- First-time (no flag): SimpleSplashGate dismisses instantly → WelcomeGate shown → user
  taps through → LoginGate → tapping "Log in" sets `hasLoggedIn=1` and fades the gate → app.
- Returning (`hasLoggedIn=1`): WelcomeGate + LoginGate self-dismiss; SimpleSplashGate holds
  ~1.5s then dismisses → straight into the app.
- "Reset onboarding" in SideNav clears `hasLoggedIn`.
- The port should reproduce the gate flow; a simple "click to continue" through
  Splash → Welcome → Login → app is faithful.

**Routes that own their chrome** (no global BrandBar/BottomNav): `/play/*`, `/passes/*`
(`ownsChrome` in AppShell). These paint their own header/footer.

---

## 3. Per-route surfaces (AppShell)

- **Brand surfaces** `/rewards`, `/arena`: mobile-frame top = `#0a2ecb` (brand blue), main
  overscroll floor = `#181f43`. The page paints its own gradient; BrandBar keeps rounded
  bottom corners that read against these.
- **Game surface** `/play/*`: `#101626` dark navy, full-bleed, own chrome.
- **Everything else**: `.mobile-frame` default `#f5f5f5`, `<main>` `#f5f5f5`.
- Page-entrance transition is **skipped** on: `/play/*`, `/passes/*`, `/discover`,
  `/search`, `/casino*`, `/live*`, `/qoins`, `/rewards`, `/arena` (see `skipPageTransition`).

---

## 4. Route → screen map

| Route | Renders | Notes |
|---|---|---|
| `/` | `HomeView` (My Q lobby) | BottomNav "My Q" tab |
| `/search` | inline SearchPage + `LobbyContent`-style rails | "Explore" tab; sticky blue search band, see §6 |
| `/rewards` | inline RewardsPage | "Rewards" tab; dark gradient, animated header curve, see §6 |
| `/discover` | Top-Picks reels feed | scroll-snap, no scrim |
| `/casino` | `CasinoView` | sticky sub-nav (`CasinoSubNav`) |
| `/casino/[category]` | `CasinoCategoryView` | dynamic — categories in `lib/casino-categories.ts` |
| `/casino/section/[slug]` | `CasinoSectionView` | slugs in `lib/casino-sections.ts` |
| `/casino/games` | `CasinoAllGamesView` | |
| `/live`, `/live/[category]`, `/live/section/[slug]`, `/live/games` | `LiveCasino*View` | `lib/live-*.ts` |
| `/bingo` | `BingoView` | `lib/bingo-rooms.ts` |
| `/arena`, `/arena/prize` | arena pages | brand-blue→dark gradient |
| `/passes` | `WeeklyPassView` | owns chrome (own header + sticky CTA) |
| `/play/buffalo-bills` | `BuffaloBillsView` | owns chrome; full-bleed game surface |
| `/qoins` | embedded static prototype | **special — see §8** |

Dynamic routes (`[category]`, `[slug]`) use `generateStaticParams`; the concrete slugs live
in the matching `lib/*.ts`. Port them as static screens, one per slug.

---

## 5. Navigation graph

- **BottomNav** (`src/components/BottomNav.tsx`): 3 tabs — **My Q** → `/`, **Explore** →
  `/search`, **Rewards** → `/rewards`. `/casino`, `/live`, `/bingo`, `/arena` keep the
  **Explore** tab lit (they're reached from Explore).
- **BrandBar** left element by route:
  - logo (→ `/`) on top-level routes;
  - back-arrow on `/casino*`, `/live*`, `/bingo`, `/arena` → goes to the parent
    (`/casino/*`→`/casino`, `/live/*`→`/live`, vertical homepages→`/search`);
  - Qoins back pill on `/qoins` → previous page.
- Explore "Start Browsing" tiles → `/casino`, `/live`, `/bingo`, `/arena`.
- Replace all `next/link` + `useRouter` with hash routing or in-app state.

---

## 6. Animation inventory (framer-motion → reproduce in CSS/JS)

Match these specs. For components not detailed here, read the file and copy the
`transition`/`initial`/`animate` props verbatim.

- **Page entrance** (AppShell, non-skipped routes): `initial {opacity:0, y:6}` →
  `animate {opacity:1, y:0}`, `duration 0.26`, ease `cubic-bezier(0.22,1,0.36,1)`, keyed on
  pathname.
- **BrandBar** logo / back button / Qoins pill: grow-in `{opacity:0, scale:0.6}` →
  `{opacity:1, scale:1}`, `duration 0.32`, ease `(0.22,1,0.36,1)`, `transform-origin:left center`.
  Wallet balance uses a count-up (`CountUpAmount`).
- **BottomNav active pill**: spring `stiffness 380, damping 42, mass 1`; animates x + width
  to center on the active tab.
- **BottomNav progressive blur**: 7 stacked `backdrop-filter: blur()` layers (24→0.5px),
  each masked to an overlapping band so blur is strongest at the bottom and fades up. See
  `PROGRESSIVE_BLUR_LAYERS` in `BottomNav.tsx` — copy the mask gradients exactly.
- **Rewards header curve** (`AnimatedHeaderCurve` in `src/app/rewards/page.tsx`): an SVG path
  whose bottom edge morphs **straight → convex** on mount. `d` springs from
  `"M0,0 H100 V20 Q50,20 0,20 Z"` to `"M0,0 H100 V20 Q50,60 0,20 Z"`, spring
  `stiffness 170, damping 12, mass 1, delay 0.04`. SVG is `viewBox 0 0 100 40`,
  `preserveAspectRatio="none"`, `overflow:visible` (so the bounce isn't clipped),
  `height 40, margin-top -12`.
- **Rewards greeting** ("Evening, James"): `{opacity:0, y:4}` → `{opacity:1, y:0}`,
  `duration 0.45, delay 0.4`.
- **Rewards in-progress bar**: gradient fill width springs `48% → 62%`,
  spring `stiffness 150, damping 10, mass 0.8, delay 0.35`.
- **Rewards daily-game rail**: edge-to-edge horizontal scroll-snap; each card
  `flex: 0 0 calc(100% - 40px)` (next card peeks ~24px).
- **Explore search band** (`src/app/search/page.tsx`): on mount the blue band animates
  `height 0 → auto` (`duration 0.4`) to "open" downward; the search pill fades in
  `{opacity:0, y:-6}` → `{opacity:1, y:0}` `duration 0.32, delay 0.3`. On scroll-down the
  band condenses (top/bottom padding −4px, `transition: padding 0.18s`), restored on scroll-up.
  Band sticks at `top: calc(safe-area + 72px)` (the BrandBar height).
- **Search modal**: full-screen white overlay, `opacity 0→1` `duration 0.18`.

---

## 7. Design tokens

- Brand blue `--mrq-blue: #0a2ecb`; brand dark `--mrq-blue-dark: #0c2287`;
  border-tertiary `#cccdd0`; divider `#d9d9d9`.
- Rewards gradient `linear-gradient(180deg, #0c2287 0%, #181f43 100%)`.
- Pink accents `#d000ca`; progress gradient `linear-gradient(90deg,#f05cd2,#d000ca 54%,#8f47f1)`.
- Radii: cards 12–16px, pills/buttons 8–12px, full-round nav/avatar.
- **Fonts (read carefully):** the running app uses **Manrope** (`--font-manrope`, Google)
  as a free stand-in for the proprietary **Gilroy**, and **Anton** (`--font-anton`) as a
  stand-in for Formula Condensed Bold — both via `next/font/google`. The CSS lists
  `font-display: "Gilroy", var(--font-manrope), …` so it uses Gilroy *if present*, else
  Manrope. The real Gilroy `.woff2` files DO exist in `public/qoins/fonts/`. **Choose one and
  state it:** for "what the app actually renders today" use Manrope; for "true brand" `@font-face`
  the Gilroy files. Don't silently pick a third font.

---

## 8. Gotchas — handle explicitly, don't guess

- **`/qoins` is a nested static prototype, not ordinary React.** `src/app/qoins/page.tsx`
  `fetch()`es `/qoins/styles.css`, rewrites its `url(./…)` references to absolute
  `/qoins/…`, injects it into a `<style>`, and renders a bespoke DOM with its own assets,
  Gilroy fonts, and a Lottie/confetti JSON (`/qoins/assets/confetti.json`). The entire
  `public/qoins/` folder is a self-contained build. Easiest faithful port: serve
  `public/qoins/` as-is (or iframe it) rather than re-implementing.
- **`next/image`** is used in ~5 files — replace with plain `<img>` (and drop the `fill`/
  `sizes` props; use CSS `object-fit:cover`).
- **`next/font`** won't exist — load Manrope/Anton from Google Fonts CDN (or `@font-face`
  Gilroy from `public/qoins/fonts/`).
- **`haptics`** (`src/lib/haptics.ts`) — `navigator.vibrate`; a no-op on desktop, safe to stub.
- **`dangerouslyAllowSVG`** — SVGs in `/public` are served directly; just use them.
- **localStorage `hasLoggedIn`** gates the boot flow (§2); legacy `sessionStorage` keys are
  cleared on mount and can be ignored.
- **Sticky/fixed overlays** must use `--frame-right-offset` (§1) or they break on desktop.
- **Scroll-direction logic** (Explore condense) listens to `window.scroll`; the port's scroll
  container must be the window (or adapt the listener).

---

## 9. Assets

- App art: `public/assets/**` (games, rewards, nav-icons, search, bingo, promo, login,
  qrewards, welcome, …). Import the real files; no placeholders.
- Qoins art/fonts/animation: `public/qoins/**`.
- Read `README.md` and `VISION_1_1_CONTEXT.md` for product intent.
