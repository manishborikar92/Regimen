import { CalendarCheck2, Compass, LineChart } from 'lucide-react';

export const NAV_ITEMS = Object.freeze([
  { href: '/dashboard', label: 'Today', Icon: CalendarCheck2 },
  { href: '/habits', label: 'Routine', Icon: Compass },
  { href: '/analytics', label: 'Insights', Icon: LineChart },
]);

/** A tab is active for its own route and any nested route (/habits/123). */
export const isRouteActive = (pathname, href) =>
  pathname === href || Boolean(pathname?.startsWith(`${href}/`));
