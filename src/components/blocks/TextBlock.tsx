import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function TextBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize = getFieldValue(data, 'TitleSize');
  const titleWeight = getFieldValue(data, 'TitleWeight', '700');
  const titleAlignment = getFieldValue(data, 'TitleAlignment', 'left');

  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', '#000000');
  const subtitleSize = getFieldValue(data, 'SubtitleSize');
  const subtitleWeight = getFieldValue(data, 'SubtitleWeight', '500');
  const subtitleAlignment = getFieldValue(data, 'SubtitleAlignment', 'left');

  const body = getFieldValue(data, 'Body');
  const bodyColor = getFieldValue(data, 'BodyColor', '#000000');
  const bodySize = getFieldValue(data, 'BodySize');
  const bodyWeight = getFieldValue(data, 'BodyWeight', '400');
  const bodyAlignment = getFieldValue(data, 'BodyAlignment', 'left');

  const marginTop = getFieldValue(data, 'MarginTop', '0');
  const marginBottom = getFieldValue(data, 'MarginBottom', '0');
  const marginLeft = getFieldValue(data, 'MarginLeft', '0');
  const marginRight = getFieldValue(data, 'MarginRight', '0');
  const paddingTop = getFieldValue(data, 'PaddingTop', '0');
  const paddingBottom = getFieldValue(data, 'PaddingBottom', '0');
  const paddingLeft = getFieldValue(data, 'PaddingLeft', '0');
  const paddingRight = getFieldValue(data, 'PaddingRight', '0');

  return (
    <div
      style={{
        marginTop, marginBottom, marginLeft, marginRight,
        paddingTop, paddingBottom, paddingLeft, paddingRight,
      }}
    >
      {title && (
        <h2
          className="leading-tight"
          style={{ 
            color: titleColor, 
            fontSize: titleSize || undefined, 
            fontWeight: titleWeight,
            textAlign: titleAlignment as 'left' | 'center' | 'right' 
          }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <h3
          className="mt-2"
          style={{ 
            color: subtitleColor, 
            fontSize: subtitleSize || undefined, 
            fontWeight: subtitleWeight,
            textAlign: subtitleAlignment as 'left' | 'center' | 'right' 
          }}
        >
          {subtitle}
        </h3>
      )}
      {body && (
        <p
          className="mt-3 leading-relaxed whitespace-pre-wrap"
          style={{ 
            color: bodyColor, 
            fontSize: bodySize || undefined, 
            fontWeight: bodyWeight,
            textAlign: bodyAlignment as 'left' | 'center' | 'right' | 'justify' 
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}