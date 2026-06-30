"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/auth-context';
import { useSidebar } from './SidebarContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle sidebar menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            IPMS
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-700">
          {user ? (
            <>
              <div className="rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-800">
                {user.email}
              </div>
              <button
                onClick={() => logout()}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-slate-100 px-3 py-2 text-slate-900 transition hover:bg-slate-200">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
