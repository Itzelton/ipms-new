"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '../../services/api';
import { useAuth } from '../auth/auth-context';

type Result = {
  id: string;
  label: string;
  sub?: string;
  href: string;
  type: 'project' | 'submission' | 'page';
};

const STATIC_PAGES: Record<string, Result[]> = {
  STUDENT: [
    { id: 's-dash',  label: 'Dashboard',   type: 'page', href: '/student' },
    { id: 's-proj',  label: 'Projects',    type: 'page', href: '/student/projects' },
    { id: 's-sub',   label: 'Submissions', type: 'page', href: '/student/submissions' },
    { id: 's-disc',  label: 'Discussions', type: 'page', href: '/student/discussions' },
    { id: 's-set',   label: 'Settings',    type: 'page', href: '/student/settings' },
  ],
  SUPERVISOR: [
    { id: 'sv-dash', label: 'Dashboard',   type: 'page', href: '/supervisor' },
    { id: 'sv-proj', label: 'Projects',    type: 'page', href: '/supervisor/projects' },
    { id: 'sv-rev',  label: 'Reviews',     type: 'page', href: '/supervisor/reviews' },
    { id: 'sv-disc', label: 'Discussions', type: 'page', href: '/supervisor/discussions' },
    { id: 'sv-set',  label: 'Settings',    type: 'page', href: '/supervisor/settings' },
  ],
  ADMIN: [
    { id: 'a-dash',  label: 'Dashboard', type: 'page', href: '/admin' },
    { id: 'a-users', label: 'Users',     type: 'page', href: '/admin/users' },
    { id: 'a-proj',  label: 'Projects',  type: 'page', href: '/admin/projects' },
    { id: 'a-rep',   label: 'Reports',   type: 'page', href: '/admin/reports' },
    { id: 'a-set',   label: 'Settings',  type: 'page', href: '/admin/settings' },
  ],
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  project: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  submission: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  page: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
};

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [allResults, setAllResults] = useState<Result[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [cursor, setCursor] = useState(0);

  // Load projects + submissions once when palette opens
  useEffect(() => {
    if (!open || !user) return;
    setLoadingData(true);
    const role = user.role ?? 'STUDENT';
    const projectHref = (id: string) =>
      role === 'SUPERVISOR' ? `/supervisor/projects/${id}` :
      role === 'ADMIN'      ? `/admin/projects/${id}` :
      `/student/projects/${id}`;

    Promise.allSettled([apiGet('/projects'), apiGet('/submissions')]).then(([pRes, sRes]) => {
      const results: Result[] = [];
      if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) {
        pRes.value.forEach((p: any) => {
          results.push({ id: `p-${p.id}`, label: p.title, sub: p.status?.replace(/_/g, ' '), href: projectHref(p.id), type: 'project' });
        });
      }
      if (sRes.status === 'fulfilled' && Array.isArray(sRes.value)) {
        sRes.value.forEach((s: any) => {
          results.push({ id: `s-${s.id}`, label: s.metadata?.title || `Submission ${s.id.slice(0, 6)}`, sub: s.status?.replace(/_/g, ' '), href: role === 'STUDENT' ? '/student/submissions' : '/supervisor/reviews', type: 'submission' });
        });
      }
      setAllResults(results);
    }).finally(() => setLoadingData(false));
  }, [open, user]);

  // Focus input when palette opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setCursor(0);
    }
  }, [open]);

  const q = query.toLowerCase().trim();
  const staticPages = STATIC_PAGES[user?.role ?? 'STUDENT'] ?? [];
  const filtered: Result[] = q.length < 1
    ? staticPages
    : [
        ...staticPages.filter((p) => p.label.toLowerCase().includes(q)),
        ...allResults.filter((r) => r.label.toLowerCase().includes(q) || r.sub?.toLowerCase().includes(q)),
      ];

  const navigate = useCallback((href: string) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  useEffect(() => { setCursor(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown')  { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && filtered[cursor]) navigate(filtered[cursor].href);
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, cursor, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[15vh]"
      style={{ background: 'rgba(15,23,42,0.40)', backdropFilter: 'blur(4px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.98)',
          border: '1px solid rgba(226,232,240,0.80)',
          boxShadow: '0 24px 80px rgba(15,23,42,0.22)',
        }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <svg className="h-5 w-5 flex-shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, projects, submissions…"
            className="flex-1 bg-transparent text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <kbd className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400 sm:inline">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto py-2">
          {loadingData && !allResults.length && q ? (
            <div className="px-4 py-6 text-center text-[13px] text-slate-400">Searching…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-slate-400">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            <>
              {!q && <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Quick navigation</p>}
              {q && <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>}
              <ul>
                {filtered.map((r, i) => (
                  <li key={r.id}>
                    <button
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => navigate(r.href)}
                      className={[
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        i === cursor ? 'bg-sky-50' : 'hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <span className={i === cursor ? 'text-sky-500' : 'text-slate-400'}>
                        {TYPE_ICON[r.type]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-slate-800">{r.label}</p>
                        {r.sub && <p className="text-[11px] text-slate-400">{r.sub}</p>}
                      </div>
                      <span className="flex-shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-500">
                        {r.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400">
          <span><kbd className="mr-0.5 rounded border border-slate-200 bg-slate-50 px-1 text-[10px]">↑↓</kbd> navigate</span>
          <span><kbd className="mr-0.5 rounded border border-slate-200 bg-slate-50 px-1 text-[10px]">↵</kbd> open</span>
          <span><kbd className="mr-0.5 rounded border border-slate-200 bg-slate-50 px-1 text-[10px]">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
