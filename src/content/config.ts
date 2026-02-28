// src/content/config.ts
// Content Collection schemas for StackPick.
// This replaces _generator/lib/validate.js — Astro enforces these at build time.

import { defineCollection, z } from 'astro:content';

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
// One .md file per product. Body = the product description paragraph.

const products = defineCollection({
  type: 'content',
  schema: z.object({
    id:           z.string(),
    category:     z.enum(['mice', 'keyboards', 'headsets', 'monitors', 'chairs']),
    brand:        z.string(),
    badge:        z.string(),
    name:         z.string(),
    shortName:    z.string(),
    emoji:        z.string(),
    seam:         z.string(),
    price:        z.string(),
    priceRaw:     z.number(),
    msrp:         z.string().nullable(),
    savings:      z.string().nullable(),
    affiliate:    z.string().url().startsWith('https://'),
    inStock:      z.boolean(),
    nextDay:      z.boolean(),
    loadoutCount: z.number().int().min(0),
    rank: z.number().int().min(1).optional(),
    specs:        z.array(z.string()).min(1).max(6),
    pros:         z.array(z.string()).min(1).max(6),
    cons:         z.array(z.string()).min(1).max(4),
    tags:         z.array(z.string()),
  }),
});

// ── COLLECTIONS ───────────────────────────────────────────────────────────────
// Homepage product wall tabs. Each collection references product IDs.


const homepageCollections = defineCollection({
  type: 'content',
  schema: z.object({
    id:              z.string(),
    label:           z.string(),
    emoji:           z.string(),
    color:           z.string(),
    baseProducts:    z.array(z.string()),
  }),
});

// ── COMPARISONS ───────────────────────────────────────────────────────────────
// Head-to-head comparison pages. Body = introduction + verdict prose.

const comparisonProductSchema = z.object({
  id:           z.string(),
  name:         z.string(),
  badge:        z.string(),
  badgeColor:   z.string(),
  price:        z.string(),
  affiliate:    z.string().url(),
  desc:         z.string(),
  linkLabel:    z.string(), // "Browse all [category]" — secondary nav link label
  linkHref:     z.string(), // Category page path e.g. "/mice/" — for secondary nav link
});

const specRowSchema = z.object({
  label:  z.string(),
  a:      z.string(),
  b:      z.string(),
  winner: z.enum(['a', 'b', 'tie']).optional(),
});

const comparisons = defineCollection({
  type: 'content',
  schema: z.object({
    title:           z.string(),
    heroTitle:       z.string(),
    heroSubtitle:    z.string(),
    breadcrumbLabel: z.string(),
    metaTitle:       z.string(),
    metaDescription: z.string(),
    datePublished:   z.string(),
    dateModified:    z.string(),
    emoji:           z.string(),
    productA:        comparisonProductSchema,
    productB:        comparisonProductSchema,
    specTable:       z.array(specRowSchema),
    sections:        z.array(z.any()),
    buySection:      z.any(),
    relatedLinks:    z.array(z.any()),
  }),
});

// ── GUIDES ────────────────────────────────────────────────────────────────────
// Setup budget guides. Body = intro paragraph + buying guide prose.

const summaryRowSchema = z.object({
  emoji:    z.string(),
  category: z.string(),
  pick:     z.string(),
  price:    z.string(),
});

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    slug:               z.string(),
    title:              z.string(),
    heroTitle:          z.string(),
    heroSubtitle:       z.string(),
    breadcrumbLabel:    z.string(),
    budgetLabel:        z.string(),
    metaTitle:          z.string(),
    metaDescription:    z.string(),
    datePublished:      z.string(),
    dateModified:       z.string(),
    emoji:              z.string(),
    summaryTable:       z.array(summaryRowSchema),
    summaryTotals:      z.array(z.any()),
    sections:           z.array(z.any()),
    relatedGuides:      z.array(z.any()),
    buyingGuideHeading: z.string(),
  }),
});

export const collections = {
  products,
  collections: homepageCollections,
  comparisons,
  guides,
};
