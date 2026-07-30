"use client";
import React from 'react';

export type SortOption = { value: string; label: string };

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusOptions?: { value: string; label: string }[];
  activeStatus: string;
  onStatus: (v: string) => void;
  sortOptions?: SortOption[];
  activeSort: string;
  onSort: (v: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export default function FilterBar({
  search,
  onSearch,
  statusOptions = [],
  activeStatus,
  onStatus,
  sortOptions = [],
  activeSort,
  onSort,
  resultCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Status pills */}
        {statusOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatus(activeStatus === opt.value ? '' : opt.value)}
                className={[
                  'rounded-full px-3 py-1 text-[11px] font-semibold transition',
                  activeStatus === opt.value
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Sort */}
        {sortOptions.length > 0 && (
          <select
            value={activeSort}
            onChange={(e) => onSort(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-[12px] font-medium text-slate-600 focus:border-sky-400 focus:outline-none"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Result count */}
      {resultCount !== undefined && totalCount !== undefined && (
        <p className="mt-2.5 text-[11px] text-slate-400">
          Showing <span className="font-semibold text-slate-600">{resultCount}</span> of <span className="font-semibold text-slate-600">{totalCount}</span> results
        </p>
      )}
    </div>
  );
}
