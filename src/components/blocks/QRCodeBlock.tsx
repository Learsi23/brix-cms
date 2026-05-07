import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface QRCodeBlockProps {
  data: BlockData;
}

export default function QRCodeBlock({ data }: QRCodeBlockProps) {
  const content = getFieldValue(data, 'content', '');
  const size = getFieldValue(data, 'size', '200');
  const fgColor = getFieldValue(data, 'foregroundColor', '#000000').replace('#', '');
  const bgColorRaw = getFieldValue(data, 'backgroundColor', '#ffffff').replace('#', '');
  const borderRadius = getFieldValue(data, 'borderRadius', '8px');
  const includeLabel = getFieldValue(data, 'includeLabel', 'false') === 'true';
  const label = getFieldValue(data, 'label', '');
  const labelColor = getFieldValue(data, 'labelColor', '#000000');
  const align = getFieldValue(data, 'align', 'center') as 'left' | 'center' | 'right';
  const sectionId = getFieldValue(data, 'sectionId', '');

  if (!content) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No QR content — enter a URL or text in the block settings.
      </div>
    );
  }

  // Google Charts QR API (no npm needed)
  const qrUrl = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(content)}&chco=${fgColor}&chf=bg,s,${bgColorRaw}`;

  const alignClass = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : '';

  return (
    <section id={sectionId || undefined} className="py-6 px-4">
      <div className={`flex flex-col items-${align === 'center' ? 'center' : align === 'right' ? 'end' : 'start'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt={`QR code for: ${content}`}
          width={Number(size)}
          height={Number(size)}
          style={{ borderRadius, display: 'block' }}
          className={alignClass}
        />
        {includeLabel && label && (
          <p className="mt-2 text-sm font-medium" style={{ color: labelColor, textAlign: align }}>
            {label}
          </p>
        )}
      </div>
    </section>
  );
}
