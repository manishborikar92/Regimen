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
      className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-subtle/90 pb-safe z-50 transition-colors"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto flex justify-around px-2 py-1.5">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-4 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-medium'
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
