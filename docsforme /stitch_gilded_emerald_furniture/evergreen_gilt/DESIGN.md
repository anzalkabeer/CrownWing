# Design System Document: The Illuminated Sanctuary

## 1. Overview & Creative North Star
The objective of this design system is to transcend traditional e-commerce layouts, moving toward a **"High-End Editorial"** experience. We are not building a shop; we are curating a digital gallery.

**Creative North Star: The Illuminated Sanctuary.**
This concept focuses on the interplay between the deep, hushed stillness of a forest at twilight (`#1B3022`) and the intentional, warm glow of golden light (`#D4AF37`). To achieve this, the design system rejects rigid grids in favor of **intentional asymmetry** and **tonal depth**. Elements should feel as though they are emerging from the shadows, illuminated by a soft, ambient light source. 

We break the "template" look by using exaggerated typographic scales, overlapping imagery that breaks container boundaries, and a rejection of structural lines in favor of light-based separation.

---

## 2. Colors
Our palette is rooted in the depth of the forest. The interaction between the dark greens and the golden accents must feel organic, not mechanical.

### The Palette
- **Surface & Background:** Use `surface` (#101511) as your canvas. It is deep and atmospheric, providing the necessary contrast for our golden accents.
- **Primary Roles:** The `primary_container` (#1B3022) serves as your structural base for larger sections. Use `primary` (#B4CDB8) for subtle highlights.
- **The Golden Accents:** `tertiary` (#E9C349) and `tertiary_container` (#CBA72F) represent "light." Use these for CTAs, focus states, and moments of high importance.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or cards. 
Boundaries must be created through:
- **Tonal Shifts:** Placing a `surface_container_low` section against a `surface` background.
- **Negative Space:** Using the Spacing Scale to create "breathing rooms" that naturally separate content.
- **Subtle Gradients:** Transitioning from `primary_container` to `surface` to guide the eye without a hard edge.

### Signature Textures & Glassmorphism
To create a premium feel, floating elements (like navigation bars or hovering price tags) must utilize **Glassmorphism**. Use a semi-transparent `surface_container_high` with a `backdrop-blur` of 20px–40px. This allows the rich forest greens to bleed through, softening the interface and making it feel like an integrated environment rather than a flat screen.

---

## 3. Typography
Our typography is a dialogue between heritage and modernity.

- **Display & Headlines (Noto Serif):** This is our "Editorial" voice. Use `display-lg` and `headline-lg` for product names and hero messaging. The serif should feel authoritative and timeless. Don't be afraid to use `display-lg` with tight letter-spacing for a bold, high-fashion impact.
- **Body & Labels (Manrope):** This is our "Functional" voice. Manrope is a clean, geometric sans-serif that ensures legibility. Use `body-lg` for product descriptions and `label-md` for technical specifications.
- **Hierarchy Tip:** Always pair a large Noto Serif headline with a significantly smaller Manrope subtitle to create a "High-Contrast" hierarchy that screams luxury.

---

## 4. Elevation & Depth
In this design system, depth is a result of light and layering, not artificial drop shadows.

### The Layering Principle
Achieve hierarchy by "stacking" surface tiers. 
- **Base:** `surface` (#101511)
- **Nested Content:** `surface_container_low` (#181D19)
- **Interactive Elements:** `surface_container_high` (#262B27)
By placing a lower tier inside a higher tier (or vice versa), you create a natural lift that feels like fine paper or stacked materials.

### Ambient Shadows & Golden Glows
When an element must "float," use an **Ambient Glow** instead of a shadow.
- **Shadow Property:** Use the `on_surface` color at 4% opacity with a 32px blur.
- **The "Golden Light" Effect:** For primary CTAs or featured product cards, apply a subtle outer glow using `tertiary` (#E9C349) at 5%-10% opacity. This simulates the "golden ambient light" requested, making the element appear backlit.

### The Ghost Border Fallback
If accessibility requires a border, use a **Ghost Border**: the `outline_variant` token at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons (The "Jewel" Component)
- **Primary:** Background `tertiary`, text `on_tertiary`. Radius `DEFAULT` (0.25rem). Add a subtle `tertiary_container` gradient to give it a soft, convex "pill" feel.
- **Secondary:** Transparent background with a `tertiary` Ghost Border (20% opacity). Text in `tertiary`.
- **States:** On hover, the golden glow (Ambient Glow) should increase in intensity, mimicking a light getting brighter as you approach it.

### Product Cards
- **Structure:** No borders. Use a `surface_container_lowest` background. 
- **Imagery:** Product images should have a slight "overhang" or break the container's padding to create an asymmetrical, custom look.
- **Typography:** Product title in `title-lg` (Manrope), price in `headline-sm` (Noto Serif).

### Input Fields
- **Style:** Underline only (using `outline_variant` at 30% opacity) or a very subtle `surface_container_highest` block.
- **Focus:** When active, the underline transitions to `tertiary` (Gold) with a soft 4px blur glow beneath it.

### Navigation (The Floating Bar)
- **Style:** `surface_container_low` at 80% opacity with a heavy backdrop blur. No border. It should appear as a "haze" at the top of the screen.

---

## 6. Do's and Don'ts

### Do:
- **Use Large Margins:** Luxury is defined by the space you *don't* use.
- **Animate Smoothly:** Transitions should be slow and ease-in-out. Think of the movement of a heavy velvet curtain.
- **Embrace Asymmetry:** Place text off-center or overlap images to avoid the "bootstrap" look.

### Don't:
- **No Pure Black:** Never use `#000000`. Use our `surface` (#101511) to keep the forest-green depth alive.
- **No High-Contrast Dividers:** Never use a 100% opaque line to separate content. Use a `surface_container` shift instead.
- **No Sharp Shadows:** Avoid small blur, high-opacity shadows. They look cheap and digital.
- **Don't Overuse Gold:** The gold (`tertiary`) is light. If everything is glowing, nothing is special. Use it sparingly to guide the user's eye to the most important actions.