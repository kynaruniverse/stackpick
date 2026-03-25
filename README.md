# StackPick UK

The definitive guide to UK gaming gear. Curated picks for mice, keyboards, headsets, monitors, chairs, controllers, and streaming gear — verified UK pricing, independent research, zero filler.

**Live site:** [stackpick.co.uk](https://stackpick.co.uk)

---

## Project Evolution (v6.0)

StackPick has evolved from a simple list into a comprehensive discovery engine for UK enthusiasts.

### New Features:
- **Dedicated Product Pages:** Every gear pick now has a full SEO-optimized review page.
- **Interactivity:** New Comparison Builder and Wishlist Sharing tools.
- **Discovery:** Global keyword search across all products, guides, and comparisons.
- **Expanded Categories:** Now including Controllers, Streaming Gear, and Desk Accessories.

---

## Tech Stack

| Layer | Detail |
|---|---|
| Framework | Astro 5 (Static Output) |
| Language | TypeScript |
| Styling | Custom "Streetwear" CSS Tokens & Components |
| Content | Astro Content Collections (Markdown + Zod) |
| SEO | JSON-LD Structured Data & Auto-Sitemap |
| PWA | Offline-first Service Worker Strategy |

---

## Local Development

```bash
npm install
npm run dev       # Local server at localhost:4321
npm run build     # Validate content and build to dist/
npm run preview   # Preview production build
```

---

## Content Workflow

1. **Add Product:** Create `.md` in `src/content/products/`.
2. **Dedicated Review:** Add your analysis to the body of the Markdown file.
3. **Category:** Ensure the `category` matches one of the 8 allowed types.
4. **Verification:** Run `npm run build` to check category validity.
