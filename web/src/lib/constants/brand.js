/**
 * Centralized Brand Configuration for Vritta.
 * Single source of truth for the app's display identity, typography, and theme tokens.
 *
 * Provisional brand name: Vritta (वृत्त)
 * Meaning: In Sanskrit, Vritta signifies conduct, rhythm, regular observance,
 * and the natural cyclical pattern of daily life. It embodies unhurried, mindful
 * self-cultivation without guilt or rigid deadlines.
 */

export const BRAND = {
  name: 'Vritta',
  tagline: 'Personal Routine Companion',
  shortDescription: 'A calm, flexible personal routine companion for mindful consistency.',
  logoAlt: 'Vritta Logo',
  author: 'Manish Borikar',
  themeColor: '#0F766E', // Restorative Juniper (Verdigris Teal)
  colors: {
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      500: '#14b8a6',
      600: '#0f766e',
      700: '#115e59',
    },
    accent: {
      juniper: '#0f766e',
      teal: '#14b8a6',
      amber: '#b45309',
      gold: '#f59e0b',
      emerald: '#059669',
      rose: '#e11d48',
    },
    surface: {
      canvas: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
      canvasDark: '#090d16',
      cardDark: '#111827',
      borderDark: '#1e293b',
    },
  },
};

