"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">IPMS</Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button onClick={() => logout()} className="text-sm text-red-600">Logout</button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-blue-600">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
