'use client';

import { BRAND } from '@/lib/constants/brand';
import Logo from './Logo';

export default function LoadingSpinner({ size = 'md', message, className = '' }) {
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

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gray-50/85 backdrop-blur-sm z-[9999] ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        {/* Soft breathing halo */}
        <div className={`absolute ${ringSizes[size]} rounded-full border-2 border-indigo-400/20 animate-ping opacity-60`} />
        {/* Calm spinning outer ring */}
        <div className={`absolute ${ringSizes[size]} rounded-full border-2 border-transparent border-t-indigo-500/60 animate-spin`} />
        {/* White card carrying the Vritta logo */}
        <div className={`${sizeClasses[size]} bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center relative z-10`}>
          <Logo className="w-full h-full" />
        </div>
      </div>

      <div className="mt-6 text-center animate-pulse">
        <p className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-1">
          {BRAND.name}
        </p>
        <p className="text-xs text-indigo-600/80 font-medium tracking-wide">
          {message || 'Mindful Routine Companion'}
        </p>
      </div>
    </div>
  );
}