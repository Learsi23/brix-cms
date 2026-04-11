import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function TextWithButtonBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize = getFieldValue(data, 'TitleSize');

  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', '#000000');
  const subtitleSize = getFieldValue(data, 'SubtitleSize');

  const description = getFieldValue(data, 'Description');
  const descriptionColor = getFieldValue(data, 'DescriptionColor', '#333333');
  const descriptionSize = getFieldValue(data, 'DescriptionSize');

  const buttonText = getFieldValue(data, 'ButtonText');
  const buttonUrl = getFieldValue(data, 'ButtonUrl', '#');
  const buttonColor = getFieldValue(data, 'ButtonColor', '#10b981');
  const buttonHoverColor = getFieldValue(data, 'ButtonHoverColor', '#059669');
  const buttonRadius = getFieldValue(data, 'ButtonBorderRadius', '8px');
  const buttonBorder = getFieldValue(data, 'ButtonBorder');
  const buttonWidth = getFieldValue(data, 'ButtonWidth', 'auto');
  const buttonPadding = getFieldValue(data, 'ButtonPadding', '12px 24px');
  const buttonTextColor = getFieldValue(data, 'ButtonTextColor', '#ffffff');
  const buttonPosition = getFieldValue(data, 'ButtonPosition', 'left');

  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };

  return (
    <div className="py-6">
      {title && (
        <h2
          className="font-bold leading-tight"
          style={{ color: titleColor, fontSize: titleSize || undefined }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <h3
          className="mt-2 font-semibold"
          style={{ color: subtitleColor, fontSize: subtitleSize || undefined }}
        >
          {subtitle}
        </h3>
      )}
      {description && (
        <p
          className="mt-3 leading-relaxed whitespace-pre-wrap"
          style={{ color: descriptionColor, fontSize: descriptionSize || undefined }}
        >
          {description}
        </p>
      )}
      {buttonText && (
        <div style={{ display: 'flex', justifyContent: alignMap[buttonPosition] ?? 'flex-start', marginTop: '1rem' }}>
          <a
            href={buttonUrl}
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
              borderRadius: buttonRadius,
              border: buttonBorder || undefined,
              width: buttonWidth,
              padding: buttonPadding,
              display: 'inline-block',
              textAlign: 'center',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = buttonHoverColor)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = buttonColor)}
          >
            {buttonText}
          </a>
        </div>
      )}
    </div>
  );
}
