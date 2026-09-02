import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {children}
    </div>
  );
}
