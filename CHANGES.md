# StackPick v6.0 — Modified Files

## CSS (public/assets/css/)
- `tokens.css` — Redesigned: tag color tokens, animation tokens, card/overlay variables, theme updates
- `components.css` — Rebuilt: 2-col cards, slide-up overlay, topbar, bottom nav, carousel, compare swipe, setup cards, wishlist, tag chips
- `style.css` — Updated: page-level rules for new pages

## Layout (src/layouts/)
- `Base.astro` — New mobile topbar (hides on scroll), updated bottom nav (Home|Hardware|Compare|Setups|Wishlist), product overlay system, wishlist localStorage engine, button bounce animations, theme system

## Components (src/components/)
- `ProductCard.astro` — Rebuilt as 2-col card: visual gradient area, emoji, tags, stars, wishlist/compare buttons, data-pjson for overlay

## Pages (src/pages/)
- `index.astro` — New: featured carousel, collection tabs → 2-col grid, category tiles, spec strip, guides, CTA
- `[category]/index.astro` — Updated: 2-col product-grid instead of list, filter-cage sticky
- `hardware/index.astro` — NEW: hardware hub with category tabs + budget chips + tag filter overlay
- `comparisons/index.astro` — Rebuilt: swipe compare cards for all 25 products + editorial comparisons grid
- `guides/index.astro` — Rebuilt: large setup cards with slide-up product overlay
- `wishlist/index.astro` — NEW: localStorage wishlist, 2-col grid, remove + detail overlay
- `search.astro` — Updated: type filter, product cards in grid, ?q= URL param support
