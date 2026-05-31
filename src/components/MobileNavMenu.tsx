'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface FlatEntry {
  url: string;
  text: string;
}

export default function MobileNavMenu({
  entries,
  textColor,
}: {
  entries: FlatEntry[];
  textColor: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden p-2 rounded-lg hover:opacity-75 transition-opacity"
        style={{ color: textColor }}
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="md:hidden absolute top-full left-0 right-0 z-50 border-t shadow-lg"
          style={{ backgroundColor: 'inherit', borderColor: textColor + '22' }}
        >
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {entries.length === 0 && (
              <span className="block py-2 px-2 text-sm opacity-60" style={{ color: textColor }}>
                No menu items
              </span>
            )}
            {entries.map((entry, i) => (
              <Link
                key={i}
                href={entry.url}
                onClick={() => setOpen(false)}
                className="block py-2 px-2 rounded hover:opacity-75 transition-opacity"
                style={{ color: textColor }}
              >
                {entry.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
