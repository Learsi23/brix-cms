import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function ButtonLinkBlock({ data }: { data: BlockData }) {
  const text = getFieldValue(data, 'Text', 'Click here');
  const url = getFieldValue(data, 'Url', '#');
  const color = getFieldValue(data, 'Color', '#10b981');
  const textColor = getFieldValue(data, 'TextColor', '#ffffff');
  const borderRadius = getFieldValue(data, 'BorderRadius', '8px');
  const border = getFieldValue(data, 'Border');
  const width = getFieldValue(data, 'Width', 'auto');
  const padding = getFieldValue(data, 'Padding', '12px 24px');
  const position = getFieldValue(data, 'ButtonPosition', 'center');

  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };

  return (
    <div style={{ display: 'flex', justifyContent: alignMap[position] ?? 'center', margin: '1rem 0' }}>
      <a
        href={url}
        style={{
          backgroundColor: color,
          color: textColor,
          borderRadius,
          border: border || undefined,
          width,
          padding,
          display: 'inline-block',
          textAlign: 'center',
          fontWeight: 'bold',
          textDecoration: 'none',
        }}
      >
        {text}
      </a>
    </div>
  );
}
