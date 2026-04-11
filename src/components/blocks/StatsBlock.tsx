import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function StatsBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', '#6b7280');
  const numberColor = getFieldValue(data, 'NumberColor', '#10b981');
  const labelColor = getFieldValue(data, 'LabelColor', '#6b7280');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#f9fafb');
  const cardBg = getFieldValue(data, 'CardBgColor', '#ffffff');
  const paddingY = getFieldValue(data, 'PaddingY', '4rem');

  const stats = [1, 2, 3, 4].map(n => ({
    number: getFieldValue(data, `Stat${n}Number`),
    label: getFieldValue(data, `Stat${n}Label`),
    icon: getFieldValue(data, `Stat${n}Icon`),
  })).filter(s => s.number || s.label);

  return (
    <section style={{ backgroundColor: bgColor, paddingTop: paddingY, paddingBottom: paddingY }}>
      <div className="max-w-6xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 style={{ color: titleColor }} className="text-3xl font-black mb-3">{title}</h2>}
            {subtitle && <p style={{ color: subtitleColor }} className="text-lg">{subtitle}</p>}
          </div>
        )}
        <div className={`grid grid-cols-2 ${stats.length > 2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-6`}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 text-center shadow-sm border border-slate-100"
              style={{ backgroundColor: cardBg }}
            >
              {stat.icon && <i className={`${stat.icon} text-2xl mb-3`} style={{ color: numberColor }} />}
              <div style={{ color: numberColor }} className="text-4xl font-black mb-2">{stat.number}</div>
              <div style={{ color: labelColor }} className="text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
