/**
 * Centralized Brand Configuration for Vritta.
 * Single source of truth for the app's display identity, typography, and theme tokens.
 *
 * Approved brand name: Vritta (वृत्त)
 * Meaning: In Sanskrit, Vritta signifies conduct, rhythm, regular observance,
 * and the natural cyclical pattern of daily life. It embodies unhurried, mindful
 * self-cultivation without guilt or rigid deadlines.
 */

export const BRAND = {
  name: 'Vritta',
  tagline: 'Personal Routine Companion',
  shortDescription: 'A calm, flexible personal routine companion for mindful consistency.',
  logoAlt: 'Vritta Logo: The Guiding Sutra',
  author: 'Manish Borikar',
  themeColor: '#14B8A6', // Authoritative Primary Brand Swatch: Luminous Teal

  // Authoritative Core Brand Swatches (Approved & Locked)
  brandColors: {
    deepObsidian: '#090D16', // Core Dark Foundation
    luminousTeal: '#14B8A6', // Signature Brand Identity & Dark-Mode Ribbon Loop
    warmAmber: '#D97706',    // Rhythm, Streak Milestones & Balance Dot
  },

  colors: {
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      500: '#14b8a6', // Core Luminous Teal
      600: '#0f766e', // Accessible Deep Teal (for light mode text/strokes)
      700: '#115e59',
    },
    accent: {
      obsidian: '#090d16',    // Authoritative Dark Foundation
      teal: '#14b8a6',        // Authoritative Brand Accent
      amber: '#d97706',       // Authoritative Warm Rhythm Swatch
      // Documented contrast-tested text variants for light surfaces:
      amberText: '#b45309',   // 4.80:1 on canvas (WCAG AA text >= 4.5:1)
      juniperText: '#0f766e', // 5.23:1 on canvas (WCAG AA text >= 4.5:1)
      emerald: '#059669',
      rose: '#e11d48',
    },
    surface: {
      canvas: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
      canvasDark: '#090d16',  // Deep Obsidian core swatch
      cardDark: '#111827',
      borderDark: '#1e293b',
    },
  },
};

