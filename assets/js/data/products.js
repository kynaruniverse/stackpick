/* ============================================================
   STACK PICK — products.js  v6
   Master product catalogue — 25 products across 5 categories.
   Affiliate links (amzn.to) preserved verbatim — do not alter.
   Last updated: February 2026

   LOAD ORDER: must load before collections.js and wall.js.

   CONTENTS
   01  Mice       (5 products) — seam: crimson #FF2D55
   02  Keyboards  (5 products) — seam: cobalt  #0057FF
   03  Headsets   (5 products) — seam: slate   #8E8EA0
   04  Monitors   (5 products) — seam: amber   #FF9500
   05  Chairs     (5 products) — seam: jade    #00C853
   06  Utility helpers
   07  Startup validation
   ============================================================ */


window.SP_PRODUCTS = [


  /* ══════════════════════════════════════════════════════════
     01  MICE  ·  5 products  ·  seam: crimson (#FF2D55)
     ══════════════════════════════════════════════════════════ */

  /* 01a — Razer Viper V3 Pro */
  {
    id:           'mice-razer-viper-v3-pro',
    category:     'mice',
    badge:        'THE PRO STANDARD',
    name:         'Razer Viper V3 Pro',
    shortName:    'Viper V3 Pro',
    specs:        ['54g Wireless', '35K Sensor', '8K Polling'],
    desc:         'The most used mouse by Valorant pros in 2026. Massive 35K sensor and native 8000Hz polling for near-zero latency.',
    pros:         ['Insane 54g weight given the tech', '8K polling included (no extra dongle)'],
    cons:         ['Larger shape isn\'t for small hands'],
    price:        '£119',
    priceRaw:     119.05,
    affiliate:    'https://amzn.to/4c1StN0',
    url:          '/mice/',
    emoji:        '🖱️',
    seam:         'crimson',
    loadoutCount: 4,
    tags:         ['fps', 'pro', 'wireless', 'lightweight'],
    inStock:      true,
    nextDay:      true,
  },

  /* 01b — Endgame Gear OP1w 4K V2
     NOTE: "w" = white colourway, not wireless. This is a WIRED mouse.
     Tags corrected from ['fps','claw-grip','wireless','competitive']
     to ['fps','claw-grip','wired','competitive'].                     */
  {
    id:           'mice-endgame-gear-op1w',
    category:     'mice',
    badge:        'THE SPEED SPECIALIST',
    name:         'Endgame Gear OP1w 4K V2',
    shortName:    'OP1w 4K V2',
    specs:        ['Claw Grip', '4K Polling', 'German Engineered'],
    desc:         'The claw-grip king. Engineered in Germany with a focus on click-latency and 4000Hz stability.',
    pros:         ['Most responsive clicks on the market', 'Perfect narrow shape for aim control'],
    cons:         ['Software is basic (pro-focused)'],
    price:        '£104',
    priceRaw:     104.99,
    affiliate:    'https://amzn.to/4rUtqjn',
    url:          '/mice/',
    emoji:        '🖱️',
    seam:         'crimson',
    loadoutCount: 2,
    tags:         ['fps', 'claw-grip', 'wired', 'competitive'],
    inStock:      true,
    nextDay:      false,
  },

  /* 01c — Lamzu Thorn 4K Wireless */
  {
    id:           'mice-lamzu-thorn-4k',
    category:     'mice',
    badge:        'LIGHTWEIGHT ERGO',
    name:         'Lamzu Thorn (4K Wireless)',
    shortName:    'Lamzu Thorn',
    specs:        ['52g', 'Ergonomic', '4K Polling'],
    desc:         'The ultimate "comfy" gaming mouse. High-back ergonomic shape that weighs only 52g. A Reddit favourite.',
    pros:         ['Amazing palm support for long sessions', '4K polling dongle included'],
    cons:         ['White version is often pricier (£120+)'],
    price:        '£92',
    priceRaw:     92.08,
    affiliate:    'https://amzn.to/4rZaG2l',
    url:          '/mice/',
    emoji:        '🖱️',
    seam:         'crimson',
    loadoutCount: 3,
    tags:         ['ergonomic', 'wireless', 'lightweight', 'cozy'],
    inStock:      true,
    nextDay:      false,
  },

  /* 01d — Logitech G502 X Plus */
  {
    id:           'mice-logitech-g502x-plus',
    category:     'mice',
    badge:        'THE DO-IT-ALL LEGEND',
    name:         'Logitech G502 X Plus',
    shortName:    'G502 X Plus',
    specs:        ['13 Buttons', 'LIGHTFORCE', 'Infinite Scroll'],
    desc:         'For those who want extra buttons and RGB. The Lightforce hybrid switches feel mechanical but actuate at light speed.',
    pros:         ['13 programmable buttons (great for MMOs)', 'Dual-mode infinite scroll wheel'],
    cons:         ['Much heavier (106g) than FPS mice'],
    price:        '£94',
    priceRaw:     94.97,
    affiliate:    'https://amzn.to/3MCPIaj',
    url:          '/mice/',
    emoji:        '🖱️',
    seam:         'crimson',
    loadoutCount: 2,
    tags:         ['creator', 'mmo', 'wireless', 'premium'],
    inStock:      true,
    nextDay:      true,
  },

  /* 01e — ATK VXE MAD R */
  {
    id:           'mice-atk-vxe-mad-r',
    category:     'mice',
    badge:        'BUDGET BEAST',
    name:         'ATK VXE MAD R',
    shortName:    'VXE MAD R',
    specs:        ['36g Ultra-light', '3950 Sensor', 'Under £50'],
    desc:         'The "Viper Killer." Features the flagship 3950 sensor and weighs a ridiculous 36g for under £50.',
    pros:         ['Flagship specs for a 1/3 of the price', 'One of the lightest mice ever made'],
    cons:         ['Build quality is "plastic-heavy"'],
    price:        '£48',
    priceRaw:     48.17,
    affiliate:    'https://amzn.to/3ZImZUM',
    url:          '/mice/',
    emoji:        '🖱️',
    seam:         'crimson',
    loadoutCount: 2,
    tags:         ['budget', 'fps', 'lightweight', 'value'],
    inStock:      true,
    nextDay:      false,
  },


  /* ══════════════════════════════════════════════════════════
     02  KEYBOARDS  ·  5 products  ·  seam: cobalt (#0057FF)
     ══════════════════════════════════════════════════════════ */

  /* 02a — SteelSeries Apex Pro TKL Gen 3 */
  {
    id:           'keyboards-steelseries-apex-pro-tkl-gen3',
    category:     'keyboards',
    badge:        'SPEED KING (HE)',
    name:         'SteelSeries Apex Pro TKL Gen 3',
    shortName:    'Apex Pro TKL',
    specs:        ['Hall Effect', 'Rapid Trigger', 'TKL'],
    desc:         'Hall Effect magnetic switches with best-in-class Rapid Trigger — the competitive edge that tournament players rely on.',
    pros:         ['Best-in-class Rapid Trigger tech', 'Protection Mode prevents accidental clicks'],
    cons:         ['Expensive brand-name markup'],
    price:        '£189',
    priceRaw:     189.98,
    affiliate:    'https://amzn.to/4kHUmQV',
    url:          '/keyboards/',
    emoji:        '⌨️',
    seam:         'cobalt',
    loadoutCount: 3,
    tags:         ['fps', 'competitive', 'hall-effect', 'tkl'],
    inStock:      true,
    nextDay:      true,
  },

  /* 02b — ASUS ROG Strix Scope II 96 */
  {
    id:           'keyboards-asus-rog-strix-scope-ii-96',
    category:     'keyboards',
    badge:        'BEST ALL-ROUNDER',
    name:         'ASUS ROG Strix Scope II 96',
    shortName:    'Scope II 96',
    specs:        ['96% Layout', 'Wireless', '1500hr Battery'],
    desc:         'Pre-lubed NX Snow switches straight out of the box — silent, smooth, and with an insane 1,500-hour battery life.',
    pros:         ['Pre-lubed NX Snow switches (silent & smooth)', 'Incredible battery life (1,500 hours)'],
    cons:         ['ROG software can be bulky'],
    price:        '£125',
    priceRaw:     125.47,
    affiliate:    'https://amzn.to/4c2dVRR',
    url:          '/keyboards/',
    emoji:        '⌨️',
    seam:         'cobalt',
    loadoutCount: 3,
    tags:         ['wireless', 'all-rounder', 'silent', 'study'],
    inStock:      true,
    nextDay:      true,
  },

  /* 02c — Aula F99 Wireless */
  {
    id:           'keyboards-aula-f99-wireless',
    category:     'keyboards',
    badge:        'CREAMY ACOUSTICS',
    name:         'Aula F99 Wireless',
    shortName:    'Aula F99',
    specs:        ['Gasket Mount', '8000mAh', '75% Layout'],
    desc:         'Enthusiast-level acoustics at a price that makes the keyboard community jealous. Huge battery, gasket mount, creamy stock sound.',
    pros:         ['Enthusiast-level sound out of the box', 'Huge 8000mAh battery'],
    cons:         ['Styling is a bit "gamer-retro"'],
    price:        '£82',
    priceRaw:     82.89,
    affiliate:    'https://amzn.to/4qMyVj3',
    url:          '/keyboards/',
    emoji:        '⌨️',
    seam:         'cobalt',
    loadoutCount: 2,
    tags:         ['budget', 'gasket', 'wireless', 'cozy'],
    inStock:      true,
    nextDay:      false,
  },

  /* 02d — Keychron Q1 Max */
  {
    id:           'keyboards-keychron-q1-max',
    category:     'keyboards',
    badge:        'THE PREMIUM TANK',
    name:         'Keychron Q1 Max',
    shortName:    'Q1 Max',
    specs:        ['Full Aluminium', 'Jupiter Tactile', 'QMK/VIA'],
    desc:         'Solid metal build, elite Jupiter Banana tactile switches, and full QMK/VIA support. The desk piece you keep forever.',
    pros:         ['Solid metal build — no plastic creaks', 'Jupiter Banana tactile switches are elite'],
    cons:         ['Very heavy — not for travel'],
    price:        '£219',
    priceRaw:     219.99,
    affiliate:    'https://amzn.to/4aFmdwP',
    url:          '/keyboards/',
    emoji:        '⌨️',
    seam:         'cobalt',
    loadoutCount: 2,
    tags:         ['premium', 'aluminium', 'creator', 'cozy'],
    inStock:      true,
    nextDay:      false,
  },

  /* 02e — Keychron C3 Pro */
  {
    id:           'keyboards-keychron-c3-pro',
    category:     'keyboards',
    badge:        'BUDGET CHAMPION',
    name:         'Keychron C3 Pro',
    shortName:    'C3 Pro',
    specs:        ['Gasket Mount', 'QMK/VIA', 'Under £40'],
    desc:         'Gasket mount, hot-swap, and QMK support under £40. The most common first mechanical keyboard on UK Reddit.',
    pros:         ['Gasket mount at a crazy low price', 'QMK/VIA software support'],
    cons:         ['No wireless (USB-C only)'],
    price:        '£39',
    priceRaw:     39.99,
    affiliate:    'https://amzn.to/4kGDHNL',
    url:          '/keyboards/',
    emoji:        '⌨️',
    seam:         'cobalt',
    loadoutCount: 3,
    tags:         ['budget', 'gasket', 'value', 'study'],
    inStock:      true,
    nextDay:      true,
  },


  /* ══════════════════════════════════════════════════════════
     03  HEADSETS  ·  5 products  ·  seam: slate (#8E8EA0)
     ══════════════════════════════════════════════════════════ */

  /* 03a — Sennheiser HD 560S */
  {
    id:           'headsets-sennheiser-hd560s',
    category:     'headsets',
    badge:        'OVERALL BEST',
    name:         'Sennheiser HD 560S',
    shortName:    'HD 560S',
    specs:        ['Open-back', '120Ω', 'Audiophile'],
    desc:         'Incredible directional audio for footstep detection. Extremely lightweight for long sessions. The audiophile gateway drug.',
    pros:         ['Incredible directional audio (footsteps)', 'Extremely lightweight for long sessions'],
    cons:         ['No built-in mic (requires separate mic)'],
    price:        '£99',
    priceRaw:     99.00,
    affiliate:    'https://amzn.to/4tHtncv',
    url:          '/headsets/',
    emoji:        '🎧',
    seam:         'slate',
    loadoutCount: 3,
    tags:         ['audiophile', 'open-back', 'fps', 'study'],
    inStock:      true,
    nextDay:      true,
  },

  /* 03b — SteelSeries Arctis Nova Pro */
  {
    id:           'headsets-steelseries-arctis-nova-pro',
    category:     'headsets',
    badge:        'PREMIUM WIRELESS',
    name:         'SteelSeries Arctis Nova Pro',
    shortName:    'Nova Pro',
    specs:        ['Hot-swap Battery', 'Dual Source', 'ANC'],
    desc:         'Hot-swap battery system means it never dies mid-session. Connect to PC and console simultaneously. The Swiss army knife of headsets.',
    pros:         ['Hot-swap battery system', 'Connect to PC and Console at once'],
    cons:         ['Expensive even with the discount'],
    price:        '£289',
    priceRaw:     289.00,
    affiliate:    'https://amzn.to/3OkA3NA',
    url:          '/headsets/',
    emoji:        '🎧',
    seam:         'slate',
    loadoutCount: 2,
    tags:         ['premium', 'wireless', 'dual-source', 'creator'],
    inStock:      true,
    nextDay:      false,
  },

  /* 03c — HyperX Cloud III S Wireless */
  {
    id:           'headsets-hyperx-cloud-iii-s-wireless',
    category:     'headsets',
    badge:        'BEST COMFORT',
    name:         'HyperX Cloud III S Wireless',
    shortName:    'Cloud III S',
    specs:        ['120hr Battery', 'Metal Frame', 'Wireless'],
    desc:         'Legendary comfort with a full metal frame and a jaw-dropping 120-hour battery. The long-session champion.',
    pros:         ['Legendary comfort & metal frame', 'Massive 120-hour battery life'],
    cons:         ['Sound is "flat" (good for games, okay for music)'],
    price:        '£129',
    priceRaw:     129.97,
    affiliate:    'https://amzn.to/4apWJo8',
    url:          '/headsets/',
    emoji:        '🎧',
    seam:         'slate',
    loadoutCount: 3,
    tags:         ['comfort', 'wireless', 'long-session', 'cozy'],
    inStock:      true,
    nextDay:      true,
  },

  /* 03d — Bose QuietComfort Ultra Gen 2 */
  {
    id:           'headsets-bose-quietcomfort-ultra-gen2',
    category:     'headsets',
    badge:        'BEST ANC',
    name:         'Bose QuietComfort Ultra (Gen 2)',
    shortName:    'QC Ultra Gen 2',
    specs:        ['Best-in-Class ANC', 'Spatial Audio', 'Premium'],
    desc:         'Best-in-class noise cancelling with high resale value. Dual-use for gaming and travel. The headset you never take off.',
    pros:         ['Best-in-class Noise Cancelling', 'High resale value & dual-use for travel'],
    cons:         ['Very high price point'],
    price:        '£399',
    priceRaw:     399.95,
    affiliate:    'https://amzn.to/4kETP2t',
    url:          '/headsets/',
    emoji:        '🎧',
    seam:         'slate',
    loadoutCount: 2,
    tags:         ['premium', 'anc', 'wireless', 'creator'],
    inStock:      true,
    nextDay:      true,
  },

  /* 03e — ASTRO A10 Gen 2 */
  {
    id:           'headsets-astro-a10-gen2',
    category:     'headsets',
    badge:        'BUDGET PICK',
    name:         'ASTRO A10 Gen 2',
    shortName:    'A10 Gen 2',
    specs:        ['Wired', 'Flexible Frame', 'Multi-platform'],
    desc:         'Damage-resistant flexible frame with a detachable cable. The budget headset that actually survives being knocked off your desk.',
    pros:         ['Damage-resistant flexible frame', 'Detachable cable (easy to replace)'],
    cons:         ['Wired only — no wireless option'],
    price:        '£40',
    priceRaw:     40.10,
    affiliate:    'https://amzn.to/4rz9Vgo',
    url:          '/headsets/',
    emoji:        '🎧',
    seam:         'slate',
    loadoutCount: 2,
    tags:         ['budget', 'wired', 'durable', 'value'],
    inStock:      true,
    nextDay:      true,
  },


  /* ══════════════════════════════════════════════════════════
     04  MONITORS  ·  5 products  ·  seam: amber (#FF9500)
     ══════════════════════════════════════════════════════════ */

  /* 04a — ASUS ROG Strix OLED XG27AQDMG */
  {
    id:           'monitors-asus-rog-xg27aqdmg',
    category:     'monitors',
    badge:        'BEST OVERALL (OLED)',
    name:         'ASUS ROG Strix OLED XG27AQDMG',
    shortName:    'ROG XG27 OLED',
    specs:        ['27" 1440p', 'WOLED 240Hz', '0.03ms'],
    desc:         '27" glossy WOLED at 1440p, 240Hz, with 0.03ms response and a custom heatsink to reduce burn-in risk.',
    pros:         ['27" 1440p Glossy WOLED, 240Hz', '0.03ms response + custom heatsink'],
    cons:         ['Glossy panel needs a darker room'],
    price:        '£429',
    priceRaw:     429.00,
    affiliate:    'https://amzn.to/4aX25Y9',
    url:          '/monitors/',
    emoji:        '🖥️',
    seam:         'amber',
    loadoutCount: 3,
    tags:         ['oled', 'premium', '1440p', 'competitive'],
    inStock:      true,
    nextDay:      false,
  },

  /* 04b — AOC Gaming 24G4XE */
  {
    id:           'monitors-aoc-24g4xe',
    category:     'monitors',
    badge:        'BEST BUDGET',
    name:         'AOC Gaming 24G4XE',
    shortName:    'AOC 24G4XE',
    specs:        ['24" 1080p', 'Fast IPS 180Hz', 'G-Sync'],
    desc:         '24" Fast IPS at 180Hz with 1ms GtG, G-Sync Compatible, and HDR10. The cleanest entry point to gaming monitors.',
    pros:         ['24" 1080p Fast IPS, 180Hz', '1ms GtG + G-Sync Compatible'],
    cons:         ['1080p won\'t pair well with a top GPU'],
    price:        '£109',
    priceRaw:     109.97,
    affiliate:    'https://amzn.to/4kFxb9U',
    url:          '/monitors/',
    emoji:        '🖥️',
    seam:         'amber',
    loadoutCount: 3,
    tags:         ['budget', '1080p', 'fast-ips', 'value'],
    inStock:      true,
    nextDay:      true,
  },

  /* 04c — Samsung 32" Odyssey G80SD */
  {
    id:           'monitors-samsung-odyssey-g80sd',
    category:     'monitors',
    badge:        'BEST PREMIUM 4K',
    name:         'Samsung 32" Odyssey G80SD',
    shortName:    'Odyssey G80SD',
    specs:        ['32" 4K', 'QD-OLED 240Hz', 'AI Upscaling'],
    desc:         '32" 4K QD-OLED at 240Hz with Smart TV features and AI upscaling. Matte finish keeps it glare-free for marathon sessions.',
    pros:         ['32" 4K QD-OLED, 240Hz', 'Smart TV features + AI upscaling'],
    cons:         ['Needs a powerful GPU to run 4K at 240Hz'],
    price:        '£740',
    priceRaw:     740.30,
    affiliate:    'https://amzn.to/4cy1qh1',
    url:          '/monitors/',
    emoji:        '🖥️',
    seam:         'amber',
    loadoutCount: 2,
    tags:         ['premium', '4k', 'oled', 'creator'],
    inStock:      true,
    nextDay:      false,
  },

  /* 04d — AOC Gaming Q27G3XMN */
  {
    id:           'monitors-aoc-q27g3xmn',
    category:     'monitors',
    badge:        'BEST HDR VALUE',
    name:         'AOC Gaming Q27G3XMN',
    shortName:    'AOC Q27G3XMN',
    specs:        ['27" 1440p', 'Mini-LED 180Hz', 'HDR1000'],
    desc:         '27" 1440p Mini-LED at 180Hz with HDR1000 — 700-1000 nits of stunning brightness that IPS panels dream about.',
    pros:         ['27" 1440p Mini-LED, 180Hz', 'HDR1000 (700-1000 nits — stunning)'],
    cons:         ['Mini-LED blooming visible in dark scenes'],
    price:        '£293',
    priceRaw:     293.99,
    affiliate:    'https://amzn.to/4kFwZHI',
    url:          '/monitors/',
    emoji:        '🖥️',
    seam:         'amber',
    loadoutCount: 2,
    tags:         ['hdr', '1440p', 'mini-led', 'value'],
    inStock:      true,
    nextDay:      true,
  },

  /* 04e — MSI MAG 274UPDF E16M */
  {
    id:           'monitors-msi-mag-274updf',
    category:     'monitors',
    badge:        'BEST ART & PLAY',
    name:         'MSI MAG 274UPDF E16M',
    shortName:    'MSI MAG 274UPDF',
    specs:        ['27" 4K', 'USB-C 96W', 'Creator'],
    desc:         'A 27" 4K monitor that doubles as a laptop dock with 96W USB-C power delivery. The creator desk centrepiece.',
    pros:         ['27" 4K with USB-C 96W power delivery', 'Colour-accurate IPS for creative work'],
    cons:         ['Lower refresh rate vs pure gaming panels'],
    price:        '£398',
    priceRaw:     398.97,
    affiliate:    'https://amzn.to/46iIlvA',
    url:          '/monitors/',
    emoji:        '🖥️',
    seam:         'amber',
    loadoutCount: 2,
    tags:         ['creator', '4k', 'usb-c', 'study'],
    inStock:      true,
    nextDay:      false,
  },


  /* ══════════════════════════════════════════════════════════
     05  CHAIRS  ·  5 products  ·  seam: jade (#00C853)
     ══════════════════════════════════════════════════════════ */

  /* 05a — AndaSeat Kaiser 4 */
  {
    id:           'chairs-andaseat-kaiser-4',
    category:     'chairs',
    badge:        'BEST OVERALL',
    name:         'AndaSeat Kaiser 4',
    shortName:    'Kaiser 4',
    specs:        ['6D Armrests', 'Mag Headrest', '180kg Rated'],
    desc:         '6D armrests, a magnetic memory foam headrest, and 180kg weight capacity. The gaming chair that earns the price tag.',
    pros:         ['6D armrests — adjust every direction', 'Magnetic memory foam headrest'],
    cons:         ['Pricey — but this is genuinely what you get for the money'],
    price:        '£449',
    priceRaw:     449.99,
    affiliate:    'https://amzn.to/4qPy6pT',
    url:          '/chairs/',
    emoji:        '🪑',
    seam:         'jade',
    loadoutCount: 3,
    tags:         ['premium', 'ergonomic', 'long-session', 'cozy'],
    inStock:      true,
    nextDay:      false,
  },

  /* 05b — Corsair TC100 Relaxed */
  {
    id:           'chairs-corsair-tc100-relaxed',
    category:     'chairs',
    badge:        'BEST BUDGET',
    name:         'Corsair TC100 Relaxed',
    shortName:    'TC100 Relaxed',
    specs:        ['Relaxed Fit', 'Hybrid Back', 'Corsair Brand'],
    desc:         'Wide relaxed seat with a leatherette and mesh hybrid back. Corsair brand reliability without the premium pricing.',
    pros:         ['Wide relaxed seat — roomier than rivals', 'Leatherette & mesh hybrid back'],
    cons:         ['Lumbar pillow rather than built-in support'],
    price:        '£187',
    priceRaw:     187.97,
    affiliate:    'https://amzn.to/4aCwuK2',
    url:          '/chairs/',
    emoji:        '🪑',
    seam:         'jade',
    loadoutCount: 2,
    tags:         ['budget', 'relaxed', 'value', 'cozy'],
    inStock:      true,
    nextDay:      true,
  },

  /* 05c — EUREKA Typhon Gaming Chair */
  {
    id:           'chairs-eureka-typhon',
    category:     'chairs',
    badge:        'BEST MESH',
    name:         'EUREKA Typhon Gaming Chair',
    shortName:    'Typhon Mesh',
    specs:        ['Full Mesh', '4D Armrests', 'Adaptive Lumbar'],
    desc:         'Full mesh everywhere — seat, back, and headrest. Gaming chair looks without the heat trap. 4D armrests with adaptive lumbar.',
    pros:         ['Full mesh — seat, back and headrest', '4D armrests, adaptive lumbar support'],
    cons:         ['Less cushioned feel than foam-padded chairs'],
    price:        '£369',
    priceRaw:     369.99,
    affiliate:    'https://amzn.to/4tDne0R',
    url:          '/chairs/',
    emoji:        '🪑',
    seam:         'jade',
    loadoutCount: 2,
    tags:         ['mesh', 'ergonomic', 'long-session', 'study'],
    inStock:      true,
    nextDay:      false,
  },

  /* 05d — Sihoo Doro C300 */
  {
    id:           'chairs-sihoo-doro-c300',
    category:     'chairs',
    badge:        'BEST FOR YOUR BACK',
    name:         'Sihoo Doro C300',
    shortName:    'Doro C300',
    specs:        ['Self-Adaptive Lumbar', 'TÜV Certified', '12 Patents'],
    desc:         'Self-adaptive lumbar support that moves with your spine — TÜV certified with 12 ergonomic patents. For people who take their back seriously.',
    pros:         ['Self-adaptive lumbar — moves with your spine', 'TÜV certified, 12 ergonomic patents'],
    cons:         ['Minimalist look isn\'t for everyone'],
    price:        '£298',
    priceRaw:     298.99,
    affiliate:    'https://amzn.to/4s3kiJA',
    url:          '/chairs/',
    emoji:        '🪑',
    seam:         'jade',
    loadoutCount: 3,
    tags:         ['ergonomic', 'back-health', 'study', 'premium'],
    inStock:      true,
    nextDay:      false,
  },

  /* 05e — Noblechairs Hero */
  {
    id:           'chairs-noblechairs-hero',
    category:     'chairs',
    badge:        'MOST COMFORTABLE',
    name:         'Noblechairs Hero',
    shortName:    'Noblechairs Hero',
    specs:        ['Cold Foam', '4D Armrests', 'Premium PU'],
    desc:         'Cold foam cushioning that doesn\'t flatten. Premium PU leather with Noblechairs\' signature build quality that outlasts the competition.',
    pros:         ['Cold foam holds shape for years', '4D armrests, premium build quality'],
    cons:         ['Premium PU leather — not real leather'],
    price:        '£349',
    priceRaw:     349.99,
    affiliate:    'https://amzn.to/4tHQDal',
    url:          '/chairs/',
    emoji:        '🪑',
    seam:         'jade',
    loadoutCount: 2,
    tags:         ['comfort', 'premium', 'long-session', 'cozy'],
    inStock:      true,
    nextDay:      true,
  },


];


/* ============================================================
   06  UTILITY HELPERS
   Read-only functions — do not mutate SP_PRODUCTS directly.
   All return new arrays (sliced/filtered) to avoid side effects.
   ============================================================ */

/**
 * 06a  SP_getProduct
 * Get a single product object by its unique ID string.
 * Returns undefined if the ID doesn't exist (safe for filter(Boolean)).
 * @param  {string} id
 * @returns {Object|undefined}
 */
window.SP_getProduct = function (id) {
  return window.SP_PRODUCTS.find(function (p) { return p.id === id; });
};

/**
 * 06b  SP_getByCategory
 * Get all products in a given category.
 * Valid values: 'mice' | 'keyboards' | 'headsets' | 'monitors' | 'chairs'
 * @param  {string} category
 * @returns {Array}
 */
window.SP_getByCategory = function (category) {
  return window.SP_PRODUCTS.filter(function (p) { return p.category === category; });
};

/**
 * 06c  SP_getByTag
 * Get all products that include a given tag.
 * Tags are defined per-product and are not normalised — match exactly.
 * @param  {string} tag
 * @returns {Array}
 */
window.SP_getByTag = function (tag) {
  return window.SP_PRODUCTS.filter(function (p) { return p.tags.indexOf(tag) !== -1; });
};

/**
 * 06d  SP_getUnder
 * Get products at or below a price ceiling (uses priceRaw, inclusive).
 * @param  {number} max  — e.g. 100 for "under £100"
 * @returns {Array}
 */
window.SP_getUnder = function (max) {
  return window.SP_PRODUCTS.filter(function (p) { return p.priceRaw <= max; });
};

/**
 * 06e  SP_getByPriceRange
 * Get products within an inclusive price band.
 * @param  {number} min
 * @param  {number} max
 * @returns {Array}
 */
window.SP_getByPriceRange = function (min, max) {
  return window.SP_PRODUCTS.filter(function (p) {
    return p.priceRaw >= min && p.priceRaw <= max;
  });
};

/**
 * 06f  SP_getInStock
 * Get in-stock products, optionally filtered by category.
 * @param  {string} [category]  — omit to get all in-stock products
 * @returns {Array}
 */
window.SP_getInStock = function (category) {
  return window.SP_PRODUCTS.filter(function (p) {
    return p.inStock && (category ? p.category === category : true);
  });
};

/**
 * 06g  SP_getSorted
 * Return a sorted copy of a product array.
 * Modes: 'price-asc' | 'price-desc' | 'popular' | 'default'
 * Pass SP_PRODUCTS or any filtered subset as the first argument.
 * @param  {Array}  products  — source array (not mutated)
 * @param  {string} mode
 * @returns {Array}
 */
window.SP_getSorted = function (products, mode) {
  var arr = (products || window.SP_PRODUCTS).slice();
  if (mode === 'price-asc')  return arr.sort(function (a, b) { return a.priceRaw - b.priceRaw; });
  if (mode === 'price-desc') return arr.sort(function (a, b) { return b.priceRaw - a.priceRaw; });
  if (mode === 'popular')    return arr.sort(function (a, b) { return (b.loadoutCount || 0) - (a.loadoutCount || 0); });
  return arr; // 'default' — preserve original array order
};

/**
 * 06h  SP_getWireless
 * Convenience helper — returns products tagged 'wireless'.
 * Used by the Wireless Only collection and any future filter UI.
 * @returns {Array}
 */
window.SP_getWireless = function () {
  return window.SP_getByTag('wireless');
};

/**
 * 06i  SP_getBySeam
 * Get all products sharing a seam colour token name.
 * Useful for building category-coloured UI elements without
 * hard-coding the hex value.
 * Valid values: 'crimson' | 'cobalt' | 'slate' | 'amber' | 'jade'
 * @param  {string} seam
 * @returns {Array}
 */
window.SP_getBySeam = function (seam) {
  return window.SP_PRODUCTS.filter(function (p) { return p.seam === seam; });
};


/* ============================================================
   07  STARTUP VALIDATION
   Runs once on load in non-production environments.
   Logs warnings for:
     · Duplicate product IDs
     · Products missing required fields
     · Products in Wireless Only collections tagged 'wired'
       (cross-checks against collections.js if already loaded)
   Silent in production (hostname check).
   ============================================================ */

(function () {
  var isProd = (
    window.location.hostname === 'stackpick.co.uk' ||
    window.location.hostname === 'www.stackpick.co.uk'
  );
  if (isProd) return;

  var REQUIRED_FIELDS = [
    'id', 'category', 'badge', 'name', 'shortName',
    'specs', 'desc', 'pros', 'cons',
    'price', 'priceRaw', 'affiliate', 'url',
    'emoji', 'seam', 'loadoutCount', 'tags',
    'inStock', 'nextDay',
  ];

  var seen = {};

  window.SP_PRODUCTS.forEach(function (p) {

    // 07a  Duplicate ID check
    if (seen[p.id]) {
      console.warn('[SP products] Duplicate product ID detected:', p.id);
    }
    seen[p.id] = true;

    // 07b  Required field check
    REQUIRED_FIELDS.forEach(function (field) {
      if (p[field] === undefined || p[field] === null || p[field] === '') {
        console.warn('[SP products] Product "' + p.id + '" is missing field: ' + field);
      }
    });

    // 07c  priceRaw type check
    if (typeof p.priceRaw !== 'number' || isNaN(p.priceRaw)) {
      console.warn('[SP products] Product "' + p.id + '" has invalid priceRaw:', p.priceRaw);
    }

    // 07d  Tags array check
    if (!Array.isArray(p.tags) || p.tags.length === 0) {
      console.warn('[SP products] Product "' + p.id + '" has empty or missing tags array.');
    }

  });

  // 07e  Cross-check: wireless-only collection vs wired-tagged products
  if (window.SP_COLLECTIONS) {
    var wirelessCol = window.SP_COLLECTIONS.find(function (c) { return c.id === 'wireless-only'; });
    if (wirelessCol) {
      wirelessCol.baseProducts.forEach(function (pid) {
        var prod = window.SP_getProduct(pid);
        if (prod && prod.tags.indexOf('wired') !== -1) {
          console.warn(
            '[SP products] "' + pid + '" is tagged "wired" but appears in the wireless-only collection.'
          );
        }
      });
    }
  }

  console.log(
    '%c[SP products] Validation complete — ' + window.SP_PRODUCTS.length + ' products loaded.',
    'color:#C8FF00;font-family:monospace;font-size:11px;'
  );

}());
