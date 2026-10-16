'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2, Compass, LineChart } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';

const navItems = [
  { href: '/dashboard', label: 'Today', Icon: CalendarCheck2 },
  { href: '/habits', label: 'Routine', Icon: Compass },
  { href: '/analytics', label: 'Insights', Icon: LineChart },
];

// Match the section, not just the exact URL, so /habits/123 still highlights "Routine"
const isRouteActive = (pathname, href) =>
  pathname === href || pathname?.startsWith(`${href}/`);

export default function BottomNav() {
  const pathname = usePathname();
  // Guard against a missing provider so the nav never crashes the page
  const { playTabSwitchCue } = useSound() ?? {};

  const handleNavClick = (href) => {
    if (!isRouteActive(pathname, href)) {
      playTabSwitchCue?.();
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-subtle/90 z-50 transition-colors"
      // Real CSS instead of the custom `pb-safe` class (silently does nothing if undefined).
      // Requires <meta viewport ... viewport-fit=cover> / Next `viewport.viewportFit = 'cover'`.
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      {/* max-w-2xl matches the TopNav container so both bars align on tablet/desktop */}
      <ul className="max-w-2xl mx-auto flex items-stretch gap-1 px-2 py-1.5">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = isRouteActive(pathname, href);
          return (
            <li key={href} className="flex-1 min-w-0">
              <Link
                href={href}
                onClick={() => handleNavClick(href)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center w-full min-h-[52px] py-1.5 px-2 rounded-xl transition-colors motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isActive
                    ? 'text-accent bg-accent-subtle/40'
                    : 'text-muted hover:text-main hover:bg-surface-subtle'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`}
                  aria-hidden="true"
                />
                {/* constant weight: switching bold/medium changed the label width and made the bar jitter */}
                <span className="text-2xs font-semibold mt-1 tracking-tight truncate max-w-full">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}