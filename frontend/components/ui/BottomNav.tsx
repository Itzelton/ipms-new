"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/auth-context';
import { useSidebar } from './SidebarContext';
import { useSettings } from '../../contexts/SettingsContext';
import { navItems, exactHrefs } from './navConfig';

// Show 4 primary tabs + "More" (opens sidebar drawer for the rest)
const VISIBLE_TABS = 4;

export default function BottomNav() {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { resolvedTheme } = useSettings();
  const pathname = usePathname();
  const isDark = resolvedTheme === 'dark';

  if (!user) return null;

  const role = user.role as string;
  const allItems = navItems[role] ?? navItems.STUDENT;
  const tabItems = allItems.slice(0, VISIBLE_TABS);
  const hasMore = allItems.length > VISIBLE_TABS;

  const tabCount = tabItems.length + (hasMore ? 1 : 0);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch"
      style={{
        background: isDark
          ? 'rgba(22, 27, 39, 0.97)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(226,232,240,0.65)',
        boxShadow: isDark
          ? '0 -4px 24px rgba(0,0,0,0.35)'
          : '0 -4px 24px rgba(15,23,42,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabItems.map((item) => {
        const active = exactHrefs.has(item.href)
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center justify-center gap-1 py-2.5 no-underline transition-colors"
            style={{ flex: `1 1 ${100 / tabCount}%` }}
          >
            {/* Active indicator bar at top */}
            {active && (
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-b-full ${
                  isDark ? 'bg-sky-400' : 'bg-sky-500'
                }`}
              />
            )}

            <span
              className={`transition-colors ${
                active
                  ? isDark ? 'text-sky-400' : 'text-sky-600'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-medium leading-tight transition-colors ${
                active
                  ? isDark ? 'text-sky-400' : 'text-sky-600'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* More → opens sidebar drawer */}
      {hasMore && (
        <button
          onClick={toggle}
          className="relative flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
          style={{ flex: `1 1 ${100 / tabCount}%` }}
          aria-label="More navigation options"
        >
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
            {/* Three-dots (ellipsis) icon */}
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="19" cy="12" r="1.75" />
            </svg>
          </span>
          <span
            className={`text-[10px] font-medium leading-tight ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            More
          </span>
        </button>
      )}
    </nav>
  );
}
