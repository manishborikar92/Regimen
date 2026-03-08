'use client';

import { Activity } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 16,
    md: 32,
    lg: 48,
  };

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-[9999] ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className={`absolute ${sizeClasses[size]} rounded-full border-4 border-indigo-500/20 animate-ping`}></div>
        {/* Fast spinning gradient border */}
        <div className={`absolute ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-indigo-600 animate-spin`}></div>
        {/* Inner solid circle background */}
        <div className={`${sizeClasses[size]} bg-white rounded-full shadow-lg flex items-center justify-center`}>
          <Activity className={`text-indigo-600 animate-pulse`} size={iconSizes[size]} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-8 text-center animate-pulse">
        <p className="text-sm font-semibold text-indigo-900 tracking-widest uppercase mb-1">Regimen</p>
        <p className="text-xs text-indigo-500/80 font-medium tracking-wider">Syncing Data</p>
      </div>
    </div>
  );
}