'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2, Compass, LineChart } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Today', Icon: CalendarCheck2 },
  { href: '/habits', label: 'Routine', Icon: Compass },
  { href: '/analytics', label: 'Insights', Icon: LineChart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-safe z-50"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto flex justify-around px-2 py-1.5">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-1.5 px-5 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-bold bg-indigo-50/70'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-2xs mt-1 tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
