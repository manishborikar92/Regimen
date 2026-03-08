'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Today', Icon: Home },
  { href: '/habits', label: 'Habits', Icon: ClipboardList },
  { href: '/analytics', label: 'Analytics', Icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50"
      aria-label="Main navigation"
    >
      <div className="max-w-2xl mx-auto flex justify-around">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-3 px-6 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
