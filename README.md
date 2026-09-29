# 🌊 Weave Bro — "wear the wave"

An ultra-premium Direct-to-Consumer (DTC) apparel storefront engineered specifically for heavyweight t-shirts, inspired by the minimalist luxury of **[KnottedKind](https://knottedkind.com/)** and the bold streetwear culture of **[Hemmey](https://www.hemmey.com/)**.

---

## ✨ Brand Identity & Aesthetic Theme

- **Brand Name**: `Weave Bro`
- **Tagline**: *"wear the wave"*
- **Design Philosophy**: High-density 240+ GSM pure combed cotton essentials with tailored drop-shoulder and boxy street silhouettes.
- **Color Palette**:
  - **Primary**: Deep Oceanic Midnight Navy (`#080D1A`, `#0D1627`)
  - **Secondary Accent**: Aegean Sea Wave Cyan (`#0284C7`, `#38BDF8`)
  - **Canvas**: Luxe Bone / Ivory (`#FBFBFA`, `#FFFFFF`) with crisp light/dark mode switching
  - **Alerts & Badges**: Ember Amber (`#D97706`) and Coral Red (`#E11D48`)
- **Typography**: **Flipkart Font Theme** powered by Google Fonts **Inter** (`wght@300..900`) & **Roboto** (`wght@400..700`) font stack with tabular numeric figures for prices and sleek negative tracking for high-converting e-commerce clarity.

---

## 🚀 Live Local Server
The website is currently hosted locally at:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 👕 Storefront Features (KnottedKind & Hemmey Inspired)

1. **Sticky Announcement Bar**:
   - Dynamic ticker with active discount code (`WAVE15`) and free shipping threshold.
2. **Hero Showcase**:
   - Editorial streetwear model shot (`assets/images/hero-banner.jpg`) with floating "Engineered for Drape" badge and trust metrics (★ 4.9/5 from 1,850+ Bro Tribe members).
3. **Fabric Science & GSM Pillars**:
   - 240+ GSM Heavy Cotton, Wave Bio-Wash Tech, Engineered Street Fit, and 48-Hour Dispatch.
4. **Product Collection & Filter Engine**:
   - Filter by categories: `All T-Shirts`, `240+ GSM Heavy`, `Oversized Fit`, `French Terry`, `Acid Wash`, `Waffle Knit`.
   - Sort by: Price (Low to High / High to Low), Highest GSM, Top Rated, Featured.
5. **Interactive Product Detail Modal (PDP)**:
   - **GSM Fabric Weight Meter**: Visual gauge comparing standard 180 GSM vs Weave Bro 240+ GSM vs fleece.
   - **Colorway Swatches**: Live preview switcher.
   - **Size Selector**: XS to XXL with real-time stock alert ("⚡ Only 4 left in L").
   - **Size & Fit Guide**: Complete measurement table (Chest, Length, Shoulder) with fit advice.
   - **Bundle & Save Widget**: Buy 1 Single or Buy 2 Tees (Save ₹200).
   - **Pincode Delivery Estimator**: Instant delivery estimation.
   - **Fabric & Care Accordions**: Technical fabric specs and care guidelines.
6. **Slide-Over Shopping Cart Drawer**:
   - Dynamic **Free Shipping Progress Bar** calculating amount left to unlock free shipping.
   - Quantity adjusters (+/-) and remove buttons.
   - **Promo Code Engine**: Test with `WAVE15` (15% OFF) or `WAVE20` (20% OFF).
7. **Complete 3-Step Checkout Simulator**:
   - Step 1: Shipping address & customer details.
   - Step 2: Payment method (UPI with instant QR simulation, Cards, COD).
   - Step 3: Order confirmation receipt with unique Order ID and timeline.
8. **Customer Reviews Section**:
   - Authentic reviews from verified buyers across India.
9. **Real-time Product Search Engine (Flipkart-Style)**:
   - **Central Search Bar**: Search input with instant auto-suggest dropdown and clear button.
   - **Live Suggestions Popover**: Real-time product matches showing thumbnail, highlighted title match, GSM badge, fit, and price.
   - **Interactive Preview**: Clicking any search suggestion instantly launches the interactive PDP modal.
   - **Catalog Vault Filter**: Pressing Enter or clicking Search filters the entire catalog grid live with an active search chip (`Searching: "240 GSM" (X drops) [Clear (✕)]`).
10. **Dedicated Category Navigation Menubar**:
    - Full-width category strip below the header with smooth active indicator underline.
    - Quick navigation to: `All T-Shirts`, `Heavyweight (240+ GSM)`, `Oversized Fit`, `French Terry`, `Acid Wash`, `Fabric Science`, `Customer Reviews`.
    - Horizontal smooth scrolling on mobile devices.
11. **Menubar Login & Account Module**:
    - Prominent Flipkart-style login pill button directly inside the menubar.
    - When logged out: Displays `👤 Login` with chevron, opening the instant Mobile + OTP login modal.
    - When logged in: Shows personalized badge `👤 Hi, [Name]` with green active online dot and popover dropdown menu (`My Orders`, `Profile & Address`, `Sign Out`).
12. **Simple Mobile + OTP Authentication Module**:
    - **Frictionless Phone Registration**: Users enter a 10-digit Indian mobile number (`+91`).
    - **4-Digit Instant OTP**: Sends simulated OTP with realistic SMS push alert notification.
    - **1-Click Auto-fill**: Quick auto-fill button for testing without typing.
    - **Auto-advance Split Inputs**: 4 distinct OTP cells with automatic focus shift and backspace handling.
    - **Persistent Bro Profile**: Remembers logged-in user in `localStorage`.
    - **Account Dropdown & Modal**: Fast access to "My Orders" and "Profile & Saved Address".
    - **1-Click Checkout Pre-fill**: Automatically populates customer shipping address during checkout!

---

## 🛠️ Complete Admin Console (Full CRUD Ability)

Admins have complete control to add, edit, remove, and customize the store:

### How to Access Admin Console:
1. Click the **"Admin Console"** pill badge in the top navigation bar.
2. Or click **"Admin Portal"** in the footer links.
3. Or press keyboard shortcut: **`Ctrl + Shift + A`**.
4. Or **double-click** the `WEAVE BRO.` brand logo in the header!

### Admin Capabilities:
- 📦 **Products & Inventory**:
  - **Add New T-Shirt**: Title, Subtitle, Price, Compare Price, GSM density, Fit, Color name & hex, Stock count, Badge label, Image preset or custom URL, and description.
  - **Edit Any Product**: Change pricing, update photos, edit GSM, or replenish stock.
  - **Stock Toggle**: Mark items In Stock or Out of Stock with 1-click.
  - **Delete Product**: Instantly remove any T-shirt from the store.
- 🎨 **Banners & Hero Customizer**:
  - Edit Announcement bar text.
  - Change Hero badge, headline, subtitle, and CTA button text.
  - Change Hero banner background image.
- 🎟️ **Promo Codes**:
  - Create new coupons (Code, Discount %, Min spend requirement).
  - Delete expired promo codes.
- 📋 **Customer Orders Tracker**:
  - View all orders placed through checkout.
  - See ordered items, customer address, payment method, and total paid.
  - Update status: `Processing`, `Shipped`, `Delivered`, `Cancelled`.
- ⚙️ **Data & Backup**:
  - Export entire store catalog as a JSON backup.
  - Reset to pristine factory catalog anytime.
