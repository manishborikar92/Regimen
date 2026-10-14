# UI/UX Design System & Mockup Evaluation Guide

**Date:** 14 October 2026  
**Subject:** Detailed UI/UX Architecture, Component System & Screen Breakdown  
**Audience:** Manish Borikar  
**Status:** Phase 6 Exploration Deliverable (Approval-First Gate)

---

## 1. Core UI/UX Philosophy: Humane, Rhythmic, Uncluttered

The redesign transforms the user experience from an administrative task-tracking tool into an **intentional, calm companion**.

### Key Improvements Over Current Implementation:
1. **Cadence Periods Over Rigid Hours:** The Today dashboard groups activities into **Flexible (Anytime)**, **Afternoon (Movement)**, and **Before Bed (Reading & Reflection)**. It completely eliminates the anxiety of red overdue warnings when an afternoon workout happens at 6:30 PM.
2. **Elimination of Nested "Card-in-Card" Clutter:** Instead of deep gray borders wrapping sub-cards inside parent cards, activities now use flat, crisp surfaces (`--color-bg-surface`) with single subtle dividers and intentional whitespace.
3. **Restraint in "Eyebrow" Chrome:** Overused small-caps labels above every heading are stripped out. Section titles are clean sentence-case headings that guide attention without shouting.
4. **Physical Tactility on Touch Devices:** Every interactive target implements active tactile depression (`active:scale-[0.98]` or `active:translate-y-[1px]`) and enforces a **48×48 px minimum touch target** for thumb reachability on mobile.
5. **Night-Reading Protection:** With the zero-flash Dark Mode, opening the app in bed to log 30 minutes of reading or write a diary reflection uses true low-glare deep obsidian surfaces (`#090D16`), preserving melatonin and eye comfort.

---

## 2. Typographic System & Hierarchy

The application standardizes on a high-legibility sans system (Geist or Inter with optical metric adjustments):

```
┌─────────────────┬───────────┬────────────┬──────────────────────────────────────┐
│ Text Element    │ Font Size │ Weight     │ Application Context                  │
├─────────────────┼───────────┼────────────┼──────────────────────────────────────┤
│ Display Hero    │ 32–36 px  │ ExtraBold  │ Login brand title & major headings   │
│ Section Title   │ 18–20 px  │ Bold       │ Page titles in TopNav & stat headers │
│ Activity Title  │ 15–16 px  │ SemiBold   │ Routine card titles (Workbook, Osho) │
│ Body & Prompts  │ 13–14 px  │ Regular    │ Instructions, exercise sets & reps   │
│ Meta / Timings  │ 11–12 px  │ Medium     │ Category labels, talk counts, notes  │
│ Micro Badges    │ 10–11 px  │ Bold       │ Percentage completion, session pills │
└─────────────────┴───────────┴────────────┴──────────────────────────────────────┘
```

- **Line Length Discipline:** Body text and instructions are capped at `max-w-[65ch]` to optimize reading ease.
- **Accessible Text Colors:** Primary text achieves **15.8:1** contrast on light surfaces and **17.2:1** on dark surfaces, exceeding WCAG AAA standards.

---

## 3. Screen-by-Screen Breakdown & Mockups

### 3.1 The Today Dashboard
- **Mockups:**
  - Light Desktop: [`mockup-dashboard-today-light.svg`](./mockup-dashboard-today-light.svg)
  - Dark Desktop: [`mockup-dashboard-today-dark.svg`](./mockup-dashboard-today-dark.svg)
  - Mobile Comparison: [`mockup-mobile-today-comparison.svg`](./mockup-mobile-today-comparison.svg)
- **Rhythm Progress Bar:** Replaces the generic full-width blue bar with an integrated rhythm card showing active streak days, completed/total count, and a calm, non-judgmental progress indicator.
- **Workbook Tracker Component:** Directly solves the brief's requirement for Norman Lewis *Word Power Made Easy*. Rather than a single checkbox, it displays:
  - Previous work revision verification badge.
  - Distinct session buttons: `Session 1` and `Session 2` with clear partial progress (0/2, 1/2, 2/2).
- **Movement Component:** Automatically adapts based on the current day of the week:
  - *Mon / Wed / Fri:* Shows the full workout structure (Warmup, Main sets, Cooldown) with sets, reps, and 1-minute rest cues.
  - *Tue / Thu / Sat:* Shows the 10–20 minute walk plus the 3 essential stretches.
  - *Sunday:* Renders a peaceful **Rest & Recovery Day** card with zero completion pressure, strictly excluded from penalty math.
- **Bedtime Reading Component:** Features an optional elapsed timer or quick mark-complete button with no rigid clock constraint.
- **Reflective Diary Component:** Private entry trigger offering the 5 structured self-inquiry prompts (*What happened? What did I feel? What assumption did I make? What did I learn? Small next step?*).

### 3.2 Routine Manager & Habit Editor
- **Mockup:** [`mockup-routine-manager.svg`](./mockup-routine-manager.svg)
- Organizes routines by **Life Area Categories** and **Timing Windows** rather than arbitrary list order.
- Clear metadata tags display recurrence (e.g. `M/W/F Workout`, `Daily`, `Before Bed`) and completion methods.
- Progressive disclosure modal separates core details (title, category, frequency) from advanced configurations (variations, safety notes, reminders).

### 3.3 Insights & Consistency Patterns
- **Mockup:** [`mockup-insights-analytics.svg`](./mockup-insights-analytics.svg)
- **Rest-Day Aware Calendar Heatmap:** Standardizes Sunday as an intentional recovery day. No broken streak penalty for planned rest.
- **Meaningful Practice Counts:** Highlights real self-cultivation metrics (e.g., 28 workbook sessions, 12 workouts, 24 reading blocks) rather than an obsessive, fragile unbroken streak number.

### 3.4 Clean Login & Onboarding
- **Mockup:** [`mockup-login-screen.svg`](./mockup-login-screen.svg)
- Replaces the AI pulsing glow with a clean, dignified vector mark and authoritative typography.
- Clearly states the product's values: Habit Architecture, Movement, Deep Listening, and Private Local-First storage.
