import { BuffaloBillsView } from "@/components/views/BuffaloBillsView";

/**
 * /play/buffalo-bills — full-screen game page reachable from the
 * Recently Played Games grid on the My Q lobby.
 *
 * AppShell hides BrandBar + BottomNav on /play/* routes and sets the
 * mobile-frame surface to dark navy, so this page can paint its own
 * in-game header + dark backdrop without the global chrome competing.
 */
export default function BuffaloBillsPage() {
  return <BuffaloBillsView />;
}
