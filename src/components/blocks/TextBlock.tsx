import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import type { CSSProperties } from 'react';

export default function TextBlock({ data }: { data: BlockData }) {
  const title          = getFieldValue(data, 'Title');
  const titleColor     = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize      = getFieldValue(data, 'TitleSize');
  const titleWeight    = getFieldValue(data, 'TitleWeight', '700');
  const titleAlignment = getFieldValue(data, 'TitleAlignment', 'left');

  const subtitle          = getFieldValue(data, 'Subtitle');
  const subtitleColor     = getFieldValue(data, 'SubtitleColor', '#000000');
  const subtitleSize      = getFieldValue(data, 'SubtitleSize');
  const subtitleWeight    = getFieldValue(data, 'SubtitleWeight', '500');
  const subtitleAlignment = getFieldValue(data, 'SubtitleAlignment', 'left');

  const body          = getFieldValue(data, 'Body');
  const bodyColor     = getFieldValue(data, 'BodyColor', '#000000');
  const bodySize      = getFieldValue(data, 'BodySize');
  const bodyWeight    = getFieldValue(data, 'BodyWeight', '400');
  const bodyAlignment = getFieldValue(data, 'BodyAlignment', 'left');

  const bgColor = getFieldValue(data, 'BackgroundColor');

  // Padding: shorthand wins over individual fields
  const paddingShorthand = getFieldValue(data, 'Padding');
  const innerStyle: CSSProperties = paddingShorthand
    ? { padding: paddingShorthand }
    : {
        marginTop:    getFieldValue(data, 'MarginTop',    '0'),
        marginBottom: getFieldValue(data, 'MarginBottom', '0'),
        marginLeft:   getFieldValue(data, 'MarginLeft',   '0'),
        marginRight:  getFieldValue(data, 'MarginRight',  '0'),
        paddingTop:    getFieldValue(data, 'PaddingTop',    '0'),
        paddingBottom: getFieldValue(data, 'PaddingBottom', '0'),
        paddingLeft:   getFieldValue(data, 'PaddingLeft',   '0'),
        paddingRight:  getFieldValue(data, 'PaddingRight',  '0'),
      };

  return (
    <div className="container mx-auto" style={bgColor ? { backgroundColor: bgColor } : undefined}>
      <div style={innerStyle}>
        {title && (
          <h2
            className="leading-tight"
            style={{
              color: titleColor,
              fontSize: titleSize || undefined,
              fontWeight: titleWeight,
              textAlign: titleAlignment as CSSProperties['textAlign'],
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
              textAlign: subtitleAlignment as CSSProperties['textAlign'],
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
              textAlign: bodyAlignment as CSSProperties['textAlign'],
            }}
          >
            {body}
          </p>
        )}
      </div>
    </div>
  );
}