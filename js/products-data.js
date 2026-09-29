// Weave Bro - Initial Catalog Data & Store Presets
// Tagline: "wear the wave"

const INITIAL_STORE_SETTINGS = {
  announcement: "🌊 WEAR THE WAVE | Free Express Shipping on orders over ₹999 | Code: WAVE15 for 15% OFF",
  heroBadge: "LIMITED SPRING 2026 DROP",
  heroTitle: "HEAVYWEIGHT ESSENTIALS FOR THE CULTURE",
  heroSubtitle: "Crafted with 240+ GSM pure combed cotton. Tailored boxy silhouettes engineered for those who ride their own tide.",
  heroCtaText: "EXPLORE COLLECTION",
  heroBannerImage: "assets/images/hero-banner.jpg",
  freeShippingThreshold: 999
};

const INITIAL_PROMO_CODES = [
  { code: "WAVE15", discountPercent: 15, minSpend: 799, description: "15% OFF on orders above ₹799" },
  { code: "WAVE20", discountPercent: 20, minSpend: 1499, description: "20% OFF on orders above ₹1,499" },
  { code: "BROTRIBE", discountPercent: 10, minSpend: 499, description: "Flat 10% OFF for Bro Tribe members" }
];

const INITIAL_PRODUCTS = [
  {
    id: "wb-01",
    title: "240 GSM Heavyweight Oversized Tee",
    subtitle: "Deep Nautical Navy • Pure Combed Cotton",
    price: 899,
    comparePrice: 1499,
    gsm: 240,
    fit: "Oversized Boxy Fit",
    colorName: "Nautical Navy",
    colorHex: "#0E1B33",
    image: "assets/images/tee-navy.jpg",
    gallery: [
      "assets/images/tee-navy.jpg",
      "assets/images/hero-banner.jpg",
      "assets/images/tee-white.jpg"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 45,
    badge: "BESTSELLER",
    rating: 4.9,
    reviewsCount: 482,
    description: "Designed for effortless everyday streetwear, this heavyweight 240 GSM tee combines a structured drape with unmatched comfort. Crafted from 100% super-combed long-staple cotton, it never clings, stays wrinkle-free, and retains its shape wash after wash.",
    specs: [
      "240 GSM heavyweight pure combed cotton",
      "Bio-washed & pre-shrunk for zero shrinkage",
      "1.25-inch thick lycra-ribbed collar (no bacon neck)",
      "Drop-shoulder boxy streetwear cut",
      "Precision tonal wave emblem embroidered on left chest"
    ],
    fabricCare: "Machine wash cold with like colors. Do not bleach. Tumble dry low or hang dry in shade. Warm iron inside out if needed."
  },
  {
    id: "wb-02",
    title: "260 GSM French Terry Drop Shoulder Tee",
    subtitle: "Tidal Off-White • Heavy Loopback Knit",
    price: 999,
    comparePrice: 1699,
    gsm: 260,
    fit: "Drop Shoulder Street Fit",
    colorName: "Tidal Off-White",
    colorHex: "#FAF8F5",
    image: "assets/images/tee-white.jpg",
    gallery: [
      "assets/images/tee-white.jpg",
      "assets/images/hero-banner.jpg",
      "assets/images/tee-sand.jpg"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 28,
    badge: "LIMITED DROP",
    rating: 4.8,
    reviewsCount: 320,
    description: "Our highest density piece to date. Crafted from 260 GSM French Terry knit cotton, offering exceptional breathability with an architectural, tailored drop-shoulder hang.",
    specs: [
      "260 GSM premium loopback French Terry cotton",
      "Micro-embroidered wave motif",
      "Reinforced double-stitch shoulder tape",
      "Soft brushed inner texture for cloud-like comfort",
      "Contemporary unisex boxy drape"
    ],
    fabricCare: "Gentle machine wash cold. Do not dry clean. Flat dry recommended."
  },
  {
    id: "wb-03",
    title: "230 GSM Ocean Mist Boxy Tee",
    subtitle: "Muted Sage Green • Bio-Polished",
    price: 849,
    comparePrice: 1399,
    gsm: 230,
    fit: "Relaxed Boxy Fit",
    colorName: "Ocean Mist Sage",
    colorHex: "#8FA89B",
    image: "assets/images/tee-sage.jpg",
    gallery: [
      "assets/images/tee-sage.jpg",
      "assets/images/tee-navy.jpg",
      "assets/images/tee-sand.jpg"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 62,
    badge: "NEW DROP",
    rating: 4.9,
    reviewsCount: 215,
    description: "Subtle coastal hues inspired by breaking shoreline foam. The 230 GSM medium-heavyweight weave ensures cool breathability for warm afternoons while maintaining an upscale, structured silhouette.",
    specs: [
      "230 GSM 100% ring-spun organic cotton",
      "Low-impact earth mineral wash",
      "Non-stretch ribbed collar with inner taping",
      "Clean blind hem stitching",
      "Pre-conditioned with bio-enzymes for feather touch"
    ],
    fabricCare: "Machine wash cold. Turn inside out. Avoid direct sunlight drying to preserve botanical dye."
  },
  {
    id: "wb-04",
    title: "250 GSM Obsidian Acid Wash Tee",
    subtitle: "Vintage Charcoal Black • Mineral Washed",
    price: 1099,
    comparePrice: 1899,
    gsm: 250,
    fit: "Streetwear Oversized Fit",
    colorName: "Obsidian Charcoal",
    colorHex: "#2C2D31",
    image: "assets/images/tee-black.jpg",
    gallery: [
      "assets/images/tee-black.jpg",
      "assets/images/hero-banner.jpg",
      "assets/images/tee-navy.jpg"
    ],
    sizes: ["M", "L", "XL", "XXL"],
    stock: 19,
    badge: "HOT SELLER",
    rating: 4.9,
    reviewsCount: 540,
    description: "Each piece undergoes a bespoke mineral acid wash process, giving each t-shirt a unique vintage marbled patina. The 250 GSM heavy gauge cotton provides a sharp, oversized silhouette that falls perfectly on sneakers and cargos.",
    specs: [
      "250 GSM heavyweight acid-washed cotton",
      "Hand-finished marbled fade - no two pieces are identical",
      "Embossed retro wave insignia patch",
      "Ultra-wide 2.5cm ribbed neckband",
      "Heavy drop shoulders with extended sleeves"
    ],
    fabricCare: "Wash inside out in cold water. Wash separately for initial 2 washes."
  },
  {
    id: "wb-05",
    title: "240 GSM Waffle Knit Coastal Tee",
    subtitle: "Dune Sand Beige • 3D Thermal Weave",
    price: 949,
    comparePrice: 1599,
    gsm: 240,
    fit: "Tailored Relaxed Fit",
    colorName: "Dune Sand",
    colorHex: "#C7A779",
    image: "assets/images/tee-sand.jpg",
    gallery: [
      "assets/images/tee-sand.jpg",
      "assets/images/tee-white.jpg",
      "assets/images/hero-banner.jpg"
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 34,
    badge: "PREMIUM WEAVE",
    rating: 4.8,
    reviewsCount: 190,
    description: "Textural richness at its finest. Built with a 240 GSM 3D micro-waffle weave that traps ambient air for micro-temperature regulation. High drape factor with zero transparency.",
    specs: [
      "240 GSM micro-honeycomb waffle cotton",
      "Superior wrinkle resistance and airflow",
      "Double-ribbed cuff and collar details",
      "High recovery rate - never stretches out",
      "Understated tonal stitch branding"
    ],
    fabricCare: "Cold delicate cycle. Lay flat to dry to maintain waffle pattern elasticity."
  }
];

const PRESET_IMAGE_OPTIONS = [
  { label: "Nautical Navy Tee", url: "assets/images/tee-navy.jpg" },
  { label: "Tidal Off-White Tee", url: "assets/images/tee-white.jpg" },
  { label: "Ocean Mist Sage Tee", url: "assets/images/tee-sage.jpg" },
  { label: "Obsidian Black Tee", url: "assets/images/tee-black.jpg" },
  { label: "Dune Sand Waffle Tee", url: "assets/images/tee-sand.jpg" },
  { label: "Editorial Lifestyle Look", url: "assets/images/hero-banner.jpg" }
];

const CUSTOMER_REVIEWS_SEED = [
  {
    name: "Arjun Verma",
    location: "Mumbai",
    rating: 5,
    title: "Legitimately better than Zara and Uniqlo heavyweight tees",
    comment: "The 240 GSM navy tee is an absolute masterpiece. The collar doesn't get floppy after washes, and the drape over shoulders is so clean. Weave Bro is my new go-to.",
    verified: true,
    product: "240 GSM Heavyweight Oversized Tee",
    date: "3 days ago"
  },
  {
    name: "Rohan Nair",
    location: "Bengaluru",
    rating: 5,
    title: "The acid wash patina is insane",
    comment: "Bought the Obsidian Charcoal in XL. I am 6'1 and it fits like luxury streetwear. Heavy fabric, great texture, and received 4 compliments on day one.",
    verified: true,
    product: "250 GSM Obsidian Acid Wash Tee",
    date: "1 week ago"
  },
  {
    name: "Siddharth Mehta",
    location: "Delhi NCR",
    rating: 5,
    title: "Zero shrinkage after 5 washes!",
    comment: "Ordered 2 tees with the WAVE15 code. Truly pre-shrunk heavyweight cotton as promised. Wear the wave!",
    verified: true,
    product: "260 GSM French Terry Drop Shoulder Tee",
    date: "2 weeks ago"
  }
];

if (typeof globalThis !== "undefined") {
  globalThis.INITIAL_STORE_SETTINGS = INITIAL_STORE_SETTINGS;
  globalThis.INITIAL_PROMO_CODES = INITIAL_PROMO_CODES;
  globalThis.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
  globalThis.PRESET_IMAGE_OPTIONS = PRESET_IMAGE_OPTIONS;
  globalThis.CUSTOMER_REVIEWS_SEED = CUSTOMER_REVIEWS_SEED;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    INITIAL_STORE_SETTINGS,
    INITIAL_PROMO_CODES,
    INITIAL_PRODUCTS,
    PRESET_IMAGE_OPTIONS,
    CUSTOMER_REVIEWS_SEED
  };
}
