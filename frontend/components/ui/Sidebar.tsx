"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/auth-context';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const items = role === 'ADMIN' ? [
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/settings', label: 'Settings' },
  ] : role === 'SUPERVISOR' ? [
    { href: '/supervisor/projects', label: 'Projects' },
    { href: '/supervisor/reviews', label: 'Reviews' },
    { href: '/supervisor/discussions', label: 'Discussions' },
    { href: '/supervisor/settings', label: 'Settings' },
  ] : [
    { href: '/student/projects', label: 'Projects' },
    { href: '/student/submissions', label: 'Submissions' },
    { href: '/student/discussions', label: 'Discussions' },
    { href: '/student/settings', label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-600">{role?.toLowerCase()}</div>
        <nav className="flex flex-col gap-2">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="px-3 py-2 rounded hover:bg-gray-100">{it.label}</Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
