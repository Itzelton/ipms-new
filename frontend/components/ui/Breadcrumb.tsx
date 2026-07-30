"use client";
import React from 'react';
import Link from 'next/link';

export type Crumb = { label: string; href?: string };

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px]" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="font-medium text-slate-400 no-underline hover:text-slate-600 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-slate-700' : 'font-medium text-slate-400'}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
