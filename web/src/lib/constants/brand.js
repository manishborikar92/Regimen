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
  themeColor: '#4f46e5', // Warm Indigo
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
    },
    accent: {
      teal: '#0d9488',
      amber: '#d97706',
      emerald: '#059669',
      rose: '#e11d48',
    },
    surface: {
      bg: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
    },
  },
};
