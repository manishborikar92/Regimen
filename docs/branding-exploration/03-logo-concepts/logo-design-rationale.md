# Finalized Logo Direction: The Guiding Sutra (Design Specification)

**Date:** 14 October 2026 (Revision 2)  
**Subject:** Technical Specification & Scalability Adapters for Guiding Sutra  
**Status:** **FINALIZED LOGO DIRECTION (Concept 3 Approved by User)**

---

## 1. Approval Confirmation & Visual Philosophy

As approved by Manish Borikar, **Concept 3: The Guiding Sutra** is the official, finalized logo direction for the personal routine companion. Competing logo concepts are formally retired.

### Conceptual Symbolism
The name *Sūtra* in Sanskrit literally translates to **"thread"**—the connecting strand upon which pearls of wisdom, practices, and moments of awareness are strung.

The **Guiding Sutra** logo embodies this metaphor through an unbroken, continuous monoline ribbon loop:
1. **Unbroken Continuity:** A single stroke that seamlessly curves through itself, signifying that daily practices are not fragmented chores, but an integrated whole.
2. **Mind-Body Integration:** The dual loops connect physical vitality (the 12-week body restoration protocol and walking) with cognitive self-cultivation (Norman Lewis vocabulary study, Osho discourses, nightly reading, and private journaling).
3. **The Still Center:** The golden-amber anchor dot (`cx=100, cy=100`) sits precisely at the mathematical equilibrium of the loop, representing present-moment awareness—the calm center from which all daily actions arise.
4. **Anti-Cliché Integrity:** Built from pure cubic Bezier curves and solid geometric contrast, with zero artificial purple/cyan neon gradients or blurred AI artifacts.

---

## 2. Technical Construction & Geometry

```
                  (132, 68) ────── (156, 68)
                 /                          \
                /     [Loop 2: Mind]         \
    (68, 84) ──/──                            \
   /              \                            \
  /                \       ● (100, 100)        | (132, 116)
 |                  \    [Anchor Center]       /
 |  [Loop 1: Body]   \                        /
  \                   ── (92, 128) ──────────
   \                          /
    (44, 132) ────── (68, 132)
```

- **Canvas Dimensions:** 200 × 200 viewBox (`viewBox="0 0 200 200"`).
- **Ribbon Contour Path:** 
  `M 68 132 C 44 132 40 100 68 84 C 92 70 108 130 132 116 C 160 100 156 68 132 68 C 108 68 92 128 68 132 Z`
- **Master Stroke Width:** 14px (7.0% of viewBox), `stroke-linecap="round"`, `stroke-linejoin="round"`.
- **Anchor Seed:** Circle at `cx=100, cy=100, r=9` (`fill="#D97706"` in light mode, `#F59E0B` in dark mode).

---

## 3. Production Placement & Responsive Adapters

To ensure flawless optical clarity across all devices, five specialized vector adapter files have been generated:

### 3.1 Authoritative Master Vector
- **File:** [`guiding-sutra-master.svg`](./guiding-sutra-master.svg)
- **Role:** The canonical, unconstrained SVG with `currentColor` inheritance. Used for dynamic CSS coloring and high-resolution marketing.

### 3.2 Application Top Navigation (`TopNav.js`)
- **File:** [`guiding-sutra-lockup.svg`](./guiding-sutra-lockup.svg)
- **Dimensions:** 32 × 32 px icon box in the sticky navigation header.
- **Lockup:** Paired horizontally with the selected brand name (e.g. `VRITTA` or `ANUVRITTA`) set in bold sans-serif with `letter-spacing: 0.16em`.

### 3.3 Micro-Scale Favicon & Browser Tabs (16×16 & 32×32)
- **File:** [`guiding-sutra-favicon.svg`](./guiding-sutra-favicon.svg)
- **Optical Optimization:** At 16px, a 14px stroke can appear thin on low-DPI monitors. The dedicated favicon adapter increases stroke-width to **20px** and the anchor dot to **r=13px**, placed inside a filled squircle tile (`rx=44`). This ensures sharp silhouette definition in browser tabs and bookmarks.

### 3.4 Light & Dark Theme Adapters
- **Light Theme:** [`guiding-sutra-light.svg`](./guiding-sutra-light.svg) — Crisp stroke against porcelain surfaces (`#FFFFFF` / `#F8FAFC`).
- **Dark Theme:** [`guiding-sutra-dark.svg`](./guiding-sutra-dark.svg) — Luminous teal/accent stroke against deep obsidian surfaces (`#090D16` / `#111827`).

### 3.5 PWA Mobile App Icons & Touch Shortcuts
- **Target Sizes:** `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`, `apple-icon.png` (180×180).
- **Safe Zone:** The mark is centered with a 15% outer safety margin, preventing clipping when iOS applies squircle masks or Android applies circular adaptive icon masks.

### 3.6 Login Hero & Splash Screen
- **Dimensions:** 80 × 80 px mark centered within a clean, elevated tile (`rx=24`, subtle 1px border), eliminating the deprecated AI pulsing blur blob entirely.
