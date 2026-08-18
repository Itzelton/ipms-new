"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppShell from '../../components/ui/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';

function FloatingAIButton() {
  const pathname = usePathname();
  if (pathname === '/student/assistant') return null;
  return (
    <Link
      href="/student/assistant"
      className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200/60 transition-all hover:scale-105 hover:shadow-violet-300/70"
      style={{ height: '52px', width: '52px' }}
      aria-label="Open AI Assistant"
      title="AI Assistant"
    >
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </Link>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["STUDENT"]}>
      <AppShell>{children}</AppShell>
      <FloatingAIButton />
    </ProtectedRoute>
  );
}
