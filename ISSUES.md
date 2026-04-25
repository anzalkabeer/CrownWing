# CrownWing — Issues & Recommendations

> A thorough audit of the codebase covering **bugs**, **architectural problems**, **UX/performance concerns**, and **polish items**.  
> Severity: 🔴 Critical · 🟠 Major · 🟡 Minor · ⚪ Nice-to-have

---

## 🔴 Critical Issues

### 1. "Add to Cart" button doesn't actually add to cart
**File:** `app/product/[slug]/ClientProductPage.tsx` line 171  
**Problem:** The "Add to Cart" button is a `<Link href="/cart">` — it just navigates to the cart page without ever calling `POST /api/cart`. Nothing is added.  
**Fix:** Replace the `<Link>` with a `<button>` that calls `fetch('/api/cart', { method: 'POST', body: JSON.stringify({ product }) })` and then optionally navigates to `/cart` on success.

---

### 2. Auth page is placed inside `/api/auth` (route conflict)
**File:** `app/api/auth/page.tsx`  
**Problem:** A UI page (`page.tsx`) lives at `app/api/auth/`, which is the API routes directory. In Next.js App Router, files under `app/api/` are conventionally API routes. While Next.js technically allows this, it creates confusion and may break if Next.js tightens conventions. Additionally, the page fetches from relative paths `/auth/login` and `/auth/signup` — these only resolve correctly because the page itself is served from `/api/auth`.  
**Fix:** Move the auth page to `app/auth/page.tsx` and update the fetch endpoints to `/api/auth/login` and `/api/auth/signup`.

---

### 3. JWT_SECRET crash on import
**File:** `lib/auth.ts` lines 3–7  
**Problem:** The `JWT_SECRET` check throws at module-import time. If `JWT_SECRET` is missing from `.env`, the *entire application* crashes — not just the auth routes. Any page that transitively imports `lib/auth.ts` (e.g. the cart API route) will cause a fatal server error.  
**Fix:** Defer the check to function call time, or use `process.env.JWT_SECRET!` with a runtime guard inside `signToken` / `verifyToken`.

---

### 4. CROWNWING_DB_URI crash on import
**File:** `lib/mongodb.ts` lines 3–4  
**Problem:** Same pattern as the JWT issue. If the MongoDB connection string env var is missing, the entire application refuses to start — even pages that don't need the database.  
**Fix:** Lazy-initialize the MongoDB client on first use, or provide a graceful fallback/error message.

---

### 5. Inconsistent environment variable names
**Files:** `lib/mongodb.ts` uses `CROWNWING_DB_URI`; `seed-mongo.js` and `test-mongo.js` use `MONGODB_URI`  
**Problem:** Developers will configure one but forget the other, causing silent failures.  
**Fix:** Standardize on a single env var name (e.g., `MONGODB_URI`) across all files.

---

## 🟠 Major Issues

### 6. Scroll-driven hero: poor quality & massive payload
**File:** `components/Hero.tsx`  
**Problem:** The hero loads **300 individual JPEG frames** (~41 KB each, ~5.4 MB total) that were extracted from a video using ezgif, then draws them to a `<canvas>`. This causes:
- **Low visual quality**: Frames are heavily compressed to keep file sizes manageable, resulting in visible JPEG artifacts, banding, and blur.
- **Slow initial load**: 300 HTTP requests are fired simultaneously. Until all 300 complete, the user sees a loading bar instead of content.
- **High memory usage**: All 300 `HTMLImageElement` objects are held in memory for the lifetime of the page.
- **Mobile data waste**: 5+ MB of image downloads for what is essentially a 10-second video.

**Irony:** The repo already contains `public/hero-video.mp4` (2.1 MB) — the *source video* these frames were extracted from — but it's completely unused.

**Fix:** Replace the 300-frame canvas approach with **scroll-driven video scrubbing**. Use the existing `hero-video.mp4` with `<video>` element and set `video.currentTime` based on scroll progress. Benefits:
- ~60% smaller payload (2.1 MB vs 5.4 MB)
- Single HTTP request vs 300
- Full codec-quality frames (H.264/H.265) instead of over-compressed JPEGs
- Native hardware decoding support on all modern devices
- Zero canvas overhead

---

### 7. Mongoose model doesn't match actual data shape
**File:** `app/models/Product.ts` vs `lib/data.ts`  
**Problem:** The Mongoose schema defines `price: Number`, `images: string[]`, `stock: Number` — but the actual product data uses `price: string` (e.g., `"Rs.18,999"`), `image: string` (single image), and has no `stock` field. The Mongoose model is never used by any API route (they all use the native MongoDB driver).  
**Fix:** Either delete the unused Mongoose model, or refactor the API routes to use it (which would require restructuring the data shape).

---

### 8. Dual data source for products (static file + MongoDB)
**Files:** `lib/data.ts`, `app/products/route.ts`, `app/product/[slug]/page.tsx`  
**Problem:** Products exist in two places:
1. `lib/data.ts` — used by the homepage, SSG product pages, and the seed API
2. MongoDB `crownwing.products` collection — used by the REST API routes

These are completely disconnected. If you update a product in MongoDB, the SSG pages won't reflect the change (and vice versa). The "seed" route copies data from #1 to #2, but there's no ongoing sync.  
**Fix:** Choose a single source of truth. Either commit to MongoDB as primary and fetch server-side, or keep static data and remove the database routes.

---

### 9. Contact form has no backend
**File:** `app/contact/page.tsx` line 38  
**Problem:** The form calls `e.preventDefault()` and does nothing. Submitting the contact form has zero effect — no API call, no email, no validation feedback.  
**Fix:** Add an API route `/api/contact` that handles form submission (e.g., email via Resend/SendGrid, or save to DB), and wire up the form to call it.

---

### 10. Cart quantity buttons don't work
**File:** `app/cart/page.tsx` lines 161–167  
**Problem:** The increment (`+`) and decrement (`–`) buttons in the cart have no `onClick` handlers. They render but do nothing when clicked.  
**Fix:** Add click handlers that update the local state and sync with `POST /api/cart` or a new `PATCH /api/cart` endpoint.

---

### 11. Hardcoded cart badge count
**File:** `app/product/[slug]/ClientProductPage.tsx` line 69  
**Problem:** The cart icon badge shows a hardcoded `2` regardless of actual cart contents.  
**Fix:** Fetch the actual cart count from `/api/cart` or use a shared cart context/store.

---

### 12. No global navigation component (copy-pasted navbars)
**Files:** `app/page.tsx`, `app/cart/page.tsx`, `app/contact/page.tsx`, `app/product/[slug]/ClientProductPage.tsx`, `app/api/auth/page.tsx`  
**Problem:** Every page has its own navbar implementation, all slightly different — different links, different styling, different breakpoints. Changes need to be replicated across 5+ files.  
**Fix:** Extract a shared `<Navbar />` component with consistent links and styling, used from `layout.tsx` or each page.

---

## 🟡 Minor Issues

### 13. Three.js transpile config without dependency
**File:** `next.config.ts` line 4  
**Problem:** `transpilePackages` includes `three`, `@react-three/fiber`, `@react-three/drei` — none of which are in `package.json`. This is dead config left over from a removed feature.  
**Fix:** Remove the `transpilePackages` array from `next.config.ts`.

---

### 14. Prisma reference in `.gitignore`
**File:** `.gitignore` line 43  
**Problem:** `/lib/generated/prisma` is in `.gitignore` but Prisma was removed (commit `1ea2344`). Dead entry.  
**Fix:** Remove the line.

---

### 15. `hero-video.mp4` is unused (2.1 MB wasted)
**File:** `public/hero-video.mp4`  
**Problem:** A 2.1 MB video file ships with the build but isn't referenced by any component or page.  
**Fix:** Either integrate it into the hero (see Issue #6) or remove it from the repo to save bundle size.

---

### 16. No error handling on image loads in collection cards
**File:** `app/page.tsx` lines 147–151  
**Problem:** Product card images use raw `<img>` tags with no `onError` fallback. If a product image fails to load (e.g., broken path), users see a broken image icon.  
**Fix:** Use `next/image` with `placeholder="blur"` and an `onError` fallback, or add a CSS fallback background.

---

### 17. Product images use `<img>` instead of `next/image`
**Files:** `app/page.tsx`, `app/cart/page.tsx`, `app/product/[slug]/ClientProductPage.tsx`, `components/SplashScreen.tsx`  
**Problem:** All images use raw `<img>` tags instead of Next.js's `<Image>` component, missing out on automatic WebP conversion, responsive `srcset`, lazy loading, and image optimization.  
**Fix:** Migrate to `next/image` where possible.

---

### 18. Missing `alt` text quality
**Files:** Various  
**Problem:** Some alt attributes are generic (e.g., `alt="CrownWing Logo"` repeated), and alt text doesn't describe the product image content meaningfully for accessibility.  
**Fix:** Provide descriptive alt text for each product image, e.g., `"White pumpkin-shaped sofa on dark background"`.

---

### 19. Social auth buttons are non-functional
**File:** `app/api/auth/page.tsx` lines 210–217  
**Problem:** Apple and Google sign-in buttons render but have no `onClick` handlers — they're purely decorative.  
**Fix:** Either implement OAuth flows (via NextAuth or similar), or remove the buttons to avoid user confusion.

---

### 20. "Forgotten?" password link is dead
**File:** `app/api/auth/page.tsx` line 155  
**Problem:** The "Forgotten?" link has `href="#"` — it goes nowhere.  
**Fix:** Implement a password reset flow or remove the link.

---

### 21. `hero-background.png` may be unused (2.1 MB)
**File:** `public/hero-background.png`  
**Problem:** The old hero implementation (before the canvas approach) used a static background image. This 2.1 MB PNG is no longer referenced by any component after the hero was refactored to use scroll frames.  
**Fix:** Verify if it's still needed; if not, remove it.

---

### 22. `any` types throughout the codebase
**Files:** `app/page.tsx` line 96 (`item: any`), `app/cart/page.tsx` line 22 (`any[]`), `app/api/cart/route.ts` line 70 (`item: any`)  
**Problem:** Multiple uses of `any` defeat TypeScript's type safety. Cart items, collection items, and API responses are untyped.  
**Fix:** Define proper interfaces and use them consistently.

---

### 23. No loading state on product detail pages
**File:** `app/product/[slug]/ClientProductPage.tsx`  
**Problem:** If the product image is large, there's no skeleton or loading state — the page just appears to "jump" as the image loads.  
**Fix:** Add an image skeleton or `next/image` with blur placeholder.

---

### 24. External font loaded via `<link>` in auth page
**File:** `app/api/auth/page.tsx` line 80  
**Problem:** Google Material Symbols font is loaded via a raw `<link>` tag injected into the component body (not in `<head>`). This is non-standard in Next.js, causes a layout shift, and the font may not load before the component renders.  
**Fix:** Use `next/font/google` or move the `<link>` to layout metadata.

---

## ⚪ Nice-to-Have / Polish

### 25. No footer component
**Problem:** Only the auth page has a footer. The homepage, product pages, cart, and contact pages have no footer — missing copyright, links, and social media presence.

### 26. No favicon fallback
**Problem:** `app/icon.jpg` serves as the favicon, but JPEG favicons have limited browser support. Consider adding `favicon.ico` and an SVG variant.

### 27. No 404 page
**Problem:** When navigating to a non-existent product slug, `notFound()` is called but there's no custom `not-found.tsx` — users see the default Next.js 404 page.

### 28. No SEO meta on sub-pages
**Problem:** Only the root layout has metadata. Product detail pages, cart, contact, auth, and payment pages inherit the homepage title/description instead of having unique meta tags.

### 29. Splash screen always plays
**Problem:** The 2.5s splash screen plays on every visit/refresh. Returning users get the same delay every time.  
**Suggestion:** Use `sessionStorage` to skip the splash on subsequent visits within the same session.

### 30. No "Remember Me" implementation
**File:** `app/api/auth/page.tsx` line 176–184  
**Problem:** The "Maintain access on this vessel" checkbox exists but has no effect on token lifetime or storage behavior.

### 31. Missing HTTPS security headers
**Problem:** No Content-Security-Policy, X-Frame-Options, or other security headers are configured. Recommended for production deployment.

### 32. No rate limiting on auth endpoints
**Problem:** The login and signup endpoints have no rate limiting, making them vulnerable to brute-force attacks.

### 33. User data stored in flat file
**File:** `data/users.json`  
**Problem:** User credentials (including bcrypt hashes) are stored in a plain JSON file on the filesystem. This doesn't scale, isn't atomic for concurrent writes, and the file is committed to the repo with actual user data.  
**Suggestion:** Migrate user storage to MongoDB (which is already connected for carts and products).

---

## Summary by Severity

| Severity | Count | Key Themes |
|---|---|---|
| 🔴 Critical | 5 | Broken core flows (cart, auth), crash-on-start env handling |
| 🟠 Major | 7 | Data architecture, hero quality, disconnected features |
| 🟡 Minor | 12 | Dead code, missing optimizations, accessibility gaps |
| ⚪ Polish | 9 | UX refinements, security hardening, DX improvements |
| **Total** | **33** | |
