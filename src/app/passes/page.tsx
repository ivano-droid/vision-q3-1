import { WeeklyPassView } from "@/components/views/WeeklyPassView";

// Weekly Pass landing page (Figma 266:47065). Three tier tabs —
// Plus / Flex / Premium — sit under a brand-blue header. The Plus
// tab is the default and the only one with full content in this
// build (Flex / Premium tabs render a placeholder).
//
// Entered via the first hero promo card on the home lobby
// (HeroCarousel `car1.href = "/passes"`). The page owns its own
// chrome — the global BrandBar, BottomNav, and ResumePlayingBar
// are all hidden by AppShell on /passes/*.
export default function PassesPage() {
  return <WeeklyPassView />;
}
