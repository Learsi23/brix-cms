import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import Link from 'next/link';

export default function CardBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#1f2937');
  const titleSize = getFieldValue(data, 'TitleSize', '1.5rem');
  const badge = getFieldValue(data, 'Badge');
  const badgeColor = getFieldValue(data, 'BadgeColor', '#4b5563');
  const badgeSize = getFieldValue(data, 'BadgeSize', '0.875rem');
  const description = getFieldValue(data, 'Description');
  const descriptionColor = getFieldValue(data, 'DescriptionColor', '#4b5563');
  const descriptionSize = getFieldValue(data, 'DescriptionSize', '0.875rem');
  const image = getFieldValue(data, 'Image');
  const imageHeight = getFieldValue(data, 'ImageHeight', '250px');
  const iconClass = getFieldValue(data, 'IconClass');
  const targetUrl = getFieldValue(data, 'TargetUrl');
  const buttonText = getFieldValue(data, 'ButtonText', 'Learn more');
  const accentColor = getFieldValue(data, 'AccentColor', '#3b82f6');
  const buttonTextColor = getFieldValue(data, 'ButtonTextColor', '#ffffff');
  const borderRadius = getFieldValue(data, 'BorderRadius', '0.75rem');
  const border = getFieldValue(data, 'Border');
  const padding = getFieldValue(data, 'Padding', '1.5rem');
  const buttonPosition = getFieldValue(data, 'ButtonPosition', 'left');
  const layoutType = getFieldValue(data, 'LayoutType', 'vertical');
  const useGlass = getFieldValue(data, 'UseGlassmorphism', 'No') === 'Yes';
  const cardBgColor = getFieldValue(data, 'CardBgColor', '#ffffff');

  const glassStyles = useGlass ? {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  } : {};

  const cardStyle: React.CSSProperties = {
    backgroundColor: useGlass ? undefined : cardBgColor,
    borderRadius,
    border: border || undefined,
    padding,
    overflow: 'hidden',
    ...glassStyles,
  };

  const btnAlignClass: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const buttonContent = targetUrl && buttonText ? (
    <div className={`mt-4 ${btnAlignClass[buttonPosition] ?? 'text-left'}`}>
      <Link
        href={targetUrl}
        style={{ backgroundColor: accentColor, color: buttonTextColor, borderRadius }}
        className="inline-block px-5 py-2 font-semibold text-sm transition-opacity hover:opacity-80"
      >
        {buttonText}
      </Link>
    </div>
  ) : null;

  if (layoutType === 'horizontal') {
    return (
      <div style={cardStyle} className="flex items-start gap-4">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title ?? ''} style={{ width: imageHeight, height: imageHeight, objectFit: 'cover', borderRadius }} />
        )}
        {iconClass && !image && (
          <i className={iconClass} style={{ fontSize: '2.5rem', color: accentColor }} />
        )}
        <div className="flex-1">
          {badge && <p style={{ color: badgeColor, fontSize: badgeSize }} className="font-semibold mb-1">{badge}</p>}
          {title && <h3 style={{ color: titleColor, fontSize: titleSize }} className="font-bold mb-2">{title}</h3>}
          {description && <p style={{ color: descriptionColor, fontSize: descriptionSize }}>{description}</p>}
          {buttonContent}
        </div>
      </div>
    );
  }

  if (layoutType === 'overlay' && image) {
    return (
      <div style={{ borderRadius, overflow: 'hidden', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title ?? ''} style={{ width: '100%', height: imageHeight, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', padding, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {badge && <p style={{ color: '#fff', fontSize: badgeSize }} className="font-semibold mb-1">{badge}</p>}
          {title && <h3 style={{ color: '#fff', fontSize: titleSize }} className="font-bold mb-2">{title}</h3>}
          {description && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: descriptionSize }}>{description}</p>}
          {buttonContent}
        </div>
      </div>
    );
  }

  // Default: vertical
  return (
    <div style={cardStyle}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={title ?? ''} style={{ width: '100%', height: imageHeight, objectFit: 'cover', marginBottom: '1rem', borderRadius }} />
      )}
      {iconClass && !image && (
        <div className="mb-3">
          <i className={iconClass} style={{ fontSize: '2.5rem', color: accentColor }} />
        </div>
      )}
      {badge && <p style={{ color: badgeColor, fontSize: badgeSize }} className="font-semibold mb-1">{badge}</p>}
      {title && <h3 style={{ color: titleColor, fontSize: titleSize }} className="font-bold mb-2">{title}</h3>}
      {description && <p style={{ color: descriptionColor, fontSize: descriptionSize }}>{description}</p>}
      {buttonContent}
    </div>
  );
}
