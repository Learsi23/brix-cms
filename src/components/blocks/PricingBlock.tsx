import Link from 'next/link';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface PricingBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function PricingBlock({ data, blocks }: PricingBlockProps) {
  const title = getFieldValue(data, 'Title', '');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle', '');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#f9fafb');
  const currency = getFieldValue(data, 'Currency', '€');

  const cards = (blocks ?? [])
    .filter(b => b.type === 'PricingCardBlock')
    .map(b => {
      const d: BlockData = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        id: b.id,
        planName: getFieldValue(d, 'PlanName', 'Plan'),
        price: getFieldValue(d, 'Price', '0'),
        period: getFieldValue(d, 'Period', '/month'),
        description: getFieldValue(d, 'Description', ''),
        features: getFieldValue(d, 'Features', '').split('\n').filter(Boolean),
        buttonText: getFieldValue(d, 'ButtonText', 'Get started'),
        buttonUrl: getFieldValue(d, 'ButtonUrl', '#'),
        accentColor: getFieldValue(d, 'AccentColor', '#3b82f6'),
        cardBg: getFieldValue(d, 'CardBgColor', '#ffffff'),
        isPopular: getFieldValue(d, 'IsPopular', 'false') === 'true',
        popularLabel: getFieldValue(d, 'PopularLabel', 'Most popular'),
      };
    });

  return (
    <section style={{ backgroundColor: bgColor, padding: '4rem 0' }}>
      <div className="max-w-6xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 style={{ color: titleColor }} className="text-3xl font-black mb-3">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-500 text-lg max-w-xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No pricing cards — add <strong>PricingCard</strong> blocks inside.
          </div>
        ) : (
          <div className={`grid gap-6 ${cards.length === 1 ? 'max-w-sm mx-auto' : cards.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {cards.map(card => (
              <div
                key={card.id}
                className="relative rounded-2xl border p-8 flex flex-col shadow-sm"
                style={{
                  backgroundColor: card.cardBg,
                  borderColor: card.isPopular ? card.accentColor : '#e5e7eb',
                  borderWidth: card.isPopular ? 2 : 1,
                }}
              >
                {card.isPopular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap"
                    style={{ backgroundColor: card.accentColor }}
                  >
                    {card.popularLabel}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-black text-gray-800 mb-2">{card.planName}</h3>
                  {card.description && (
                    <p className="text-gray-500 text-sm">{card.description}</p>
                  )}
                </div>

                <div className="mb-6">
                  <span style={{ color: card.accentColor }} className="text-5xl font-black">
                    {currency}{card.price}
                  </span>
                  <span className="text-gray-400 text-sm ml-1">{card.period}</span>
                </div>

                {card.features.length > 0 && (
                  <ul className="space-y-2 mb-8 flex-1">
                    {card.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <i className="fas fa-check mt-0.5 flex-shrink-0" style={{ color: card.accentColor }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={card.buttonUrl}
                  className="block text-center py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 mt-auto"
                  style={{
                    backgroundColor: card.isPopular ? card.accentColor : 'transparent',
                    color: card.isPopular ? '#ffffff' : card.accentColor,
                    border: card.isPopular ? 'none' : `2px solid ${card.accentColor}`,
                  }}
                >
                  {card.buttonText}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
