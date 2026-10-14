# Project Branding, Logo, Theme & UI/UX Exploration

**Prepared For:** Manish Borikar  
**Date:** 14 October 2026 (Revision 2)  
**Status:** **PHASE 7 DELIVERABLE (APPROVAL-FIRST GATE — PENDING USER REVIEW)**

> [!IMPORTANT]
> **Strict Approval Gate:** As instructed, all exploration deliverables have been prepared in this isolated directory (`docs/branding-exploration/`). **No production source files, database schemas, existing logos, or configs have been modified.** Implementation will begin only after your explicit approval and selection of brand name and color palette.

---

## Deliverables Directory Structure

```
docs/branding-exploration/
├── README.md                                    ← This index and summary
├── 01-project-analysis-and-audit.md             ← Comprehensive project audit & anti-slop guidelines
├── 02-name-proposals.md                         ← VRITTA Subdomain analysis + 10 new names with verified Vercel status
├── 03-logo-concepts/                            ← Approved Concept 3: Guiding Sutra vector master assets
│   ├── guiding-sutra-master.svg                 ← Master 800×800 vector mark with construction geometry
│   ├── guiding-sutra-light.svg                  ← Standalone mark optimized for light mode canvas
│   ├── guiding-sutra-dark.svg                   ← Standalone mark optimized for dark mode canvas
│   ├── guiding-sutra-favicon.svg                ← Optically boosted 20px-stroke icon for 16px/32px browser tabs
│   ├── guiding-sutra-lockup.svg                 ← Horizontal lockup with VRITTA typography
│   ├── logo-concept-3-guiding-sutra.svg         ← Approved original concept SVG
│   ├── logo-concept-1-grounded-arc.svg          ← Concept 1 archive
│   ├── logo-concept-2-stepped-horizon.svg       ← Concept 2 archive
│   ├── logo-concept-4-still-center.svg          ← Concept 4 archive
│   ├── logo-concept-5-dual-pulse.svg            ← Concept 5 archive
│   ├── logo-comparison-sheet.svg                ← Master comparison sheet (Light, Dark, 32px, 16px)
│   └── logo-design-rationale.md                 ← Construction, geometry & scalability analysis
├── 04-color-palette-and-tokens.md               ← 9 distinct palettes, semantic tokens & WCAG 2.2 AA audit
├── 05-ui-ux-mockups/                            ← High-fidelity vector SVG mockups & guides
│   ├── palette-comparison-sheet.svg             ← 9-palette comparative UI sheet on real components
│   ├── mockup-dashboard-today-light.svg         ← Today Dashboard (Desktop Light Mode with Guiding Sutra)
│   ├── mockup-dashboard-today-dark.svg          ← Today Dashboard (Desktop Dark Mode with Guiding Sutra)
│   ├── mockup-mobile-today-comparison.svg       ← Mobile viewports comparison (Light & Dark)
│   ├── mockup-routine-manager.svg               ← Routine Architecture / Habits screen
│   ├── mockup-insights-analytics.svg            ← Insights & 30-day rest-day aware heatmap
│   ├── mockup-login-screen.svg                  ← Redesigned Login screen without AI glow
│   └── ui-ux-design-system-and-mockup-guide.md  ← UI/UX improvements & component guide
├── 06-phased-implementation-plan.md             ← Step-by-step technical implementation roadmap
└── interactive-preview.html                     ← Live interactive browser preview (9 palettes + Light/Dark switcher)
```

---

## How to Review the Deliverables

1. **Live Browser Preview:** Double-click or open [`interactive-preview.html`](./interactive-preview.html) in your browser (Chrome/Edge/Safari) to interactively test all **9 color palettes**, toggle **Light and Dark themes live**, inspect the **Guiding Sutra** mark, and view the high-fidelity mockups.
2. **Review the 9-Palette Comparison:** Open [`05-ui-ux-mockups/palette-comparison-sheet.svg`](./05-ui-ux-mockups/palette-comparison-sheet.svg) to inspect side-by-side renders of actual application components across all 9 visual directions.
3. **Review the Approved Logo Master Assets:** Inspect [`03-logo-concepts/guiding-sutra-master.svg`](./03-logo-concepts/guiding-sutra-master.svg), [`guiding-sutra-light.svg`](./03-logo-concepts/guiding-sutra-light.svg), and the optically boosted favicon [`guiding-sutra-favicon.svg`](./03-logo-concepts/guiding-sutra-favicon.svg).
4. **Review the Name Candidates & Vercel Matrix:** Read [`02-name-proposals.md`](./02-name-proposals.md) to explore the verified Vercel status for **VRITTA subdomains** (`vritta-app.vercel.app`, `myvritta.vercel.app`) and the 10 new candidates (such as **Anuvritta** and **Swadhyay**).
5. **Review the Implementation Plan:** Read [`06-phased-implementation-plan.md`](./06-phased-implementation-plan.md) for the exact technical roadmap.

---

## Decisions Needed to Proceed

1. **Project Name:** 
   - Keep **VRITTA** with a verified available subdomain (e.g. `vritta-app.vercel.app` or `myvritta.vercel.app`), OR
   - Select one of the 10 new candidates (e.g. **ANUVRITTA** at `anuvritta.vercel.app`, **SWADHYAY** at `swadhyay.vercel.app`, etc.).
2. **Color Palette Selection:** Which of the 9 visual directions do you prefer for the core theme?
   - Palette 1: Restorative Juniper & Warm Amber
   - Palette 2: Nordic Spruce & Birch Sandstone
   - Palette 3: Kyoto Sumi & Temple Vermilion
   - Palette 4: Terracotta & Mediterranean Olive
   - Palette 5: Prussian Navy & Desert Ochre
   - Palette 6: Titanium Monolith & Lapis Lazuli
   - Palette 7: Dusk Fig & Restorative Sage
   - Palette 8: Modernist Zinc & Signal Amber
   - Palette 9: Botanical Moss & Burnished Copper
3. **Explicit Authorization:** Grant authorization to begin Phase 1 of the implementation plan once you are satisfied with the selections.
