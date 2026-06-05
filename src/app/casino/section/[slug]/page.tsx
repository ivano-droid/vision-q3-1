import { notFound } from "next/navigation";
import { CasinoSectionView } from "@/components/views/CasinoSectionView";
import { getSectionBySlug, SECTION_SLUGS } from "@/lib/casino-sections";

export default async function CasinoSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section) notFound();
  return <CasinoSectionView section={section} />;
}

export async function generateStaticParams() {
  return SECTION_SLUGS.map((slug) => ({ slug }));
}
