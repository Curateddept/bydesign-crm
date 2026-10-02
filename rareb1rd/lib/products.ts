// Product catalog + pricing engine.
// PRICES ARE PLACEHOLDERS — set real numbers before taking live orders.

export type CategorySlug = "labels-packaging" | "wide-format" | "display-design" | "events-promotional";

export type Category = {
  slug: CategorySlug;
  name: string;
  short: string;
  blurb: string;
  icon: IconName;
};

export type IconName =
  | "tag" | "sticker" | "package" | "scroll" | "image" | "square" | "store"
  | "layout" | "presentation" | "calendar" | "file" | "book" | "id" | "flag" | "car" | "footprints";

export type Option = { id: string; label: string; price: number; note?: string };

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  icon: IconName;
  summary: string;
  details: string[];
  /** "unit": price per piece by size. "sqft": price per square foot with custom W×H. "quote": no online price. */
  pricing: "unit" | "sqft" | "quote";
  sizes?: Option[]; // unit: price per piece at that size
  materials?: Option[]; // multiplier on base price
  finishes?: Option[]; // unit: added per piece; sqft: added per sq ft
  quantities?: number[];
  minSqft?: number;
  /** sqft: preset sizes in inches, labelled width × height (custom W×H always available) */
  presets?: { label: string; w: number; h: number }[];
  setupFee?: number;
  turnaround: string;
  popular?: boolean;
};

export const categories: Category[] = [
  {
    slug: "labels-packaging",
    name: "Labels & Packaging",
    short: "Labels",
    blurb:
      "Unique, eye-catching labels and packaging that make your product stand out on the shelf. Short runs for new launches, production runs for your core line — printed on substrates for every application.",
    icon: "tag",
  },
  {
    slug: "wide-format",
    name: "Wide-Format Printing",
    short: "Wide-Format",
    blurb:
      "A massive fleet of 12 wide-format printers and plotters. ATMs, massive walls, even entire buildings — anything that has a surface, we can wrap it. Optional installation available.",
    icon: "image",
  },
  {
    slug: "display-design",
    name: "Displays & Design",
    short: "Displays",
    blurb:
      "We've specialized in retail displays for 10+ years. Highly-skilled, technical and detail-driven, we support your brand projects with a creative approach from concept to install.",
    icon: "store",
  },
  {
    slug: "events-promotional",
    name: "Events & Promotional",
    short: "Events",
    blurb:
      "Experiences are a core part of our DNA. Brand experiences, pop-ups, backdrops, booklets, stickers and everything your next event needs.",
    icon: "calendar",
  },
];

const labelMaterials: Option[] = [
  { id: "white-bopp", label: "White BOPP (waterproof)", price: 1 },
  { id: "clear-bopp", label: "Clear BOPP", price: 1.1 },
  { id: "paper", label: "Matte paper", price: 0.85 },
  { id: "metallic", label: "Metallic silver", price: 1.35 },
  { id: "kraft", label: "Kraft paper", price: 1.15 },
];

const labelFinishes: Option[] = [
  { id: "none", label: "No laminate", price: 0 },
  { id: "gloss", label: "Gloss laminate", price: 0.02 },
  { id: "matte", label: "Matte laminate", price: 0.02 },
  { id: "spot", label: "Raised spot UV (JetFx)", price: 0.06 },
];

const bannerMaterials: Option[] = [
  { id: "13oz", label: "13 oz scrim vinyl", price: 1 },
  { id: "18oz", label: "18 oz heavy-duty vinyl", price: 1.3 },
  { id: "mesh", label: "Mesh (wind-through)", price: 1.25 },
  { id: "fabric", label: "Dye-sub fabric", price: 1.6 },
];

export const products: Product[] = [
  // ── Labels & Packaging ──────────────────────────────────────────────
  {
    slug: "roll-labels",
    name: "Custom Roll Labels",
    category: "labels-packaging",
    icon: "tag",
    summary: "Digitally printed on our HP Indigo for crisp, color-accurate labels on rolls — ready for hand or machine application.",
    details: ["Any shape — custom die-cut", "Specify core size & unwind direction", "Short runs to full production"],
    pricing: "unit",
    sizes: [
      { id: "2x2", label: '2" × 2"', price: 0.12 },
      { id: "2x3", label: '2" × 3"', price: 0.15 },
      { id: "3x4", label: '3" × 4"', price: 0.21 },
      { id: "4x6", label: '4" × 6"', price: 0.32 },
    ],
    materials: labelMaterials,
    finishes: labelFinishes,
    quantities: [250, 500, 1000, 2500, 5000, 10000],
    setupFee: 35,
    turnaround: "5–7 business days",
    popular: true,
  },
  {
    slug: "die-cut-stickers",
    name: "Die-Cut Stickers",
    category: "labels-packaging",
    icon: "sticker",
    summary: "Cut to the exact shape of your art. Durable, weatherproof and perfect for merch, packaging and giveaways.",
    details: ["Contour cut to your artwork", "Outdoor-rated vinyl", "Individually cut"],
    pricing: "unit",
    sizes: [
      { id: "2", label: '2" max', price: 0.38 },
      { id: "3", label: '3" max', price: 0.52 },
      { id: "4", label: '4" max', price: 0.7 },
      { id: "5", label: '5" max', price: 0.92 },
    ],
    materials: [
      { id: "vinyl", label: "Glossy vinyl", price: 1 },
      { id: "matte-vinyl", label: "Matte vinyl", price: 1 },
      { id: "holo", label: "Holographic", price: 1.4 },
      { id: "clear", label: "Clear vinyl", price: 1.15 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    turnaround: "4–6 business days",
    popular: true,
  },
  {
    slug: "hang-tags",
    name: "Hang Tags",
    category: "labels-packaging",
    icon: "id",
    summary: "Thick, premium tags for apparel and retail — drilled and ready for string.",
    details: ["16pt or 32pt stock", "Hole drilled", "Full color both sides"],
    pricing: "unit",
    sizes: [
      { id: "2x3.5", label: '2" × 3.5"', price: 0.22 },
      { id: "2x4", label: '2" × 4"', price: 0.26 },
      { id: "3x5", label: '3" × 5"', price: 0.34 },
    ],
    materials: [
      { id: "16pt", label: "16pt matte", price: 1 },
      { id: "32pt", label: "32pt uncoated (thick)", price: 1.6 },
      { id: "kraft", label: "Kraft", price: 1.2 },
    ],
    finishes: [
      { id: "none", label: "Standard", price: 0 },
      { id: "foil", label: "Foil accent", price: 0.15 },
    ],
    quantities: [100, 250, 500, 1000, 2500],
    turnaround: "5–7 business days",
  },
  {
    slug: "custom-packaging",
    name: "Custom Packaging & Boxes",
    category: "labels-packaging",
    icon: "package",
    summary: "Folding cartons, sleeves and mailer boxes built around your product. Every structure is engineered with you.",
    details: ["Structural design assistance", "Prototypes before production", "Retail-ready finishes"],
    pricing: "quote",
    turnaround: "Quoted per project",
  },

  // ── Wide-Format ─────────────────────────────────────────────────────
  {
    slug: "vinyl-banners",
    name: "Vinyl Banners",
    category: "wide-format",
    icon: "flag",
    summary: "Indoor/outdoor banners in any size. Hemmed and grommeted, ready to hang.",
    details: ["Custom width × height", "Hems & grommets included", "UV-resistant inks"],
    pricing: "sqft",
    materials: bannerMaterials,
    finishes: [
      { id: "grommets", label: "Hems + grommets", price: 0 },
      { id: "pole", label: "Pole pockets", price: 0.5 },
      { id: "none", label: "Raw cut (no finishing)", price: -0.25 },
    ],
    quantities: [1, 2, 5, 10, 25],
    presets: [{ label: "4' × 2'", w: 48, h: 24 }, { label: "6' × 3'", w: 72, h: 36 }, { label: "8' × 4'", w: 96, h: 48 }, { label: "10' × 3'", w: 120, h: 36 }, { label: "12' × 4'", w: 144, h: 48 }],
    minSqft: 6,
    turnaround: "2–4 business days",
    popular: true,
  },
  {
    slug: "wall-murals",
    name: "Wall Graphics & Murals",
    category: "wide-format",
    icon: "image",
    summary: "Turn any wall into a brand moment. Removable or permanent adhesive vinyl, panelled for seamless install.",
    details: ["Removable or permanent", "Textured-wall vinyl available", "Professional installation optional"],
    pricing: "sqft",
    materials: [
      { id: "removable", label: "Removable adhesive vinyl", price: 1.4 },
      { id: "permanent", label: "Permanent adhesive vinyl", price: 1.3 },
      { id: "textured", label: "Textured-wall vinyl", price: 1.9 },
    ],
    finishes: [
      { id: "matte", label: "Matte laminate", price: 1 },
      { id: "gloss", label: "Gloss laminate", price: 1 },
      { id: "none", label: "No laminate", price: 0 },
    ],
    quantities: [1, 2, 3, 5],
    presets: [{ label: "8' × 4'", w: 96, h: 48 }, { label: "8' × 8'", w: 96, h: 96 }, { label: "12' × 8'", w: 144, h: 96 }, { label: "20' × 10'", w: 240, h: 120 }],
    minSqft: 10,
    turnaround: "4–6 business days",
  },
  {
    slug: "window-graphics",
    name: "Window Graphics",
    category: "wide-format",
    icon: "square",
    summary: "Storefront decals, perforated window film and frosted vinyl for privacy and promotion.",
    details: ["See-through perforated film", "Frosted & cut vinyl", "Single or double-sided"],
    pricing: "sqft",
    materials: [
      { id: "perf", label: "Perforated window film", price: 1.3 },
      { id: "clear", label: "Clear static cling", price: 1.2 },
      { id: "frosted", label: "Frosted vinyl", price: 1.5 },
    ],
    quantities: [1, 2, 5, 10],
    presets: [{ label: "3' × 2'", w: 36, h: 24 }, { label: "4' × 3'", w: 48, h: 36 }, { label: "6' × 4'", w: 72, h: 48 }, { label: "8' × 6'", w: 96, h: 72 }],
    minSqft: 4,
    turnaround: "3–5 business days",
  },
  {
    slug: "rigid-signs",
    name: "Rigid Signs",
    category: "wide-format",
    icon: "layout",
    summary: "Foam board, coroplast, PVC and aluminum composite signs for indoor and outdoor use.",
    details: ["Direct-to-substrate printing", "Stakes and stand-offs available", "Contour-cut on our flatbed plotters"],
    pricing: "sqft",
    materials: [
      { id: "foam", label: '3/16" Foam board (indoor)', price: 1 },
      { id: "coro", label: "4mm Coroplast (yard sign)", price: 0.9 },
      { id: "pvc", label: "3mm PVC", price: 1.4 },
      { id: "acm", label: "3mm Aluminum composite", price: 2.1 },
    ],
    quantities: [1, 5, 10, 25, 50],
    presets: [{ label: '18" × 24"', w: 18, h: 24 }, { label: '24" × 36"', w: 24, h: 36 }, { label: "4' × 4'", w: 48, h: 48 }, { label: "8' × 4'", w: 96, h: 48 }],
    minSqft: 2,
    turnaround: "3–5 business days",
  },
  {
    slug: "floor-graphics",
    name: "Floor Graphics",
    category: "wide-format",
    icon: "footprints",
    summary: "Slip-resistant, anti-skid laminated floor decals for retail, wayfinding and events.",
    details: ["Anti-slip laminate", "Removable adhesive", "Any shape"],
    pricing: "sqft",
    materials: [{ id: "floor", label: "Floor vinyl + anti-slip laminate", price: 1.8 }],
    quantities: [1, 5, 10, 25],
    presets: [{ label: '12" × 12"', w: 12, h: 12 }, { label: '24" × 24"', w: 24, h: 24 }, { label: '36" round', w: 36, h: 36 }],
    minSqft: 2,
    turnaround: "3–5 business days",
  },
  {
    slug: "vehicle-building-wraps",
    name: "Vehicle, ATM & Building Wraps",
    category: "wide-format",
    icon: "car",
    summary: "If it has a surface, we can wrap it. Fleet vehicles, ATMs, storefronts and full building facades.",
    details: ["Site survey & measurements", "Cast wrap films", "Certified installation crews"],
    pricing: "quote",
    turnaround: "Quoted per project",
  },

  // ── Displays & Design ───────────────────────────────────────────────
  {
    slug: "retail-displays",
    name: "Custom Retail Displays",
    category: "display-design",
    icon: "store",
    summary: "Floor displays, endcaps and in-store fixtures designed, engineered and built in-house.",
    details: ["Concept & structural design", "Corrugate, wood, acrylic & metal", "Pack-out & national rollout"],
    pricing: "quote",
    turnaround: "Quoted per project",
    popular: true,
  },
  {
    slug: "counter-displays",
    name: "Counter Displays (PDQ)",
    category: "display-design",
    icon: "package",
    summary: "Point-of-purchase corrugate counter units that ship flat and pop up in seconds.",
    details: ["Full-color litho or digital print", "Holds product weight-tested", "Ships flat"],
    pricing: "unit",
    sizes: [
      { id: "sm", label: 'Small (10" × 8" footprint)', price: 14 },
      { id: "md", label: 'Medium (14" × 10" footprint)', price: 19 },
      { id: "lg", label: 'Large (18" × 12" footprint)', price: 26 },
    ],
    materials: [
      { id: "e-flute", label: "E-flute white corrugate", price: 1 },
      { id: "b-flute", label: "B-flute heavy corrugate", price: 1.2 },
    ],
    quantities: [10, 25, 50, 100, 250],
    setupFee: 75,
    turnaround: "7–10 business days",
  },
  {
    slug: "retractable-banner",
    name: "Retractable Banner Stand",
    category: "display-design",
    icon: "presentation",
    summary: "Portable roll-up banner with stand and carry case. Sets up in under a minute.",
    details: ["Stand + carry bag included", "Curl-resistant banner film", "Reusable hardware"],
    pricing: "unit",
    sizes: [
      { id: "33", label: '33" × 81"', price: 149 },
      { id: "47", label: '47" × 81"', price: 199 },
      { id: "60", label: '60" × 81"', price: 259 },
    ],
    materials: [
      { id: "economy", label: "Economy stand", price: 1 },
      { id: "premium", label: "Premium stand", price: 1.35 },
    ],
    quantities: [1, 2, 3, 5, 10],
    turnaround: "3–5 business days",
  },
  {
    slug: "shelf-talkers",
    name: "Shelf Talkers & Wobblers",
    category: "display-design",
    icon: "tag",
    summary: "Grab attention at the shelf edge with die-cut talkers, wobblers and danglers.",
    details: ["Custom die-cut shapes", "Clip strips & wobbler arms", "Rigid or flexible stocks"],
    pricing: "unit",
    sizes: [
      { id: "3x4", label: '3" × 4"', price: 0.85 },
      { id: "4x6", label: '4" × 6"', price: 1.1 },
      { id: "5x7", label: '5" × 7"', price: 1.45 },
    ],
    materials: [
      { id: "16pt", label: "16pt card", price: 1 },
      { id: "styrene", label: "Styrene", price: 1.5 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    turnaround: "5–7 business days",
  },

  // ── Events & Promotional ────────────────────────────────────────────
  {
    slug: "step-and-repeat",
    name: "Step & Repeat Backdrops",
    category: "events-promotional",
    icon: "presentation",
    summary: "Red-carpet-ready backdrops for launches, premieres and pop-ups. Fabric or vinyl, with stand.",
    details: ["Wrinkle-resistant fabric option", "Telescoping stand available", "Non-glare matte finish"],
    pricing: "unit",
    sizes: [
      { id: "8x8", label: "8' × 8'", price: 349 },
      { id: "8x10", label: "8' × 10'", price: 429 },
      { id: "8x12", label: "8' × 12'", price: 499 },
    ],
    materials: [
      { id: "vinyl", label: "Matte vinyl", price: 1 },
      { id: "fabric", label: "Dye-sub fabric", price: 1.25 },
    ],
    finishes: [
      { id: "banner", label: "Backdrop only", price: 0 },
      { id: "stand", label: "With telescoping stand", price: 129 },
    ],
    quantities: [1, 2, 3],
    turnaround: "3–5 business days",
    popular: true,
  },
  {
    slug: "flyers",
    name: "Flyers & Postcards",
    category: "events-promotional",
    icon: "file",
    summary: "Vibrant, full-color flyers and postcards on premium stocks.",
    details: ["Single or double-sided", "Gloss, matte or uncoated", "Mailing-ready sizes"],
    pricing: "unit",
    sizes: [
      { id: "4x6", label: '4" × 6"', price: 0.12 },
      { id: "5x7", label: '5" × 7"', price: 0.16 },
      { id: "8.5x11", label: '8.5" × 11"', price: 0.28 },
    ],
    materials: [
      { id: "100gloss", label: "100lb gloss text", price: 1 },
      { id: "14pt", label: "14pt cardstock", price: 1.3 },
      { id: "16pt-matte", label: "16pt matte cardstock", price: 1.45 },
    ],
    finishes: [
      { id: "single", label: "Single-sided", price: 0 },
      { id: "double", label: "Double-sided", price: 0.03 },
    ],
    quantities: [100, 250, 500, 1000, 2500, 5000],
    turnaround: "2–4 business days",
  },
  {
    slug: "business-cards",
    name: "Business Cards",
    category: "events-promotional",
    icon: "id",
    summary: "Make an impression with thick, premium business cards and optional raised spot UV.",
    details: ['Standard 3.5" × 2"', "Thick 16pt & 32pt stocks", "Raised spot UV available"],
    pricing: "unit",
    sizes: [{ id: "std", label: '3.5" × 2" standard', price: 0.08 }],
    materials: [
      { id: "16pt", label: "16pt matte", price: 1 },
      { id: "16pt-gloss", label: "16pt gloss", price: 1 },
      { id: "32pt", label: "32pt ultra-thick", price: 2.2 },
    ],
    finishes: [
      { id: "none", label: "Standard", price: 0 },
      { id: "spot", label: "Raised spot UV", price: 0.05 },
      { id: "foil", label: "Foil accent", price: 0.08 },
    ],
    quantities: [100, 250, 500, 1000, 2500],
    turnaround: "3–5 business days",
  },
  {
    slug: "booklets",
    name: "Booklets & Lookbooks",
    category: "events-promotional",
    icon: "book",
    summary: "Saddle-stitched booklets, programs and lookbooks for events and brand storytelling.",
    details: ["8–48 pages", "Saddle stitch or perfect bound", "Self-cover or heavy cover"],
    pricing: "unit",
    sizes: [
      { id: "5.5x8.5-8", label: '5.5" × 8.5" — 8 pages', price: 1.4 },
      { id: "5.5x8.5-16", label: '5.5" × 8.5" — 16 pages', price: 2.3 },
      { id: "8.5x11-8", label: '8.5" × 11" — 8 pages', price: 2.1 },
      { id: "8.5x11-16", label: '8.5" × 11" — 16 pages', price: 3.4 },
    ],
    materials: [
      { id: "self", label: "Self cover (100lb gloss)", price: 1 },
      { id: "heavy", label: "Heavy cover (14pt)", price: 1.2 },
    ],
    quantities: [25, 50, 100, 250, 500],
    turnaround: "5–7 business days",
  },
  {
    slug: "table-throws",
    name: "Table Throws",
    category: "events-promotional",
    icon: "layout",
    summary: "Full-color fitted or draped table covers for trade shows and activations.",
    details: ["Fits 6' or 8' tables", "Machine-washable fabric", "Wrinkle-resistant"],
    pricing: "unit",
    sizes: [
      { id: "6", label: "6' table", price: 169 },
      { id: "8", label: "8' table", price: 189 },
    ],
    materials: [
      { id: "draped", label: "Draped (4-sided)", price: 1 },
      { id: "fitted", label: "Fitted", price: 1.15 },
      { id: "stretch", label: "Stretch", price: 1.3 },
    ],
    quantities: [1, 2, 3, 5],
    turnaround: "4–6 business days",
  },
  {
    slug: "pop-up-activation",
    name: "Pop-Ups & Brand Activations",
    category: "events-promotional",
    icon: "calendar",
    summary: "Full brand experiences — fabrication, graphics, install and strike for pop-up shops and activations.",
    details: ["Creative + production under one roof", "Fabrication & install", "Nationwide via our 4 hubs"],
    pricing: "quote",
    turnaround: "Quoted per project",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function productsIn(category: CategorySlug) {
  return products.filter((p) => p.category === category);
}

// Volume discount applied to the per-piece price.
export function volumeDiscount(qty: number, pricing: Product["pricing"]) {
  if (pricing === "sqft") return qty >= 25 ? 0.8 : qty >= 10 ? 0.85 : qty >= 5 ? 0.9 : 1;
  return qty >= 5000 ? 0.55 : qty >= 2500 ? 0.62 : qty >= 1000 ? 0.7 : qty >= 500 ? 0.8 : qty >= 250 ? 0.88 : 1;
}

export const SQFT_BASE = 4.5; // $/sq ft before material multiplier

export type Selection = {
  size?: string;
  material?: string;
  finish?: string;
  quantity: number;
  widthIn?: number;
  heightIn?: number;
};

export function priceFor(p: Product, sel: Selection) {
  if (p.pricing === "quote") return null;
  const material = p.materials?.find((m) => m.id === sel.material) ?? p.materials?.[0];
  const finish = p.finishes?.find((f) => f.id === sel.finish) ?? p.finishes?.[0];
  const qty = Math.max(1, sel.quantity);
  const discount = volumeDiscount(qty, p.pricing);

  let each: number;
  if (p.pricing === "sqft") {
    const sqft = Math.max(p.minSqft ?? 1, ((sel.widthIn ?? 0) * (sel.heightIn ?? 0)) / 144);
    each = sqft * (SQFT_BASE * (material?.price ?? 1) + (finish?.price ?? 0)) * discount;
  } else {
    const size = p.sizes?.find((s) => s.id === sel.size) ?? p.sizes?.[0];
    each = (size?.price ?? 0) * (material?.price ?? 1) * discount + (finish?.price ?? 0);
  }
  const total = each * qty + (p.setupFee ?? 0);
  return { each, total: Math.round(total * 100) / 100 };
}

export function startingPrice(p: Product) {
  if (p.pricing === "quote") return null;
  const qty = p.quantities?.[0] ?? 1;
  const sel: Selection = { quantity: qty, widthIn: p.presets?.[0]?.w ?? 0, heightIn: p.presets?.[0]?.h ?? 0 };
  return priceFor(p, sel)?.total ?? null;
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
