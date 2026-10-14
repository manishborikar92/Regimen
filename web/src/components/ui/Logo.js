'use client';

/**
 * Reusable Vritta Logo component.
 * Renders the concentric cycle mark:
 * - Outer rhythmic violet-indigo arc (guided routine progression)
 * - Inner harmonious cyan-azure arc (mindful awareness)
 * - Central anchor seed (calm daily consistency)
 */
export default function Logo({ className = "w-8 h-8", title = "Vritta Logo" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-label={title}
      role="img"
    >
      <defs>
        <linearGradient id="vrittaPurpleGrad" x1="20%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#7279f5" />
          <stop offset="100%" stopColor="#5550e9" />
        </linearGradient>
        <linearGradient id="vrittaCyanGrad" x1="25%" y1="25%" x2="75%" y2="75%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {/* Outer rhythmic purple arc */}
      <path
        d="M 50.05 9.92 A 40.13 40.13 0 1 1 16.02 28.78"
        stroke="url(#vrittaPurpleGrad)"
        strokeWidth="7.83"
        strokeLinecap="round"
      />
      {/* Inner harmonious cyan arc */}
      <path
        d="M 64.70 32.40 A 24.54 24.54 0 1 1 47.65 25.51"
        stroke="url(#vrittaCyanGrad)"
        strokeWidth="6.79"
        strokeLinecap="round"
      />
      {/* Central calm anchor seed */}
      <circle
        cx="48.43"
        cy="50.00"
        r="9.14"
        fill="#5550e9"
      />
    </svg>
  );
}
