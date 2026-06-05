import { notFound } from "next/navigation";
import { LiveSectionView } from "@/components/views/LiveSectionView";
import { getLiveSectionBySlug, LIVE_SECTION_SLUGS } from "@/lib/live-sections";

export default async function LiveSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getLiveSectionBySlug(slug);
  if (!section) notFound();
  return <LiveSectionView section={section} />;
}

export async function generateStaticParams() {
  return LIVE_SECTION_SLUGS.map((slug) => ({ slug }));
}
