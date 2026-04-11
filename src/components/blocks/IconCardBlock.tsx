'use client';

import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import Link from 'next/link';

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(?!<[h|l])(.+)$/gm, '<p class="mb-3">$1</p>');
}

export default function IconCardBlock({ data }: { data: BlockData }) {
  const backgroundColor = getFieldValue(data, 'BackgroundColor');
  const borderColor = getFieldValue(data, 'BorderColor');
  const borderRadius = getFieldValue(data, 'BorderRadius', '0.5rem');
  const borderWidth = getFieldValue(data, 'BorderWidth');
  const padding = getFieldValue(data, 'Padding', '1.5rem');
  const shadow = getFieldValue(data, 'Shadow');

  const iconPosition = getFieldValue(data, 'IconPosition', 'left');
  const textAlign = getFieldValue(data, 'TextAlign', 'left');

  const leftIcon = getFieldValue(data, 'LeftIcon');
  const leftIconSize = getFieldValue(data, 'LeftIconSize', '48px');
  const leftIconClass = getFieldValue(data, 'LeftIconClass');
  const leftIconColor = getFieldValue(data, 'LeftIconColor');
  const leftIconFaSize = getFieldValue(data, 'LeftIconFaSize', '2rem');

  const rightIcon = getFieldValue(data, 'RightIcon');
  const rightIconSize = getFieldValue(data, 'RightIconSize', '32px');
  const rightIconClass = getFieldValue(data, 'RightIconClass');
  const rightIconColor = getFieldValue(data, 'RightIconColor');

  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#1f2937');
  const titleSize = getFieldValue(data, 'TitleSize', '1.25rem');

  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', '#6b7280');
  const subtitleSize = getFieldValue(data, 'SubtitleSize', '1rem');

  const text = getFieldValue(data, 'Text');
  const textColor = getFieldValue(data, 'TextColor', '#374151');
  const textSize = getFieldValue(data, 'TextSize', '0.875rem');

  const markdown = getFieldValue(data, 'MarkDown');
  const markdownColor = getFieldValue(data, 'MarkDownColor', '#374151');

  const linkUrl = getFieldValue(data, 'LinkUrl');
  const linkText = getFieldValue(data, 'LinkText');
  const linkBgColor = getFieldValue(data, 'LinkBgColor');
  const linkTextColor = getFieldValue(data, 'LinkTextColor');
  const linkNewTab = getFieldValue(data, 'LinkNewTab', 'false') === 'true';

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || undefined,
    border: borderWidth && borderColor ? `${borderWidth} solid ${borderColor}` : borderColor ? `1px solid ${borderColor}` : undefined,
    borderRadius,
    padding,
    boxShadow: shadow || undefined,
    textAlign: textAlign as 'left' | 'center' | 'right',
  };

  const renderLeftIcon = () => {
    if (leftIcon) {
      return (
        <img 
          src={leftIcon} 
          alt="Left icon" 
          style={{ width: leftIconSize, height: leftIconSize }}
          className="object-contain"
        />
      );
    }
    if (leftIconClass) {
      return (
        <i 
          className={leftIconClass} 
          style={{ 
            color: leftIconColor || undefined, 
            fontSize: leftIconFaSize 
          }} 
        />
      );
    }
    return null;
  };

  const renderRightIcon = () => {
    if (rightIcon) {
      return (
        <img 
          src={rightIcon} 
          alt="Right icon" 
          style={{ width: rightIconSize, height: rightIconSize }}
          className="object-contain"
        />
      );
    }
    if (rightIconClass) {
      return (
        <i 
          className={rightIconClass} 
          style={{ 
            color: rightIconColor || undefined, 
            fontSize: rightIconSize 
          }} 
        />
      );
    }
    return null;
  };

  const renderContent = () => (
    <>
      {title && (
        <h3 style={{ color: titleColor, fontSize: titleSize }} className="font-bold mb-1">
          {title}
        </h3>
      )}

      {subtitle && (
        <p style={{ color: subtitleColor, fontSize: subtitleSize }} className="mb-2">
          {subtitle}
        </p>
      )}

      {text && (
        <p style={{ color: textColor, fontSize: textSize }} className="leading-relaxed mb-2">
          {text}
        </p>
      )}

      {markdown && (
        <div
          style={{ color: markdownColor }}
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
        />
      )}

      {linkUrl && linkText && (
        <Link
          href={linkUrl}
          target={linkNewTab ? '_blank' : undefined}
          rel={linkNewTab ? 'noopener noreferrer' : undefined}
          style={{
            display: 'inline-block',
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            backgroundColor: linkBgColor || undefined,
            color: linkTextColor || undefined,
            borderRadius: borderRadius,
            textDecoration: 'none',
            fontWeight: 500,
          }}
          className="inline-block mt-3 px-4 py-2 rounded-lg transition hover:opacity-90"
        >
          {linkText}
        </Link>
      )}
    </>
  );

  if (iconPosition === 'top') {
    return (
      <div style={cardStyle} className="flex flex-col items-center text-center">
        {renderLeftIcon() && (
          <div className="mb-3 flex justify-center">
            {renderLeftIcon()}
          </div>
        )}
        {renderContent()}
        {renderRightIcon() && (
          <div className="mt-3">
            {renderRightIcon()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div className="flex items-start">
        {(iconPosition === 'left' || !iconPosition) && renderLeftIcon() && (
          <div className="mr-4 flex-shrink-0">
            {renderLeftIcon()}
          </div>
        )}
        <div className="flex-1">
          {renderContent()}
        </div>
        {iconPosition === 'right' && renderRightIcon() && (
          <div className="ml-4 flex-shrink-0">
            {renderRightIcon()}
          </div>
        )}
      </div>
    </div>
  );
}
