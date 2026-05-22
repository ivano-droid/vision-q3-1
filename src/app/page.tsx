import { TopNav } from "@/components/TopNav";
import { BottomBar } from "@/components/BottomBar";
import { LobbyContent } from "@/components/LobbyContent";
import { SideNav } from "@/components/SideNav";
import { FilterProvider } from "@/lib/filter-context";

/**
 * MrQ concept lobby.
 *
 * Wrapped in <FilterProvider> so the sub-filter pills (inside TopNav) and the
 * content area (LobbyContent) share state — clicking Casino / Live / Bingo
 * highlights the pill AND swaps the content view below.
 */
export default function Home() {
  return (
    <FilterProvider>
      <div className="mobile-frame">
        <TopNav />

        <main className="bg-white">
          <LobbyContent />
          {/* Bottom safe area — just enough to clear the floating bottom bar
              (44px home + ~20px gap + safe-area inset). The earlier 144px
              gap left a lot of empty white below shorter views. */}
          <div style={{ height: "max(96px, calc(env(safe-area-inset-bottom) + 96px))" }} aria-hidden />
        </main>

        <BottomBar />
        <SideNav />
      </div>
    </FilterProvider>
  );
}
