'use client';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const dotSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} relative`}>
          {/* Main spinner ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse opacity-20"></div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${dotSizes[size]} rounded-full bg-blue-500 animate-ping`}></div>
            <div className={`${dotSizes[size]} rounded-full bg-blue-600 absolute`}></div>
          </div>
        </div>

        {/* Orbiting dots */}
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-spin`} style={{ animationDuration: '3s' }}>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${dotSizes[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg`}></div>
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-spin`} style={{ animationDuration: '3s', animationDelay: '-1s' }}>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${dotSizes[size]} rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg`}></div>
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-spin`} style={{ animationDuration: '3s', animationDelay: '-2s' }}>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${dotSizes[size]} rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg`}></div>
        </div>

        {/* Glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-blue-400 opacity-20 blur-xl animate-pulse`}></div>
      </div>

      {/* Loading text */}
      <div className="absolute mt-32 text-center">
        <p className="text-gray-600 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}