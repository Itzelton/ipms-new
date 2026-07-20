"use client";
import React, { useState, useRef } from 'react';

export const AVATARS = [
  { id: 'av-1',  gradient: 'from-sky-400 to-blue-600' },
  { id: 'av-2',  gradient: 'from-violet-500 to-purple-700' },
  { id: 'av-3',  gradient: 'from-rose-400 to-pink-600' },
  { id: 'av-4',  gradient: 'from-emerald-400 to-green-600' },
  { id: 'av-5',  gradient: 'from-amber-400 to-orange-500' },
  { id: 'av-6',  gradient: 'from-cyan-400 to-teal-600' },
  { id: 'av-7',  gradient: 'from-indigo-500 to-blue-700' },
  { id: 'av-8',  gradient: 'from-fuchsia-500 to-pink-700' },
  { id: 'av-9',  gradient: 'from-red-400 to-orange-600' },
  { id: 'av-10', gradient: 'from-lime-400 to-green-500' },
  { id: 'av-11', gradient: 'from-blue-500 to-indigo-700' },
  { id: 'av-12', gradient: 'from-teal-400 to-cyan-600' },
];

type Props = {
  currentAvatar: string;
  customUrl: string | null;
  initials: string;
  onSelect: (avatarId: string) => void;
  onUpload: (url: string) => void;
};

export default function AvatarSelector({ currentAvatar, customUrl, initials, onSelect, onUpload }: Props) {
  const [tab, setTab] = useState<'avatars' | 'upload'>('avatars');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden mt-1"
      style={{ background: 'rgba(248,250,252,0.90)', border: '1px solid rgba(226,232,240,0.70)' }}
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-100/80">
        {(['avatars', 'upload'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2.5 text-[12px] font-semibold transition-colors',
              tab === t
                ? 'text-sky-600 border-b-2 border-sky-500 -mb-px bg-white/70'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {t === 'avatars' ? 'Choose Avatar' : 'Upload Photo'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'avatars' ? (
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => onSelect(av.id)}
                title={av.id}
                className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${av.gradient} transition-transform hover:scale-110`}
                style={
                  currentAvatar === av.id
                    ? { boxShadow: '0 0 0 3px #fff, 0 0 0 5px #0ea5e9' }
                    : { boxShadow: '0 2px 8px rgba(0,0,0,0.14)' }
                }
              >
                <span className="text-sm font-bold text-white">{initials}</span>
                {currentAvatar === av.id && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 ring-1 ring-white">
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className={[
                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
                dragging
                  ? 'border-sky-400 bg-sky-50'
                  : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/40',
              ].join(' ')}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-[13px] font-medium text-slate-700">
                {dragging ? 'Drop to upload' : 'Click or drag a photo here'}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">JPG, PNG, WEBP · up to 4 MB</p>
            </div>

            {customUrl && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2.5 border border-slate-100">
                <img src={customUrl} alt="Preview" className="h-10 w-10 rounded-full object-cover ring-2 ring-sky-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700">Custom photo selected</p>
                  <p className="text-[11px] text-slate-400">Save your profile to apply</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpload(''); }}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
