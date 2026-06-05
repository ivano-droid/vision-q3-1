# Vision 1.1 — Context Document

> This file is the canonical briefing for building Vision 1.1 inside this repo.
> It captures the full picture of Vision 1 (the existing codebase), the design/product decisions worth preserving, what to cut, and a clean roadmap for what comes next.
> Read this before writing a single line of code.

---

## 1. Product Summary

**What is Vision?**
A mobile-first casino app prototype for MrQ — a UK online gaming platform. The prototype simulates the full casino experience: lobby, slots, live tables, bingo, a social reels feed, competitive arena rankings, a rewards programme, and weekly pass subscriptions. It is not a real money product — it's a polished product/design prototype used to explore UX patterns, validate ideas, and demo direction.

**Who is it for?**
Internal: MrQ product, design, and engineering stakeholders. External: potential partners, agencies, and presentations.

**What makes it good right now?**
- The app shell (BrandBar, BottomNav, SideNav) feels production-quality and brand-right.
- The casino and live verticals are genuinely well-structured.
- Search/Explore has solid UX — live filtering, cross-vertical, no-friction.
- The design system is clean, consistent, and properly MrQ.
- Animations (route transitions, tab pill, sheet entrances) feel native, not web-y.
- The Discover reels are technically impressive (video windowing, preload tiers, infinite scroll).

**What is Vision 1.1?**
A focused, smaller rebuild of Vision 1. Same brand quality, same shell feel — but with scope tightened to the core verticals (Casino, Live, Bingo, Search, Rewards), cutting the complexity that slowed iteration (Discover video system, Arena competitive mode, Passes flow, triple-gate boot sequence). The goal is a fast, beautiful, maintainable prototype that can be iterated in hours, not days.

---

## 2. Current App Architecture

### Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + PostCSS |
| Animation | Framer Motion 12 |
| State | React Context (single ShellProvider) |
| Fonts | Gilroy (local TTF/OTF) + Anton + Manrope (Google Fonts) |
| Platform target | Mobile-first, 375px design basis, PWA-ready |
| Deployed | Vercel |

### Routing Structure (App Router)
```
/                       Home lobby
/casino                 Casino vertical
/casino/[category]      Category grid (New, Jackpot, Megaways, etc.)
/casino/games           All 50 casino games
/live                   Live casino vertical
/live/[category]        Live category grid
/live/games             All live games
/bingo                  Bingo rooms lobby
/discover               Reels/TikTok feed (video-heavy)
/search                 Unified search + filter
/rewards                Rewards + offers tabs
/arena                  Leaderboard + ranked play
/arena/prize            Prize reveal flow
/passes                 Weekly pass tiers
/play/buffalo-bills     Full-bleed game canvas
```

### State Model
Single React Context (`ShellProvider` / `filter-context.tsx`) manages:
- `sideNavOpen` / `openSideNav()` / `closeSideNav()`
- `depositOpen` / `openDeposit()` / `closeDeposit()`
- `gameDetails` / `openGameDetails()` / `closeGameDetails()`
- `bootDone` / `markBootDone()`

No Zustand, Redux, or server state. All data is hardcoded in lib files. The simplicity is the right call — keep it.

### Data Layer
All data is hardcoded TypeScript. Key files:
- `games-catalogue.ts` — `GameDetails` type, full game registry with RTP, volatility, provider, bet range
- `casino-categories.ts` — 6 casino sub-categories, tile arrays per category
- `live-categories.ts` — 5 live sub-categories, `LiveGame` type (includes dealer, players, recent roulette results)
- `bingo-rooms.ts` — 5 rooms, `BingoRoom` type
- `searchable-games.ts` — Unified cross-vertical list powering search
- `game-filters.ts` — Filter model (RTP ranges, volatility, bet, sort), `applyFilters()` helper

### Component Organisation
```
/src/components/
  AppShell.tsx          App-wide chrome wrapper
  BrandBar.tsx          Top bar (logo, balance, back arrow)
  BottomNav.tsx         4-tab pill nav
  SideNav.tsx           Account drawer (85% width slide-in)
  DepositSheet.tsx      Bottom sheet for deposits
  GameDetailsSheet.tsx  Game preview bottom sheet
  CategoriesSheet.tsx   Category selector bottom sheet
  ResumePlayingBar.tsx  "Resume playing" CTA above nav
  SimpleSplashGate.tsx  Boot splash (1.5s)
  WelcomeGate.tsx       New-user onboarding flow
  LoginGate.tsx         Login screen overlay
  /views/               Full-page view components (one per route)
  /rails/               Scrollable content units (GameRail, HeroCarousel, etc.)
```

---

## 3. Key Screens

### Home (`/`)
Hero carousel → Recently Played (2×2) → Big Wins row → Same Vibe recommendations → Hot Right Now rail → Latest Big Wins social feed → Q Rewards card. Heavy on content. Lots of rails stacked vertically.

### Casino (`/casino`)
Swipeable hero deck → Top 10 rail → Game rails by category (New, Jackpot, Megaways, Slingo, Tables, Live) → Categories+ sheet trigger. Standard casino lobby pattern.

### Live Casino (`/live`)
Mirrors Casino structure. Live game cards include dealer name, min bet, player count, and for roulette: a recent-results spin history chip row.

### Bingo (`/bingo`)
5 room cards with artwork, ticket price, jackpot, next-game timer, ball count, player count. Clean and minimal already.

### Discover (`/discover`)
TikTok-style vertical snap-scroll. 6 base video reels, looped to max 24. Video windowing optimisation (5 concurrent decoders). Interspersed interstitial slides (SuggestionCard at reel 4, ArenaPromoSlide at reel 8, FreeSpinsPromoSlide at reel 12). Fixed game chrome overlaid on video.

### Search (`/search`)
Default: Start Browsing tiles + Category mega-cards + editorial rails + Browse All grid. Active (focused/has query): Full-screen modal with live filtering across 100+ games. Filter chips: Category, Provider, RTP, Volatility, Min/Max Bet, Sort.

### Rewards (`/rewards`)
Two tabs (My Rewards / Offers) with animated sliding pill switcher. My Rewards: hero with ellipse graphic, Available to Collect carousel, In Progress card. Offers: This Week grid, All Offers banner.

### Arena (`/arena`)
Today's rank card (#14), top-3 leaderboard + current user row, Play to Climb carousel, Yesterday's Results, All Eligible Games carousel. Blue gradient background.

### Passes (`/passes`)
Weekly Pass tiers (Plus / Flex / Premium). Own surface treatment.

### Game (`/play/buffalo-bills`)
Full-bleed navy game canvas with custom in-game header replacing global chrome (no BrandBar or BottomNav).

---

## 4. Key Components

### Worth Keeping As-Is
| Component | Why |
|---|---|
| `AppShell` | The entire chrome architecture — clean, correct, performant |
| `BrandBar` | Handles back-button logic elegantly, balance pill is well-placed |
| `BottomNav` | Animated sliding pill is polished and on-brand. Keep the geometry. |
| `SideNav` | Clean account drawer, body-scroll lock, Esc-to-close |
| `GameDetailsSheet` | Essential UX pattern. RTP/volatility/provider metadata layout is right. |
| `DepositSheet` | Simple sheet, good pattern |
| `SimpleSplashGate` | Boot screen is tight |
| `ShellProvider` | Minimal context, exactly right scope |
| `haptics.ts` | Great utility, zero overhead, enhances feel on device |
| `globals.css` | Design tokens are solid, safe-area insets are correct |

### Worth Keeping With Simplification
| Component | What to simplify |
|---|---|
| `HeroCarousel` | Keep, but consider removing autoplay / reducing complexity |
| `GameRail` | Good pattern, but could remove `useDraggableScroll` if not needed |
| `CategoriesSheet` | Good pattern, but category list could be flattened |
| Home page | Strip to: Hero + Recently Played + Hot Right Now + Q Rewards. Remove BigWins, SameVibe, LatestBigWins. |
| Boot gates | Reduce to SimpleSplash → LoginGate only. Remove WelcomeGate complexity. |
| Search | Keep modal + live filter pattern. Reduce facets to: Category + Provider + Sort (drop RTP/Volatility/Bet initially). |

### Safe to Remove in Vision 1.1
| Component | Reason |
|---|---|
| `ResumePlayingBar` | Additive UX, not core |
| `BigWinsRow` + `CountUpAmount` | Decorative animation, slows iteration |
| `SameVibeRail` | Recommendations engine — complex, not MVP |
| `LatestBigWinsRow` | Social feed — nice, not core |
| `Top10Rail` | Secondary ranking feature |
| `CategoryMegaCardsRail` | Visual complexity, multi-thumbnail grid |
| `SwipeableHero` | Complex deck interaction — HeroCarousel is simpler equivalent |
| `ThemesGrid` / `FreeSpinsBanner` | Secondary content |
| `WelcomeGate` | Onboarding flow adds complexity; simplify to Login only |
| All Discover components | Video system is the single biggest complexity source |
| All Arena components | Competitive mode is a secondary vertical |
| All Passes components | Subscription flow is out of scope for 1.1 |

---

## 5. Design System Notes

### Colours
```css
--mrq-blue: #0a2ecb          /* primary brand, backgrounds, CTAs */
--mrq-blue-dark: #0c2287     /* depth, text on blue, dark surfaces */
--mrq-divider: #d9d9d9       /* borders, dividers */
background: #f5f5f5          /* default page canvas */
background: #101626          /* game full-bleed (navy) */
```
Blue dominates. White supports. Accent colours (yellow, green, pink) are used in illustrations only.

### Typography
- **Gilroy** — loaded locally from `/public/fonts/`. Primary UI font (body, CTAs, labels).
  - ExtraBold for emphasis, Medium for body copy.
- **Anton** — Google Fonts substitute for Formula Condensed Bold (MrQ's actual headline font). Used for big promotional headlines ("BIG WEEKENDER").
- **Manrope** — Google Fonts fallback for Gilroy ExtraBold.
- Note: In production MrQ uses Formula Condensed Bold. Anton is a reasonable stand-in for prototypes.

### Layout
- Mobile frame: 375px wide, full viewport height
- Desktop: centered with blue drop-shadow (simulates phone)
- All measurements assume iPhone 14 Safe Areas:
  - Top: `env(safe-area-inset-top)` for notch
  - Bottom: `env(safe-area-inset-bottom)` for home indicator
- Bottom nav height: `calc(68px + env(safe-area-inset-bottom))`
- BrandBar height: 68px, sticky

### Animation Conventions
- Route transition: `opacity 0→1`, `y 6→0`, 260ms, `cubic-bezier(0.22, 1, 0.36, 1)` (snappy ease-out)
- Sheet entrance: slide up from bottom, backdrop fade
- Tab pill: spring animation (`stiffness: 380, damping: 35`)
- Special routes own their entrance (Discover, Search, Arena) — no global transition override
- Framer Motion via `AnimatePresence` + `motion.main` on each page

### Scrollbars
`.no-scrollbar` hides all scrollbars on horizontal rails — always apply to carousels.

### Key Numeric Constants
| Element | Value |
|---|---|
| Game tile | 109×109px |
| Bottom nav width | 351px |
| Bottom nav height | 60px |
| BrandBar height | 68px |
| SideNav width | 85%, max 320px |
| Mobile frame | 375px |

---

## 6. Important Implementation Details

1. **Route-based surface colour** — `AppShell` reads `usePathname()` to set `backgroundColor`. Don't fight this — extend it by adding new cases when adding routes.

2. **Boot gate layer order** — Three gates (`SimpleSplashGate`, `WelcomeGate`, `LoginGate`) render simultaneously; `localStorage.hasLoggedIn` controls which is visible. Vision 1.1 should simplify to two gates max (splash + login).

3. **`--frame-right-offset` CSS var** — Used to position absolutely-placed elements correctly when the mobile frame is centered on desktop. Any fixed/absolute overlay must reference this.

4. **`draggable="false"` on images** — All `<img>` tags in rails/carousels set `draggable={false}` to prevent image drag interfering with scroll gestures. Always do this.

5. **Next.js Image avoided** — `<img>` tags used throughout for explicit aspect ratio control. This is intentional — keep it consistent rather than mixing.

6. **`useDraggableScroll`** — Enables mouse-drag on horizontal carousels for desktop. Works well but isn't needed on touch. Worth keeping if desktop preview is important.

7. **`prefers-reduced-motion` in haptics** — `haptics.ts` checks `matchMedia('(prefers-reduced-motion: reduce)')` before vibrating. Keep this pattern in all motion-adjacent utilities.

8. **Game catalogue as source of truth** — `games-catalogue.ts` is the registry. Any new game needs an entry here before it can surface in sheets, search results, or detail views.

9. **`AGENTS.md` / `CLAUDE.md`** — The project notes this is a non-standard Next.js version. Always check `node_modules/next/dist/docs/` before writing Next.js code.

10. **PWA metadata** — `manifest.ts` handles installability. Don't remove `apple-mobile-web-app-capable` or `viewport-fit: cover` — these enable the notch + home indicator CSS vars to work.

---

## 7. What to Preserve in Vision 1.1

### Core Architecture
- App Router structure (file-based routes, layout.tsx root)
- `AppShell` + `ShellProvider` pattern — do not replace
- Bottom nav with animated pill (the geometry and spring animation are right)
- Route transition system (fade-up, 260ms, route-based surface colours)
- Sheet pattern (bottom sheets for deposits, game details, categories)

### Verticals
- Casino (core product)
- Live Casino (strong companion to Casino)
- Bingo (already minimal, keep as-is)
- Search/Explore (excellent UX, worth the complexity)
- Rewards (core loyalty loop)

### Design Tokens
- Keep `globals.css` entirely — design tokens are well-structured
- Keep the Gilroy font stack
- Keep the safe-area inset pattern
- Keep the `--frame-right-offset` desktop positioning var

### UX Patterns
- Tap-to-open GameDetailsSheet from any game tile
- DepositSheet from balance pill
- SideNav from avatar/hamburger
- Categories+ sheet from pill buttons
- Body-scroll lock when overlays are open
- Haptic feedback on key interactions

### Brand Rules
- #0a2ecb blue as default background for brand surfaces (nav bar, home header)
- White text on blue, dark text on white
- Gilroy ExtraBold for emphasis, Gilroy Medium for body
- Anton/Formula for big promotional headlines
- Sticker illustrations from secondary palette on blue backgrounds
- Logo: white on blue, blue on white — never on other colours

---

## 8. What to Simplify in Vision 1.1

### Remove Entirely
| Feature | Current complexity | Decision |
|---|---|---|
| Discover (Reels) | 6 video files, window manager, preload tiers, interstital slides, infinite scroll | Remove. Impressive but not core. Phase 2. |
| Arena mode | Leaderboard, ranking, prize reveal, eligible games | Remove. Not a core vertical for MVP. |
| Passes flow | Weekly pass tiers, custom surface | Remove. Subscription complexity not needed. |
| WelcomeGate | New-user onboarding multi-step | Remove. Simplify boot to: Splash → Login. |
| Resume Playing Bar | Float above nav | Remove. Nice-to-have. |

### Simplify Significantly
| Feature | Current state | Vision 1.1 target |
|---|---|---|
| Home page | 7+ content sections | 3 sections: Hero, Hot Right Now, Q Rewards |
| Search filters | 6 filter types + sort | 3: Category, Provider, Sort |
| Casino home | SwipeableHero deck + Top10 + 6 category rails | Standard HeroCarousel + 4 category rails |
| BottomNav | 4 tabs: My Q, Top Picks, Explore, Rewards | 4 tabs: same — but remove Arena/Passes from routing |
| Boot gates | 3 gates | 2 gates: SimpleSplash + Login |

### Deduplicate
- `CasinoAllGamesView` and `LiveAllGamesView` are the same component with different data — extract a shared `AllGamesView`.
- `CasinoCategoryView` and `LiveCategoryView` are mirrors — extract a shared `CategoryView`.
- `HeroCarousel` and `SwipeableHero` overlap — keep only `HeroCarousel`.

---

## 9. Suggested Roadmap for Vision 1.1

### Phase 0 — Foundation (Day 1)
> Get the shell running, routes stubbed, design system verified.

- [ ] Clean up boot gate: SimpleSplash → LoginGate (remove WelcomeGate)
- [ ] Confirm AppShell, BrandBar, BottomNav, SideNav all work
- [ ] Stub routes: `/`, `/casino`, `/live`, `/bingo`, `/search`, `/rewards`
- [ ] Remove routes: `/discover`, `/arena`, `/arena/prize`, `/passes`
- [ ] Verify design tokens, fonts, safe-area insets load correctly
- [ ] Confirm route transitions work

### Phase 1 — Core Verticals (Days 2–4)
> Casino, Live, Bingo — clean and complete.

- [ ] Home: Hero + Hot Right Now rail + Q Rewards card
- [ ] Casino: HeroCarousel + 4 category rails + Categories+ sheet + `/casino/[category]` grids + `/casino/games`
- [ ] Live: Mirror of Casino with LiveGame data + live table cards
- [ ] Bingo: 5 room cards (already minimal — carry forward largely unchanged)
- [ ] GameDetailsSheet: working on all game tiles across all verticals
- [ ] DepositSheet: working from balance pill

### Phase 2 — Search & Rewards (Days 5–6)
> Discovery and loyalty — essential for completeness.

- [ ] Search: full-screen modal, live text filter, 3 filter facets (Category, Provider, Sort)
- [ ] Rewards: My Rewards tab with hero + collect carousel + in-progress card
- [ ] Offers tab: this week + all offers

### Phase 3 — Polish (Days 7–8)
> Animations, edge cases, mobile feel.

- [ ] Audit all route transitions (special surfaces: rewards = blue, game = navy)
- [ ] Haptics on: nav tabs, game tile taps, sheet open/close, CTA buttons
- [ ] Test all sheets (deposit, game details, categories, side nav)
- [ ] Test on real device (iPhone): safe areas, scroll feel, tap targets
- [ ] Desktop preview: frame centering, `--frame-right-offset` overlays

### Phase 4 — Optional (Future)
> Add back what was cut — once the core is stable.

- [ ] Discover/Reels — video reels feed
- [ ] Arena — competitive ranking system
- [ ] Passes — weekly pass subscription
- [ ] Resume Playing Bar
- [ ] Big Wins row with count-up animations
- [ ] Same Vibe recommendations

---

## 10. Files to Carry Forward Unchanged

These files can be copied directly into Vision 1.1 without modification:

```
src/app/globals.css
src/app/manifest.ts
src/app/layout.tsx (minor trim: remove WelcomeGate import)
src/components/AppShell.tsx (minor trim: remove Discover/Arena/Passes surface cases)
src/components/BrandBar.tsx
src/components/BottomNav.tsx
src/components/SideNav.tsx
src/components/DepositSheet.tsx
src/components/GameDetailsSheet.tsx
src/components/CategoriesSheet.tsx
src/components/SimpleSplashGate.tsx
src/components/LoginGate.tsx
src/lib/filter-context.tsx
src/lib/games-catalogue.ts
src/lib/casino-categories.ts
src/lib/live-categories.ts
src/lib/bingo-rooms.ts
src/lib/searchable-games.ts
src/lib/game-filters.ts (simplify: remove RTP/Volatility/Bet filter types if desired)
src/lib/haptics.ts
src/hooks/useDraggableScroll.ts
next.config.ts
tsconfig.json
tailwind.config.* (if present)
public/fonts/ (all Gilroy files)
public/assets/ (all, except /videos if Discover is removed)
```

---

## 11. Key Assumptions the App Makes

1. **No real authentication** — `localStorage.hasLoggedIn` is the only auth signal. The Login gate is cosmetic.
2. **No real money/balance** — The balance pill shows a hardcoded value. Deposit flow goes nowhere.
3. **No real game launch** — `/play/buffalo-bills` is a canvas stub. Other game tiles open the GameDetailsSheet, not a real game.
4. **No real API** — All data is hardcoded TypeScript. No fetching, no loading states.
5. **No real videos** — Discover reels are pre-encoded local MP4s, not a streaming CDN.
6. **375px is the canonical design width** — Everything is sized for iPhone 14. Nothing is tested at other breakpoints except "desktop preview" (which just scales the mobile frame).
7. **PWA context matters** — CSS for the bottom nav and BrandBar behaves differently in PWA standalone mode vs. browser. Both are handled.
8. **Prototype fidelity** — This is a demo, not a product. Some interactions are stubs (e.g. tapping "Play" routes to Buffalo Bills regardless of which game was tapped). That's fine and expected.

---

*Document created: June 2026. Reflects state of Vision q3 codebase as audited.*
