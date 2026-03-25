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
  emerald: 'var(--palette-green-500)', // New for Controllers/Streaming
  violet:  'var(--palette-purple-500)', // New for Accessories
  gold:    'var(--palette-gold-500)',   // New for Premium picks
};

// ── RATING FROM RANK ──────────────────────────────────────────────────────────
// Converts a product's rank (1–5) to a display star rating.
// Only rank 1 products have an explicit rank field; all others pass rank
// from their array position (i + 1) at render time.
// rank 1 → 4.9 ★   rank 2 → 4.7 ★   rank 3 → 4.5 ★
// rank 4 → 4.3 ★   rank 5+ → 4.1 ★

export function ratingFromRank(rank: number): number {
  const ratings = [4.9, 4.7, 4.5, 4.3, 4.1];
  return ratings[Math.min(rank - 1, ratings.length - 1)] ?? 4.0;
}

// ── BUDGET CLASS ──────────────────────────────────────────────────────────────
// Maps a raw price number to the CSS data-budget filter value.
// Updated for Phase 2/3 to handle high-end gear more precisely.

export function budgetClass(priceRaw: number): string {
  if (priceRaw < 50) return 'budget';
  if (priceRaw < 150) return 'mid-range';
  if (priceRaw < 300) return 'premium';
  return 'enthusiast';
}

// ── TAG CLASS MAP ─────────────────────────────────────────────────────────────
// Server-side version of the tag class mapper.
// Keep this in sync with the client-side version in Base.astro.

export function tagClass(t: string): string {
  const map: Record<string, string> = {
    fps: 'fps',
    pro: 'pro',
    budget: 'budget',
    value: 'value',
    entry: 'entry',
    wireless: 'wireless',
    lightweight: 'lightweight',
    comfort: 'comfort',
    ergonomic: 'ergonomic',
    audiophile: 'audiophile',
    creator: 'creator',
    'hall-effect': 'hall-effect',
  };
  return `tag tag--${map[t] ?? 'default'}`;
}
