# StackPick — Workflow Guide

Everything you need to add products, comparisons, and guides. One source of truth. One command.

---

## The Golden Rule

> Edit a `_data/` JSON file → run `npm run build` → push.  
> That's it. You never touch generated HTML files directly.

---

## Setup (one-time)

Make sure Node.js is installed:
```
node -v
```
Should show v18 or higher. If not, install from nodejs.org.

Install nothing else — the generator uses zero npm dependencies.

---

## Daily Build Command

```
npm run build
```

Or equivalently:
```
node _generator/build.js
```

Run this any time you edit a `_data/` file. Then push to deploy.

---

## How to Add a New Product

### Step 1 — Open `_data/products.json`

Add a new object to the array. Copy an existing product and edit it. Every field is required.

**Full schema:**
```json
{
  "id": "mice-logitech-g303-shroud",
  "category": "mice",
  "badge": "SHROUD EDITION",
  "name": "Logitech G303 Shroud Edition",
  "shortName": "G303 Shroud",
  "specs": ["75g Wireless", "HERO 25K Sensor", "1K Polling"],
  "desc": "Logitech's collab with shroud — a compact wireless mouse with a proven shape.",
  "pros": ["Compact shape great for small-to-medium hands", "HERO 25K sensor is rock solid"],
  "cons": ["Shape is love-it-or-hate-it", "1000Hz only (no high-poll adapter)"],
  "price": "£79",
  "priceRaw": 79.00,
  "affiliate": "https://amzn.to/XXXXXXXX",
  "url": "/mice/",
  "emoji": "🖱️",
  "seam": "blue",
  "loadoutCount": 2,
  "tags": ["wireless", "compact", "fps"],
  "inStock": true,
  "nextDay": true
}
```

**Field reference:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique. Format: `{category}-{brand}-{model}` (kebab-case, no spaces) |
| `category` | string | Must be one of: `mice`, `keyboards`, `headsets`, `monitors`, `chairs` |
| `badge` | string | Short label shown on card. E.g. "THE PRO STANDARD", "BUDGET PICK" |
| `name` | string | Full product name |
| `shortName` | string | Short version for tight spaces |
| `specs` | array | 3 short spec strings shown as pill tags |
| `desc` | string | 1–2 sentence description |
| `pros` | array | 2–3 pros (shown with ✓) |
| `cons` | array | 1–2 cons (shown with ✕) |
| `price` | string | Display price e.g. `"£79"` |
| `priceRaw` | number | Numeric price for schema.org (no £ symbol) |
| `affiliate` | string | Full Amazon affiliate URL (amzn.to/...) |
| `url` | string | Category page path e.g. `"/mice/"` |
| `emoji` | string | Emoji shown on card |
| `seam` | string | Colour accent name (used by wall.js) |
| `loadoutCount` | number | How many loadouts this product appears in |
| `tags` | array | Tag strings used for filtering |
| `inStock` | boolean | `true` or `false` |
| `nextDay` | boolean | `true` or `false` |

### Step 2 — Run the build

```
npm run build
```

### Step 3 — Check the output

Open the relevant category page in a browser (e.g. `mice/index.html`). The new product card should appear.

### Step 4 — Push

```
git add -A && git commit -m "Add Logitech G303 Shroud to mice" && git push
```

**That's one product added in under 2 minutes.**

---

## How to Add a Badge Colour

If your new product needs a custom badge colour (not the default grey), add it to the `BADGE_COLORS` map in `_generator/generate-categories.js`:

```js
const BADGE_COLORS = {
  // ... existing entries ...
  'mice-logitech-g303-shroud': '#0057ff',  // ← add this line
};
```

Available colours from the existing set:
- `#22c55e` — green
- `#3b82f6` — blue  
- `#f97316` — orange
- `#ef4444` — red
- `#8b5cf6` — purple
- `#10b981` — teal

Or use any hex value.

---

## How to Add a Crossed-Out RRP

If the product is on sale and you want to show a strikethrough RRP, add it to `PRICE_RRP` in `_generator/generate-categories.js`:

```js
const PRICE_RRP = {
  // ... existing entries ...
  'mice-logitech-g303-shroud': { rrp: '£109.99', saving: 'Save £30' },
};
```

---

## How to Add a Comparison Page

### Step 1 — Open `_data/comparisons.json`

Add a new object to the array. Use an existing comparison as a reference.

**Minimal structure:**
```json
{
  "slug": "logitech-g303-shroud-vs-razer-viper-v3-pro",
  "title": "Logitech G303 Shroud vs Razer Viper V3 Pro",
  "metaTitle": "Logitech G303 Shroud vs Razer Viper V3 Pro | Stack Pick",
  "metaDescription": "G303 Shroud vs Viper V3 Pro — compact vs ambidextrous wireless gaming mouse. Full UK comparison.",
  "ogTitle": "G303 Shroud vs Viper V3 Pro: Which Wireless Mouse? | Stack Pick",
  "ogDescription": "Two compact wireless mice compared — shape, weight, sensor, and price.",
  "canonical": "https://stackpick.co.uk/comparisons/logitech-g303-shroud-vs-razer-viper-v3-pro/",
  "datePublished": "2026-03-01",
  "dateModified": "2026-03-01",
  "emoji": "🖱️",
  "intro": "One sentence quick answer paragraph here.",
  "productA": {
    "name": "Logitech G303 Shroud Edition",
    "badge": "OUR PICK",
    "badgeColor": "#ef4444",
    "price": "~£79",
    "affiliate": "https://amzn.to/XXXXXXXX",
    "desc": "Compact. 75g. HERO 25K. 1K polling. Shroud's signature shape.",
    "linkLabel": "See on Mice page →",
    "linkHref": "/mice/"
  },
  "productB": {
    "name": "Razer Viper V3 Pro",
    "badge": "ALSO GREAT",
    "badgeColor": "",
    "price": "~£110",
    "affiliate": "https://amzn.to/4c1StN0",
    "desc": "Ambidextrous. 54g. Focus Pro 35K. 4000Hz capable.",
    "linkLabel": "See on Mice page →",
    "linkHref": "/mice/"
  },
  "specTable": [
    { "label": "Weight",       "a": "75g",       "b": "54g",             "winner": "b" },
    { "label": "Sensor",       "a": "HERO 25K",  "b": "Focus Pro 35K",   "winner": "" },
    { "label": "Max Polling",  "a": "1000Hz",    "b": "4000Hz (adapter)","winner": "b" },
    { "label": "Battery",      "a": "~130 hours","b": "~95 hours",        "winner": "a" },
    { "label": "Shape",        "a": "Ergonomic", "b": "Ambidextrous",    "winner": "" }
  ],
  "sections": [
    {
      "heading": "Weight — Viper V3 Pro wins",
      "body": "At 54g the Viper V3 Pro is significantly lighter than the G303 Shroud at 75g. Both are comfortable for long sessions but if raw weight is your priority, Razer wins here."
    },
    {
      "heading": "Shape — personal preference",
      "body": "The G303 has a compact ergonomic hump that suits small-to-medium hands with fingertip or claw grip. The Viper V3 Pro is ambidextrous and suits a wider range of hand sizes and grip styles."
    }
  ],
  "buySection": {
    "heading": "Who Should Buy Each?",
    "buyA": {
      "heading": "Buy the G303 Shroud if you:",
      "points": [
        "Prefer a compact ergonomic shape",
        "Value battery life (130hr vs 95hr)",
        "Are on a tighter budget"
      ]
    },
    "buyB": {
      "heading": "Buy the Viper V3 Pro if you:",
      "points": [
        "Want the lightest possible mouse",
        "Are left-handed or prefer ambidextrous",
        "Want 4000Hz polling capability"
      ]
    }
  },
  "verdict": "If you're chasing the lightest ambidextrous option, Viper V3 Pro. If you want a compact ergonomic shape with exceptional battery life at a lower price, the G303 Shroud is the smarter buy.",
  "relatedLinks": [
    { "href": "/mice/", "label": "Best Gaming Mice UK" },
    { "href": "/comparisons/", "label": "All Comparisons" }
  ]
}
```

### Step 2 — Build and push

```
npm run build
git add -A && git commit -m "Add G303 vs Viper V3 Pro comparison" && git push
```

The new page will be live at `/comparisons/logitech-g303-shroud-vs-razer-viper-v3-pro/`.

---

## How to Add a Guide Page

### Step 1 — Open `_data/guides.json`

Add a new object to the array.

**Minimal structure:**
```json
{
  "slug": "gaming-setup-750",
  "title": "£750 Gaming Setup Guide UK 2026",
  "budget": "£750",
  "metaTitle": "£750 Gaming Setup Guide UK 2026 | Stack Pick",
  "metaDescription": "Best gaming setup for £750 in the UK. Our expert picks for mouse, keyboard, headset, and monitor at a £750 budget.",
  "ogTitle": "£750 Gaming Setup Guide UK | Stack Pick",
  "ogDescription": "The best gaming peripherals you can buy for £750 in the UK.",
  "canonical": "https://stackpick.co.uk/guides/gaming-setup-750/",
  "datePublished": "2026-03-01",
  "emoji": "🎮",
  "intro": "A £750 budget sits in the sweet spot — enough for genuinely great gear without overspending on diminishing returns.",
  "summaryTable": [
    { "emoji": "🖱️", "category": "Mouse",    "pick": "Razer Viper V3 Pro",            "price": "£110" },
    { "emoji": "⌨️", "category": "Keyboard", "pick": "Keychron Q1 Max",               "price": "£169" },
    { "emoji": "🎧", "category": "Headset",  "pick": "HyperX Cloud III S Wireless",   "price": "£129" },
    { "emoji": "🖥️", "category": "Monitor",  "pick": "AOC Q27G3XMN",                  "price": "£279" }
  ],
  "summaryTotals": [
    { "label": "Total", "value": "~£687" }
  ],
  "sections": [
    {
      "heading": "🖱️ Mouse Pick",
      "intro": "At £750 you can comfortably afford a flagship wireless mouse.",
      "products": [
        {
          "badge": "OUR PICK",
          "badgeColor": "#ef4444",
          "name": "Razer Viper V3 Pro",
          "price": "£110",
          "desc": "54g. Focus Pro 35K sensor. 4000Hz capable. The pro standard.",
          "pros": ["Lightest flagship wireless mouse", "4000Hz polling future-proofing"],
          "cons": ["Ambidextrous shape not for everyone"],
          "affiliate": "https://amzn.to/4c1StN0"
        }
      ]
    }
  ],
  "buyingGuide": "<h2>How We Spent the £750</h2><p>We prioritised monitor and mouse — the two peripherals with the biggest real-world impact on competitive play. The keyboard and headset picks are excellent at their price without being overkill.</p>",
  "relatedGuides": [
    { "href": "/guides/gaming-setup-500/",  "label": "£500 Setup Guide",  "emoji": "💰" },
    { "href": "/guides/gaming-setup-1000/", "label": "£1000 Setup Guide", "emoji": "🎮" }
  ]
}
```

### Step 2 — Build and push

```
npm run build
git add -A && git commit -m "Add £750 setup guide" && git push
```

---

## How to Update a Price

1. Open `_data/products.json`
2. Find the product by `id`
3. Update `price` (display string) and `priceRaw` (number)
4. If there's an RRP/saving update, edit `PRICE_RRP` in `_generator/generate-categories.js`
5. Run `npm run build` and push

---

## How to Update Affiliate Links

1. Open `_data/products.json`
2. Find the product by `id`
3. Update the `affiliate` field
4. Run `npm run build` and push

For comparison/guide affiliate links:
- Comparisons → `_data/comparisons.json` → `productA.affiliate` / `productB.affiliate`
- Guides → `_data/guides.json` → `sections[n].products[n].affiliate`

---

## Complete File Map

```
Where to edit                    What it controls
────────────────────────────────────────────────────────────────
_data/products.json              All product data (cards on category pages + wall)
_data/collections.json           Homepage wall collections and shuffle variants
_data/comparisons.json           All comparison pages
_data/guides.json                All guide pages

_generator/generate-categories.js   Badge colours + RRP data per product
_templates/category.html            Layout of category pages
_templates/comparison.html          Layout of comparison pages
_templates/guide.html               Layout of guide pages
_templates/_partials/               Shared head, header, sidebar, footer, nav

assets/css/style.css             All category/comparison/guide CSS
assets/css/wall-tokens.css       Homepage wall CSS tokens
assets/js/wall.js                Homepage wall logic — DO NOT EDIT (hand-crafted)
assets/js/analytics.js           GA4 — DO NOT EDIT
assets/js/app.js                 Theme toggle, nav — DO NOT EDIT

assets/js/data/products.js       AUTO-GENERATED — DO NOT EDIT
assets/js/data/collections.js    AUTO-GENERATED — DO NOT EDIT
sitemap.xml                      AUTO-GENERATED — DO NOT EDIT
```

---

## Files You Should Never Edit Directly

These are either auto-generated or hand-crafted and not part of the generator:

- `assets/js/data/products.js` — auto-generated by `export-js-data.js`
- `assets/js/data/collections.js` — auto-generated by `export-js-data.js`
- `sitemap.xml` — auto-generated by `generate-sitemap.js`
- `mice/index.html`, `keyboards/index.html`, etc. — auto-generated by `generate-categories.js`
- `comparisons/[slug]/index.html` — auto-generated by `generate-comparisons.js`
- `guides/[slug]/index.html` — auto-generated by `generate-guides.js`
- `assets/js/wall.js` — hand-crafted homepage wall logic, separate system
- `assets/js/analytics.js` — GA4 setup, never touch

---

## Quick Reference — Common Tasks

| Task | File to edit | Command |
|---|---|---|
| Add a product | `_data/products.json` | `npm run build` |
| Update a price | `_data/products.json` | `npm run build` |
| Update affiliate link | `_data/products.json` | `npm run build` |
| Add a comparison | `_data/comparisons.json` | `npm run build` |
| Add a guide | `_data/guides.json` | `npm run build` |
| Update homepage collections | `_data/collections.json` | `npm run build` |
| Change badge colour | `_generator/generate-categories.js` | `npm run build` |
| Add RRP/saving display | `_generator/generate-categories.js` | `npm run build` |

---

*Last updated: February 2026*
