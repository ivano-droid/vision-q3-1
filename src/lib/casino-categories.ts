/**
 * Shared casino sub-category catalogue.
 *
 * Lives outside any "use client" file so both the server route handler
 * (`/casino/[category]/page.tsx` — which uses CATEGORY_KEYS to 404 on
 * unknown slugs) and the client views (`CasinoView`, `CasinoCategoryView`)
 * can import without crossing the server/client boundary on a client-only
 * module.
 *
 * Add a category here once and it shows up in:
 *   • the Categories+ bottom sheet
 *   • the per-category rails on /casino
 *   • the validated slugs for /casino/[category]
 */

import type { Category } from "@/components/CategoriesSheet";

export const CATEGORIES: Category[] = [
  { key: "new", label: "New" },
  { key: "jackpot", label: "Jackpot" },
  { key: "megaways", label: "Megaways" },
  { key: "slingo", label: "Slingo" },
  { key: "tables", label: "Tables" },
  { key: "live", label: "Live" },
];

export const CATEGORY_KEYS: string[] = CATEGORIES.map((c) => c.key);

/** Tile-set helper used by both /casino and /casino/[category] to build
 *  prototype thumbnails out of the slot-NN.png art we already have. */
export function tileSet(
  idxs: number[],
  prefix: string,
): { src: string; alt: string }[] {
  return idxs.map((i) => ({
    src: `/assets/games/slot-${String(i).padStart(2, "0")}.png`,
    alt: `${prefix} ${i}`,
  }));
}

/** Tiles for the small rails on the main /casino page (7 per category). */
export const CATEGORY_RAIL_TILES: Record<
  string,
  { src: string; alt: string }[]
> = {
  new: tileSet([13, 12, 11, 10, 9, 8, 7], "New"),
  jackpot: tileSet([1, 3, 5, 7, 9, 11, 13], "Jackpot"),
  megaways: tileSet([2, 4, 6, 8, 10, 12, 1], "Megaways"),
  slingo: tileSet([3, 6, 9, 12, 2, 5, 8], "Slingo"),
  tables: tileSet([4, 8, 12, 3, 7, 11, 2], "Tables"),
  live: tileSet([5, 10, 2, 7, 12, 4, 9], "Live"),
};

/** Bigger tiles for the per-category page grid (12 per category). */
export const CATEGORY_GRID_TILES: Record<
  string,
  { src: string; alt: string }[]
> = {
  new: tileSet([13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], "New"),
  jackpot: tileSet([1, 3, 5, 7, 9, 11, 13, 2, 4, 6, 8, 10], "Jackpot"),
  megaways: tileSet([2, 4, 6, 8, 10, 12, 1, 3, 5, 7, 9, 11], "Megaways"),
  slingo: tileSet([3, 6, 9, 12, 2, 5, 8, 11, 1, 4, 7, 10], "Slingo"),
  tables: tileSet([4, 8, 12, 3, 7, 11, 2, 6, 10, 1, 5, 9], "Tables"),
  live: tileSet([5, 10, 2, 7, 12, 4, 9, 1, 6, 11, 3, 8], "Live"),
};

/** Build a "Jackpots+" / "Megaways+" pluralised CTA label from a key. */
export function ctaLabelFor(selected: string | null): string {
  if (!selected) return "Categories+";
  const cat = CATEGORIES.find((c) => c.key === selected);
  if (!cat) return "Categories+";
  const label = cat.label;
  // Naive pluralisation: most one-word labels pluralise with -s; ones
  // already ending in "s" (e.g. Megaways) are left as-is.
  const plural = label.endsWith("s") ? label : `${label}s`;
  return `${plural}+`;
}
