# CrownWing — Project Context

> **Premium furniture e-commerce storefront** built with **Next.js 16 (App Router)**, React 19, Tailwind CSS v4, Framer Motion, and a MongoDB backend.  
> Repository: `github.com/anzalkabeer/CrownWing`

---

## 1. High-Level Overview

CrownWing is a luxury furniture brand website with an emphasis on cinematic visual design. The site features:

- **Splash screen** — animated branded intro (Framer Motion) shown for 2.5 s on first load.
- **Scroll-driven hero** — 300-frame image sequence rendered to a `<canvas>`, scrubbed via scroll position with lerp smoothing.
- **Product catalogue** — 8 furniture items displayed in a responsive grid with 3D tilt hover cards.
- **Product detail pages** — SSG via `generateStaticParams`, with color-variant swatch linking, design specs, and "Add to Cart" CTA.
- **Shopping cart** — fetched from MongoDB, with animated item cards, quantity controls, order summary, and checkout transition.
- **Payment page** — placeholder "Secure Checkout" stub.
- **Contact page** — styled contact form (client-side only, no backend handler).
- **Authentication** — Sign Up / Sign In with tabbed UI, JWT tokens stored in HttpOnly cookies, user records in a local JSON file (`data/users.json`).
- **About section** — brand mission statement on the homepage.

The color palette is a dark, warm luxury theme: near-black backgrounds (`#0a0a08`), cream text (`#f0e6d3`), emerald green accents (`#0f3d2e`, `#6aa084`), and gold highlights (`#c9a45c`). Typography uses **Inter** (body) and **Playfair Display** (headings) via `next/font/google`.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 + vanilla CSS (`globals.css`) | ^4 |
| PostCSS | `@tailwindcss/postcss` | ^4 |
| Animation | Framer Motion | ^12.38.0 |
| Database | MongoDB (native driver) | ^7.2.0 |
| ORM (unused) | Mongoose (model defined but unused in API routes) | ^9.5.0 |
| Auth | bcryptjs + jsonwebtoken (manual JWT) | ^3.0.3 / ^9.0.3 |
| Env | dotenv | ^17.4.2 |
| Linting | ESLint (next core-web-vitals + typescript) | ^9 |
| Deployment target | Vercel (implied by README & config) | — |

### Key Config Files

| File | Purpose |
|---|---|
| `next.config.ts` | Transpiles `three`, `@react-three/fiber`, `@react-three/drei` (packages not in `package.json` — leftover config) |
| `tsconfig.json` | `@/*` path alias → project root, `jsx: react-jsx`, `moduleResolution: bundler` |
| `postcss.config.mjs` | `@tailwindcss/postcss` plugin |
| `eslint.config.mjs` | Flat config, next core-web-vitals + typescript |

---

## 3. Directory Structure

```
CrownWing/
├── app/
│   ├── layout.tsx              # Root layout (Inter + Playfair Display fonts, body styling)
│   ├── page.tsx                # Homepage (SplashScreen → Hero → Collection → About)
│   ├── globals.css             # Full design system (~915 lines): variables, hero, nav, CTA, collection, about, responsive
│   ├── icon.jpg                # Favicon (CrownWing logo)
│   │
│   ├── product/[slug]/
│   │   ├── page.tsx            # Server component — SSG, finds product by slug, renders ClientProductPage
│   │   └── ClientProductPage.tsx  # Client component — product detail with image, swatches, specs, "Add to Cart"
│   │
│   ├── cart/
│   │   └── page.tsx            # Cart page — fetches from /api/cart, order summary, animated items, checkout CTA
│   │
│   ├── payment/
│   │   └── page.tsx            # Payment stub page — "Secure Checkout" placeholder
│   │
│   ├── contact/
│   │   └── page.tsx            # Contact form (Name, Email, Subject, Message — no backend submission)
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── page.tsx        # Auth UI page (Sign In / Sign Up tabs) — NOTE: placed under api/ (unconventional)
│   │   │   ├── login/route.ts  # POST — login with bcrypt verification, returns JWT in cookie
│   │   │   ├── signup/route.ts # POST — sign up, hash password, save to JSON, return JWT in cookie
│   │   │   └── me/route.ts     # GET — verify JWT, return user profile (excludes passwordHash)
│   │   │
│   │   ├── cart/route.ts       # GET/POST/DELETE — cart CRUD backed by MongoDB 'carts' collection
│   │   │                       #   Session: JWT userId (authenticated) or guestCartId cookie (guest)
│   │   │
│   │   └── seed/route.ts       # GET — seeds MongoDB 'products' collection from lib/data.ts (idempotent)
│   │
│   ├── products/
│   │   ├── route.ts            # GET — list all products from MongoDB
│   │   └── [id]/route.ts       # GET — single product by numeric id or slug from MongoDB
│   │
│   └── models/
│       └── Product.ts          # Mongoose schema + validation helpers (unused by API routes — they use native driver)
│
├── components/
│   ├── Hero.tsx                # Scroll-driven 300-frame canvas animation (preloads all JPGs, lerp render loop)
│   └── SplashScreen.tsx        # 2.5s branded splash overlay with golden glow + progress bar animation
│
├── lib/
│   ├── data.ts                 # Static product catalogue (8 items) with type definition, used by homepage + SSG
│   ├── auth.ts                 # JWT sign/verify helpers (requires JWT_SECRET env var)
│   ├── db.ts                   # Flat-file JSON user store (data/users.json) — CRUD for auth
│   └── mongodb.ts              # MongoDB native client singleton (requires CROWNWING_DB_URI env var)
│
├── data/
│   └── users.json              # Flat-file user database (currently 1 user: "ameer")
│
├── public/
│   ├── logo-crownwing.jpg      # Brand logo (used in splash, nav, favicon)
│   ├── hero-background.png     # Hero section background image (~2.1 MB)
│   ├── hero-video.mp4          # Hero video asset (~2.2 MB, not currently used in code)
│   ├── frames/                 # 300 JPG frames (ezgif-frame-001.jpg → ezgif-frame-300.jpg) for scroll animation
│   ├── products/               # 8 product image directories (one per product slug)
│   │   ├── pumpkin-sofa-white/
│   │   ├── modern-3-seater-emerald/
│   │   ├── curved-boucle-sectional-beige/
│   │   ├── leather-finish-rocking-chair/
│   │   ├── pumpkin-sofa-blue/
│   │   ├── azure-solid-wood-chaise-pink/
│   │   ├── modern-3-seater-boucle-beige/
│   │   └── curved-velvet-low-height/
│   └── *.svg                   # Default Next.js SVG assets (file, globe, next, window)
│
├── seed-mongo.js               # Standalone Node script to seed MongoDB products collection (CommonJS, uses dotenv)
├── test-mongo.js               # Standalone Node script to test MongoDB connectivity
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .gitignore
├── AGENTS.md                   # Agent rules: warns about Next.js 16 breaking changes
├── CLAUDE.md                   # Points to AGENTS.md
└── README.md                   # Default create-next-app README
```

---

## 4. Data Flow & Architecture

### 4.1 Product Data — Dual Source Pattern

Products exist in **two places** simultaneously:

1. **Static (`lib/data.ts`)** — Used for SSG pages (`generateStaticParams`), homepage collection grid, and the seed API. This is the source of truth for page rendering.
2. **MongoDB (`crownwing.products`)** — Seeded via `/api/seed` or `seed-mongo.js`. Used by `/products` and `/products/[id]` API routes.

The two sources share the same shape (`id`, `name`, `slug`, `description`, `price`, `image`) but the Mongoose model in `app/models/Product.ts` defines a **different schema** (`price: Number`, `images: string[]`, `stock: Number`) — it is never actually used by any route.

### 4.2 Authentication Flow

```
Client (Auth Page)
  ├─ POST /auth/signup  →  Validates → bcrypt hash → saves to data/users.json → signs JWT → sets HttpOnly cookie
  ├─ POST /auth/login   →  Finds user in JSON → bcrypt compare → signs JWT → sets HttpOnly cookie
  └─ GET  /auth/me      →  Reads token from cookie or Authorization header → verifies → returns user profile
```

- **JWT_SECRET** env var is required at module load time (`lib/auth.ts` throws on import if missing).
- Token lifetime: 7 days.
- User storage: flat-file JSON (`data/users.json`), not MongoDB.

### 4.3 Cart Flow

```
Client (Cart Page)                       Server (API)                     Database (MongoDB)
  │                                        │                                │
  ├─ GET /api/cart ──────────────────────►  │  getCartSession()              │
  │                                        │  ├─ checks JWT cookie          │
  │                                        │  └─ falls back to guestCartId  │
  │                                        │  ── findOne({ sessionId }) ──► │  crownwing.carts
  │  ◄──────────────────── { items } ──────┤                                │
  │                                        │                                │
  ├─ POST /api/cart { product, qty } ────► │  upsert cart ────────────────► │
  │                                        │                                │
  └─ DELETE /api/cart?id=N ──────────────► │  filter items array ─────────► │
```

- Guest carts use a random UUID stored in a 30-day `guestCartId` cookie.
- Authenticated users' carts are keyed by their `userId`.

---

## 5. Environment Variables

| Variable | Used In | Purpose |
|---|---|---|
| `JWT_SECRET` | `lib/auth.ts` | HMAC secret for JWT signing/verification. **Required** — app crashes on import if missing. |
| `CROWNWING_DB_URI` | `lib/mongodb.ts` | MongoDB connection string. **Required** — app crashes on import if missing. |
| `MONGODB_URI` | `seed-mongo.js`, `test-mongo.js` | MongoDB connection string for standalone scripts (different env var name). |

---

## 6. API Routes Summary

| Method | Path | Handler | Description |
|---|---|---|---|
| POST | `/auth/login` | `app/api/auth/login/route.ts` | Email/password login, returns JWT cookie |
| POST | `/auth/signup` | `app/api/auth/signup/route.ts` | Register user, hash password, return JWT cookie |
| GET | `/auth/me` | `app/api/auth/me/route.ts` | Verify JWT, return user profile |
| GET | `/api/cart` | `app/api/cart/route.ts` | Fetch cart items for session |
| POST | `/api/cart` | `app/api/cart/route.ts` | Add product to cart (upsert) |
| DELETE | `/api/cart?id=N` | `app/api/cart/route.ts` | Remove product from cart |
| GET | `/api/seed` | `app/api/seed/route.ts` | Seed products collection (idempotent) |
| GET | `/products` | `app/products/route.ts` | List all products from MongoDB |
| GET | `/products/[id]` | `app/products/[id]/route.ts` | Get single product by id or slug |

---

## 7. Pages & Routing

| Path | Component | Rendering | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | Client (`"use client"`) | Homepage: splash → hero animation → collection grid → about |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | SSG + Client Island | Product detail page (SSG params from `lib/data.ts`) |
| `/cart` | `app/cart/page.tsx` | Client | Shopping cart with animated items and order summary |
| `/payment` | `app/payment/page.tsx` | Server | Placeholder checkout page |
| `/contact` | `app/contact/page.tsx` | Client | Contact form (no backend submission) |
| `/api/auth` | `app/api/auth/page.tsx` | Client | Sign In / Sign Up page with tabbed UI |

---

## 8. Design System

### 8.1 CSS Variables (`:root` in `globals.css`)

```css
--background: #0a0a08       /* Near-black base */
--foreground: #f0e6d3       /* Warm cream text */
--primary: #0f3d2e          /* Deep emerald */
--secondary: #6aa084        /* Sage green */
--accent-gold: #c9a45c      /* Gold accent */
--accent-gold-light: #e0c88a /* Light gold */
--accent-warm: #b08968      /* Warm brown */
--text-cream: #f0e6d3       /* Heading text */
--text-muted: rgba(240, 230, 211, 0.6)  /* Subdued text */
```

### 8.2 Typography

- **Body**: Inter (`--font-inter`, `--font-sans`)
- **Display/Headings**: Playfair Display (`--font-playfair`, `--font-display`)

### 8.3 Animation Keyframes

| Name | Purpose |
|---|---|
| `scrollHintBounce` | Scroll indicator dot bounce |
| `shimmer` | Skeleton card loading shimmer |
| `spin` | Loading spinner rotation |
| `breath` | Splash screen logo breathing |
| `pulse-glow` | Splash screen golden glow |
| `progress` | Splash screen loading bar fill |

### 8.4 Responsive Breakpoints

- `1024px` — Tablet adjustments (nav padding, hero text)
- `768px` — Mobile: hide desktop menu, show mobile menu button, stack collection grid to single column
- `480px` — Small mobile: further heading/tag size reductions

---

## 9. Notable Patterns & Design Decisions

1. **Hybrid rendering**: Homepage is fully client-rendered (`"use client"`), product pages use SSG with a client island for interactivity.

2. **Dual data storage**: Auth uses flat-file JSON; cart and products use MongoDB. This creates a split persistence model.

3. **Auth page under `/api/auth`**: The auth UI page (`page.tsx`) is placed inside `app/api/auth/` alongside the API routes. This is unconventional — typically UI pages are at `app/auth/` and API routes at `app/api/auth/`.

4. **3D tilt cards**: Collection cards implement a custom mouse-tracked 3D tilt effect using `rotateX`/`rotateY` transforms, calculated from mouse position relative to card bounds.

5. **Canvas scroll animation**: The Hero component preloads 300 frame images into memory, renders them to a `<canvas>` element, and uses a `requestAnimationFrame` lerp loop to smoothly interpolate between frames as the user scrolls through a 350vh tall runway section.

6. **Color variant swatches**: Product detail pages detect variant groups by slug prefix (e.g., `pumpkin-sofa-*`), rendering linked swatch circles for each variant.

7. **Cart session management**: Supports both authenticated (JWT-based) and guest (cookie UUID) cart sessions, with MongoDB as the backing store.

---

## 10. Known Issues & Technical Debt

1. **Mongoose model is unused**: `app/models/Product.ts` defines a Mongoose schema with fields (`price: Number`, `images: string[]`, `stock: Number`) that differ from the actual data shape in `lib/data.ts` (`price: string`, `image: string`, no `stock`). All API routes use the native MongoDB driver directly.

2. **Three.js transpile config without dependency**: `next.config.ts` transpiles `three`, `@react-three/fiber`, `@react-three/drei`, but none of these are listed in `package.json`.

3. **Inconsistent env var naming**: `lib/mongodb.ts` uses `CROWNWING_DB_URI`, while standalone scripts (`seed-mongo.js`, `test-mongo.js`) use `MONGODB_URI`.

4. **Auth page route path**: Auth page lives at `/api/auth` instead of `/auth`, which conflicts with Next.js API route conventions.

5. **Auth fetch paths**: The auth page (`app/api/auth/page.tsx`) fetches from `/auth/login` and `/auth/signup` — these would resolve to `/api/auth/login` and `/api/auth/signup` only if navigated from the `/api/auth` page context. If moved to `/auth`, paths would need updating.

6. **Contact form has no backend**: The form in `/contact` calls `e.preventDefault()` with no submission logic.

7. **"Add to Cart" button is a link**: On the product detail page, the "Add to Cart" button is a `<Link href="/cart">` that navigates to the cart without actually adding the product via the API.

8. **No Prisma but gitignore references it**: `.gitignore` includes `/lib/generated/prisma` — leftover from a removed dependency.

9. **Hardcoded cart badge**: `ClientProductPage.tsx` shows a hardcoded `2` cart badge instead of the actual cart count.

10. **`hero-video.mp4` is unused**: A ~2.2 MB video file exists in `public/` but is not referenced by any component.

11. **Git checkout issue**: The repo contains paths with spaces in directory names (`docsforme /stitch_gilded_emerald_furniture/...`) that cause checkout failures on Windows due to trailing space in `docsforme `. These are design reference files and not part of the application source.

---

## 11. Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with required variables
#    JWT_SECRET=your-secret-key
#    CROWNWING_DB_URI=mongodb+srv://...

# 3. Run development server
npm run dev

# 4. (Optional) Seed the MongoDB products collection
#    Visit http://localhost:3000/api/seed
#    OR run: node seed-mongo.js (requires MONGODB_URI in .env)

# 5. Open http://localhost:3000
```

---

## 12. Git History (6 commits)

| Hash | Message |
|---|---|
| `82c67e0` | added the hero-frames |
| `d33d649` | Update landing page with Hero component and video |
| `1ea2344` | Remove unused Prisma configuration to fix Vercel build |
| `6dd6bb3` | Fix typescript build errors |
| `e0f5ea5` | Secure JWT secret handling |
| `01de1d4` | Initialize project and add MongoDB backend integration |
