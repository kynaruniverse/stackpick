# Stack Pick

UK gaming gear recommendations. Curated picks for headsets, keyboards, mice, monitors, and chairs — verified UK pricing, no sponsored content.

**Live site:** [stackpick.co.uk](https://stackpick.co.uk)

---

## What This Is

Stack Pick helps UK gamers find the right gear without wading through US-centric reviews or bloated 50-item lists. Every pick is researched against what the UK gaming community actually buys, with pricing verified on Amazon UK.

---

## Tech Stack

| Layer | Detail |
|---|---|
| Site | Static HTML / CSS / JS — no frameworks |
| Generator | Modular Node.js "Boss" system |
| Hosting | Netlify / Cloudflare / GitHub Pages |
| Analytics | Google Analytics 4 |
| Security | CSP Nonce-based protection |

---

## Project Structure

## How to add a product
1. Add the product object to `_data/products.json`
2. Add its `id` to the relevant collection in `_data/collections.json`
3. Run `npm run build`

## Local development
`npm run build` then open any HTML file in a browser.
For a local server: `npx serve .`

## Build steps
| Step | What it does |
|------|-------------|
| 0 | Clean old build artifacts |
| 1 | Validate all _data/*.json |
| 2 | Stamp CSP nonce |
| 3–5 | Generate category/comparison/guide pages |
| 6 | Generate sitemap.xml |
| 7 | Export JS data files |
| 8 | Stamp sw.js version |
| 9 | Restore source placeholders |