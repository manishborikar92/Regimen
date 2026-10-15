'use client';

import { BRAND } from '@/lib/constants/brand';
import Logo from './Logo';

/**
 * LoadingSpinner — Brand-aligned loading indicator for auth splash and global states.
 *
 * Implements:
 * - Configurable fullscreen overlay (z-50) or inline bounded container
 * - Strict reduced-motion support: motion-safe animations with calm motion-reduce fallbacks
 * - Brand design system token integration
 */
export default function LoadingSpinner({ size = 'md', message, className = '', fullscreen = true }) {
  const sizeClasses = {
    sm: 'w-10 h-10 p-2',
    md: 'w-16 h-16 p-3',
    lg: 'w-24 h-24 p-4',
  };

  const ringSizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const containerClasses = fullscreen
    ? `fixed inset-0 flex flex-col items-center justify-center bg-canvas/90 backdrop-blur-sm z-50 ${className}`
    : `flex flex-col items-center justify-center py-12 ${className}`;

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        {/* Soft breathing halo with reduced-motion fallback */}
        <div
          className={`absolute ${ringSizes[size]} rounded-full border-2 border-teal-400/20 dark:border-teal-400/30 motion-safe:animate-ping motion-reduce:opacity-30 motion-reduce:scale-100 opacity-60`}
        />
        {/* Calm spinning outer ring with reduced-motion fallback */}
        <div
          className={`absolute ${ringSizes[size]} rounded-full border-2 border-transparent border-t-teal-500/70 dark:border-t-teal-400/80 motion-safe:animate-spin motion-reduce:border-t-teal-500/40`}
        />
        {/* Surface card carrying the Vritta logo */}
        <div className={`${sizeClasses[size]} bg-surface rounded-2xl shadow-md border border-subtle flex items-center justify-center relative z-10`}>
          <Logo className="w-full h-full" />
        </div>
      </div>

      <div className="mt-6 text-center motion-safe:animate-pulse motion-reduce:animate-none">
        <p className="text-sm font-bold text-main tracking-wider uppercase mb-1">
          {BRAND.name}
        </p>
        <p className="text-xs text-teal-700 dark:text-teal-400 font-medium tracking-wide">
          {message || 'Mindful Routine Companion'}
        </p>
      </div>
    </div>
  );
}