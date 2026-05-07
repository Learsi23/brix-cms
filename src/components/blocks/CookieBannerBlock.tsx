'use client';

import { useState, useEffect } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface CookieBannerBlockProps {
  data: BlockData;
}

export default function CookieBannerBlock({ data }: CookieBannerBlockProps) {
  const position = getFieldValue(data, 'position', 'bottom') as 'bottom' | 'top' | 'bottom-left' | 'bottom-right';
  const bgColor = getFieldValue(data, 'backgroundColor', '#1f2937');
  const textColor = getFieldValue(data, 'textColor', '#ffffff');
  const title = getFieldValue(data, 'title', 'We use cookies');
  const message = getFieldValue(data, 'message', 'We use cookies to enhance your browsing experience and analyze our traffic.');
  const privacyUrl = getFieldValue(data, 'privacyPolicyUrl', '');
  const acceptText = getFieldValue(data, 'acceptButtonText', 'Accept All');
  const declineText = getFieldValue(data, 'declineButtonText', 'Decline');
  const acceptColor = getFieldValue(data, 'acceptButtonColor', '#10b981');
  const declineColor = getFieldValue(data, 'declineButtonColor', '#6b7280');
  const btnTextColor = getFieldValue(data, 'buttonTextColor', '#ffffff');
  const borderRadius = getFieldValue(data, 'borderRadius', '8px');
  const width = getFieldValue(data, 'width', '100%');
  const padding = getFieldValue(data, 'padding', '16px');
  const zIndex = getFieldValue(data, 'zIndex', '9999');

  const STORAGE_KEY = 'brix_cookie_consent';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }
  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  const posStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: Number(zIndex),
    ...(position === 'bottom' && { bottom: 0, left: 0, right: 0 }),
    ...(position === 'top' && { top: 0, left: 0, right: 0 }),
    ...(position === 'bottom-left' && { bottom: '1rem', left: '1rem', width: '360px', maxWidth: '95vw' }),
    ...(position === 'bottom-right' && { bottom: '1rem', right: '1rem', width: '360px', maxWidth: '95vw' }),
  };

  return (
    <div
      style={{
        ...posStyle,
        backgroundColor: bgColor,
        color: textColor,
        padding,
        borderRadius: position === 'bottom' || position === 'top' ? '0' : borderRadius,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          {title && <p className="font-bold text-sm mb-1">{title}</p>}
          <div
            className="text-xs opacity-80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message }}
          />
          {privacyUrl && (
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline opacity-70 mt-1 inline-block">
              Privacy Policy
            </a>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            style={{ backgroundColor: declineColor, color: btnTextColor, borderRadius }}
            className="px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
          >
            {declineText}
          </button>
          <button
            onClick={accept}
            style={{ backgroundColor: acceptColor, color: btnTextColor, borderRadius }}
            className="px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
}
