import { notFound } from "next/navigation";
import { CasinoCategoryView } from "@/components/views/CasinoCategoryView";
import { CATEGORY_KEYS } from "@/lib/casino-categories";

/**
 * Per-category Casino page, e.g. `/casino/jackpot`.
 *
 * Destination for the "See all" links on each rail in the main /casino
 * page. Unknown categories 404 — we don't want stale links dropping
 * users into a blank wall.
 *
 * In Next.js 16 `params` is a Promise that we await on the server, then
 * forward the resolved key to the client view (CasinoCategoryView owns
 * the visual treatment).
 */
export default async function CasinoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORY_KEYS.includes(category)) notFound();
  return <CasinoCategoryView category={category} />;
}
