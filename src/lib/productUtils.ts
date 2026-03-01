// src/lib/productUtils.ts
// Shared utility functions used in Astro frontmatter (server-side).
// Import these in .astro frontmatter blocks — NOT inside <script> tags.
//
// Client-side equivalents (tagClass, starsStr) live on window.__sp,
// populated by Base.astro's inline <script>.

// ── SEAM COLOR MAP ────────────────────────────────────────────────────────────
// Maps product seam names to CSS custom property values.
// Used in frontmatter to set --seam-color on card/overlay elements.

export const SEAM_COLOR: Record<string, string> = {
  crimson: 'var(--palette-red-500)',
  cobalt:  'var(--palette-navy-600)',
  jade:    'var(--palette-navy-400)',
  slate:   'var(--palette-carbon-600)',
  amber:   'var(--palette-silver-600)',
};

// ── RATING FROM RANK ──────────────────────────────────────────────────────────
// Converts a product's rank (1–5) to a display star rating.
// Only rank 1 products have an explicit rank field; all others pass rank
// from their array position (i + 1) at render time.
// rank 1 → 4.9 ★   rank 2 → 4.7 ★   rank 3 → 4.5 ★
// rank 4 → 4.3 ★   rank 5+ → 4.1 ★

export function ratingFromRank(rank: number): number {
  return [4.9, 4.7, 4.5, 4.3, 4.1][Math.min(rank - 1, 4)] ?? 4.0;
}

// ── BUDGET CLASS ──────────────────────────────────────────────────────────────
// Maps a raw price number to the CSS data-budget filter value.

export function budgetClass(priceRaw: number): string {
  if (priceRaw <  50) return 'under-50';
  if (priceRaw < 100) return '50-100';
  if (priceRaw < 200) return '100-200';
  return 'over-200';
}
