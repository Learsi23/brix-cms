import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function MapBlock({ data }: { data: BlockData }) {
  const address = getFieldValue(data, 'Address');
  const zoom = getFieldValue(data, 'Zoom', '15');
  const mapType = getFieldValue(data, 'MapType', 'roadmap');
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', '#6b7280');
  const textAlign = getFieldValue(data, 'TextAlign', 'center');
  const showInfoCard = getFieldValue(data, 'ShowInfoCard', 'true') === 'true';
  const placeName = getFieldValue(data, 'PlaceName');
  const addressDisplay = getFieldValue(data, 'AddressDisplay');
  const phone = getFieldValue(data, 'Phone');
  const email = getFieldValue(data, 'Email');
  const hours = getFieldValue(data, 'Hours');
  const cardBg = getFieldValue(data, 'CardBgColor', '#ffffff');
  const cardTextColor = getFieldValue(data, 'CardTextColor', '#374151');
  const mapHeight = getFieldValue(data, 'MapHeight', '450px');
  const maxWidth = getFieldValue(data, 'MaxWidth', '100%');
  const borderRadius = getFieldValue(data, 'BorderRadius', '16px');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#ffffff');
  const paddingY = getFieldValue(data, 'PaddingY', '3rem');

  const embedSrc = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&t=${mapType[0]}&output=embed`
    : null;

  const hasInfoCard = showInfoCard && (placeName || addressDisplay || phone || email || hours);

  return (
    <section style={{ backgroundColor: bgColor, paddingTop: paddingY, paddingBottom: paddingY }}>
      <div className="max-w-6xl mx-auto px-6" style={{ maxWidth }}>
        {(title || subtitle) && (
          <div className="mb-8" style={{ textAlign: textAlign as 'left' | 'center' | 'right' }}>
            {title && <h2 style={{ color: titleColor }} className="text-3xl font-black mb-3">{title}</h2>}
            {subtitle && <p style={{ color: subtitleColor }} className="text-lg">{subtitle}</p>}
          </div>
        )}

        <div className="relative" style={{ borderRadius, overflow: 'hidden', height: mapHeight }}>
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={title || 'Map'}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
              Enter an address to show the map
            </div>
          )}

          {hasInfoCard && (
            <div
              className="absolute bottom-4 left-4 p-4 rounded-xl shadow-lg max-w-xs"
              style={{ backgroundColor: cardBg, color: cardTextColor }}
            >
              {placeName && <p className="font-bold text-sm mb-2">{placeName}</p>}
              {addressDisplay && <p className="text-xs mb-1">📍 {addressDisplay}</p>}
              {phone && <p className="text-xs mb-1">📞 {phone}</p>}
              {email && <p className="text-xs mb-1">✉️ {email}</p>}
              {hours && <p className="text-xs">🕐 {hours}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
