# StackPick

UK gaming gear recommendations. Curated picks for headsets, keyboards, mice, monitors, and chairs — verified UK pricing, no sponsored content.

**Live site:** [stackpick.co.uk](https://stackpick.co.uk)

---

## What This Is

StackPick helps UK gamers find the right gear without wading through US-centric reviews or bloated 50-item lists. Every pick is researched against what the UK gaming community actually buys, with pricing verified on Amazon UK.

---

## Tech Stack

| Layer | Detail |
|---|---|
| Framework | Astro 4 (static output) |
| Language | TypeScript |
| Styling | Custom CSS design system (tokens → components → style) |
| Content | Astro Content Collections (Markdown + YAML frontmatter) |
| Hosting | GitHub Pages |
| Analytics | Google Analytics 4 |
| PWA | Service Worker with cache-first shell strategy |

---

## Project Structure

```
src/
  components/    → Astro components (ProductCard.astro)
  content/
    products/    → One .md file per product
    collections/ → Homepage tab collections (reference product IDs)
    comparisons/ → Head-to-head comparison pages
    guides/      → Budget setup guides
    config.ts    → Zod schemas for all content collections
  layouts/       → Base.astro (single page shell)
  pages/         → Astro page routes
public/
  assets/css/    → tokens.css → components.css → style.css
  assets/js/     → analytics.js
  sw.js          → Service Worker
```

---

## How to Add a Product

1. Create a new `.md` file in `src/content/products/` following the naming convention `{category}-{brand-slug}.md`
2. Add all required frontmatter fields as defined in `src/content/config.ts`
3. Add the product's `id` to the relevant collection files in `src/content/collections/`
4. Run `npm run build` to verify the build passes

---

## Local Development

```bash
npm install
npm run dev       # Dev server at localhost:4321
npm run build     # Production build to dist/
npm run preview   # Preview the production build
```

---

## Deployment

Pushes to `main` automatically trigger the GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) which builds the Astro site, stamps the service worker cache version, and deploys to GitHub Pages.
