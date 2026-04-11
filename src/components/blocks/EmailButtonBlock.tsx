import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function EmailButtonBlock({ data }: { data: BlockData }) {
  const text = getFieldValue(data, 'Text', 'Contact us');
  const email = getFieldValue(data, 'EmailAddress');
  const subject = getFieldValue(data, 'Subject');
  const body = getFieldValue(data, 'Body');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#3b82f6');
  const hoverColor = getFieldValue(data, 'HoverColor', '#2563eb');
  const textColor = getFieldValue(data, 'TextColor', '#ffffff');
  const borderRadius = getFieldValue(data, 'BorderRadius', '8px');
  const border = getFieldValue(data, 'Border');
  const width = getFieldValue(data, 'Width', 'auto');
  const padding = getFieldValue(data, 'Padding', '12px 24px');
  const position = getFieldValue(data, 'Position', 'center');

  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };

  const mailtoParams = new URLSearchParams();
  if (subject) mailtoParams.set('subject', subject);
  if (body) mailtoParams.set('body', body);
  const mailto = `mailto:${email}${mailtoParams.toString() ? '?' + mailtoParams.toString() : ''}`;

  return (
    <div style={{ display: 'flex', justifyContent: alignMap[position] ?? 'center', margin: '1rem 0' }}>
      <a
        href={mailto}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius,
          border: border || undefined,
          width,
          padding,
          display: 'inline-block',
          textAlign: 'center',
          fontWeight: 'bold',
          textDecoration: 'none',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverColor)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = bgColor)}
      >
        {text}
      </a>
    </div>
  );
}
