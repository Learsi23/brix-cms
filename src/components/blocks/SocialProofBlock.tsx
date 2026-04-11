import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <span className="flex gap-0.5 text-amber-400 text-sm">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <i key={i} className="fas fa-star" />;
        if (i === full && half) return <i key={i} className="fas fa-star-half-alt" />;
        return <i key={i} className="far fa-star" />;
      })}
    </span>
  );
}

export default function SocialProofBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title', '');
  const logoUrlsRaw = getFieldValue(data, 'LogoUrls', '');
  const logoHeight = getFieldValue(data, 'LogoHeight', '40px');
  const reviewCount = getFieldValue(data, 'ReviewCount', '');
  const reviewScore = getFieldValue(data, 'ReviewScore', '');
  const reviewSource = getFieldValue(data, 'ReviewSource', 'Google');
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const textColor = getFieldValue(data, 'TextColor', '#6b7280');

  const logos = logoUrlsRaw
    ? logoUrlsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const score = parseFloat(reviewScore || '0');

  const sourceLogo =
    reviewSource === 'Trustpilot'
      ? '★ Trustpilot'
      : reviewSource === 'Google'
        ? 'G Google'
        : reviewSource;

  return (
    <section style={{ backgroundColor: bgColor, padding: '3rem 0' }}>
      <div className="max-w-5xl mx-auto px-6">
        {title && (
          <h2 style={{ color: textColor }} className="text-center text-sm font-bold uppercase tracking-widest mb-8 opacity-60">
            {title}
          </h2>
        )}

        {/* Logos */}
        {logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            {logos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Logo ${i + 1}`}
                style={{ height: logoHeight, maxWidth: '140px', objectFit: 'contain' }}
                className="opacity-60 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        )}

        {/* Review badge */}
        {reviewCount && reviewScore && (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-800">{reviewScore}</div>
                <StarRating score={score} />
              </div>
              <div className="border-l border-gray-200 pl-3">
                <div style={{ color: textColor }} className="text-xs">
                  Based on <strong>{reviewCount}</strong> reviews
                </div>
                <div className="font-bold text-sm text-gray-700 mt-0.5">{sourceLogo}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
