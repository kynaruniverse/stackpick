'use strict';

/**
 * StackPick lib/schema.js — consolidated schema.org JSON-LD builders
 *
 * Replaces the three separate buildSchemaJSON() functions that previously
 * lived (identically structured, diverging slowly) inside:
 *   generate-categories.js  — ItemList + BreadcrumbList
 *   generate-comparisons.js — Article + BreadcrumbList + ItemList
 *   generate-guides.js      — Article + BreadcrumbList
 *
 * Public API:
 *   buildCategorySchemaJSON(config, products)  → string (two <script> tags)
 *   buildComparisonSchemaJSON(comp)            → string (three <script> tags)
 *   buildGuideSchemaJSON(guide)               → string (two <script> tags)
 */

const { BASE_URL } = require('./config');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Wrap a plain object as an application/ld+json <script> tag. */
function toTag(obj) {
  return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
}

/**
 * Build a schema.org BreadcrumbList object.
 * @param {Array<{name: string, item: string}>} crumbs
 */
function buildBreadcrumbList(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      name:       c.name,
      item:       c.item,
    })),
  };
}

/**
 * Build a schema.org Article object.
 * @param {{ title, description, url, datePublished, dateModified }} opts
 */
function buildArticleSchema({ title, description, url, datePublished, dateModified }) {
  return {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      title,
    description,
    url,
    author:        { '@type': 'Organization', name: 'Stack Pick', url: BASE_URL },
    publisher:     { '@type': 'Organization', name: 'Stack Pick', url: BASE_URL },
    datePublished,
    dateModified:  dateModified || datePublished,
  };
}

/**
 * Build a schema.org ItemList object.
 * @param {{ name, url, itemListElement }} opts  — itemListElement is pre-shaped ListItem array
 */
function buildItemListSchema({ name, url, numberOfItems, itemListElement }) {
  return {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name,
    url,
    numberOfItems,
    itemListElement,
  };
}

// ---------------------------------------------------------------------------
// Public builders — one per page type
// ---------------------------------------------------------------------------

/**
 * Category page: ItemList of Products + BreadcrumbList
 * Preserves the exact schema shape from the original generate-categories.js.
 */
function buildCategorySchemaJSON(config, products) {
  const itemList = buildItemListSchema({
    name:         config.pageTitle.replace(' | Stack Pick', ''),
    url:          config.canonical,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      item: {
        '@type': 'Product',
        name:    p.name,
        url:     p.affiliate,
        brand:   { '@type': 'Brand', name: p.brand },
        offers:  {
          '@type':        'Offer',
          priceCurrency:  'GBP',
          price:          String(p.priceRaw),
          url:            p.affiliate,
          availability:   p.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  });

  const breadcrumb = buildBreadcrumbList([
    { name: 'Home',                 item: `${BASE_URL}/` },
    { name: config.breadcrumbLabel, item: config.canonical },
  ]);

  return [itemList, breadcrumb].map(toTag).join('\n');
}

/**
 * Comparison page: Article + BreadcrumbList + ItemList (both products)
 * Preserves the exact schema shape from the original generate-comparisons.js.
 */
function buildComparisonSchemaJSON(comp) {
  const article = buildArticleSchema({
    title:         comp.title,
    description:   comp.metaDescription,
    url:           comp.canonical,
    datePublished: comp.datePublished,
    dateModified:  comp.dateModified,
  });

  const breadcrumb = buildBreadcrumbList([
    { name: 'Home',        item: `${BASE_URL}/` },
    { name: 'Comparisons', item: `${BASE_URL}/comparisons/` },
    { name: comp.breadcrumbLabel || comp.title, item: comp.canonical },
  ]);

  // ItemList exposes both products as structured data for search engines
  const itemList = buildItemListSchema({
    name:          comp.title,
    url:           comp.canonical,
    numberOfItems: 2,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: comp.productA.name, url: comp.productA.affiliate },
      { '@type': 'ListItem', position: 2, name: comp.productB.name, url: comp.productB.affiliate },
    ],
  });

  return [article, breadcrumb, itemList].map(toTag).join('\n');
}

/**
 * Guide page: Article + BreadcrumbList
 * Preserves the exact schema shape from the original generate-guides.js.
 */
function buildGuideSchemaJSON(guide) {
  const article = buildArticleSchema({
    title:         guide.title,
    description:   guide.metaDescription,
    url:           guide.canonical,
    datePublished: guide.datePublished,
    dateModified:  guide.dateModified,
  });

  const breadcrumb = buildBreadcrumbList([
    { name: 'Home',   item: `${BASE_URL}/` },
    { name: 'Guides', item: `${BASE_URL}/guides/` },
    { name: guide.breadcrumbLabel, item: guide.canonical },
  ]);

  return [article, breadcrumb].map(toTag).join('\n');
}

// ---------------------------------------------------------------------------
module.exports = {
  buildCategorySchemaJSON,
  buildComparisonSchemaJSON,
  buildGuideSchemaJSON,
  // Primitives exported for testing / future reuse
  buildBreadcrumbList,
  buildArticleSchema,
  buildItemListSchema,
};
