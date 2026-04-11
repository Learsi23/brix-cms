'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function BannerBlock({ data }: { data: BlockData }) {
  const icon = getFieldValue(data, 'Icon', '🎉');
  const text = getFieldValue(data, 'Text', '');
  const linkText = getFieldValue(data, 'LinkText', '');
  const linkUrl = getFieldValue(data, 'LinkUrl', '#');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#1f2937');
  const textColor = getFieldValue(data, 'TextColor', '#ffffff');
  const closeable = getFieldValue(data, 'Closeable', 'true') === 'true';

  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  // Determine if icon is a FontAwesome class or an emoji
  const isFaClass = icon.startsWith('fa');

  return (
    <div
      className="relative flex items-center justify-center gap-3 px-6 py-3 text-sm font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Icon */}
      {icon && (
        isFaClass
          ? <i className={`${icon} flex-shrink-0`} />
          : <span className="flex-shrink-0">{icon}</span>
      )}

      {/* Message */}
      <span>{text}</span>

      {/* Link */}
      {linkText && linkUrl && (
        <Link
          href={linkUrl}
          className="underline underline-offset-2 font-bold hover:opacity-80 transition-opacity flex-shrink-0"
          style={{ color: textColor }}
        >
          {linkText}
        </Link>
      )}

      {/* Dismiss button */}
      {closeable && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
          style={{ color: textColor }}
        >
          <i className="fas fa-times text-xs" />
        </button>
      )}
    </div>
  );
}
