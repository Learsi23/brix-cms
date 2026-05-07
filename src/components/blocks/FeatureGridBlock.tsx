import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface FeatureGridBlockProps {
  data: BlockData;
}

export default function FeatureGridBlock({ data }: FeatureGridBlockProps) {
  const title = getFieldValue(data, 'title', '');
  const titleColor = getFieldValue(data, 'titleColor', '#ffffff');
  const titleSize = getFieldValue(data, 'titleSize', '2rem');
  const subtitle = getFieldValue(data, 'subtitle', '');
  const subtitleColor = getFieldValue(data, 'subtitleColor', '#9ca3af');
  const subtitleSize = getFieldValue(data, 'subtitleSize', '1rem');
  const columns = parseInt(getFieldValue(data, 'columns', '3') || '3', 10);
  const gap = getFieldValue(data, 'gap', '1rem');
  const bgColor = getFieldValue(data, 'backgroundColor', '');
  const paddingY = getFieldValue(data, 'paddingY', '3rem');
  const maxWidth = getFieldValue(data, 'maxWidth', '1200px');

  const features = [1, 2, 3, 4, 5, 6].map(i => ({
    icon: getFieldValue(data, `icon${i}`, ''),
    iconColor: getFieldValue(data, `icon${i}Color`, '#5B6EF5'),
    title: getFieldValue(data, `title${i}`, ''),
    description: getFieldValue(data, `description${i}`, ''),
  })).filter(f => f.title || f.icon);

  const colClass = columns === 2 ? 'grid-cols-1 sm:grid-cols-2'
    : columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section style={{ backgroundColor: bgColor || undefined, padding: `${paddingY} 0` }}>
      <div style={{ maxWidth, margin: '0 auto', padding: '0 1rem' }}>
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 style={{ color: titleColor, fontSize: titleSize }} className="font-black mb-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ color: subtitleColor, fontSize: subtitleSize }}>{subtitle}</p>
            )}
          </div>
        )}

        {features.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            Fill in the feature fields to show items here.
          </div>
        ) : (
          <div className={`grid ${colClass}`} style={{ gap }}>
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5">
                {f.icon && (
                  <div className="mb-4 w-12 h-12 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${f.iconColor}20` }}>
                    <i className={`fas ${f.icon} text-xl`} style={{ color: f.iconColor }} />
                  </div>
                )}
                {f.title && (
                  <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                )}
                {f.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
