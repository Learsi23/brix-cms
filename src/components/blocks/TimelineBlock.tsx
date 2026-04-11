import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface TimelineBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function TimelineBlock({ data, blocks }: TimelineBlockProps) {
  const title = getFieldValue(data, 'Title', '');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle', '');
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const connectorColor = getFieldValue(data, 'ConnectorColor', '#3b82f6');
  const layout = getFieldValue(data, 'Layout', 'vertical');
  const textAlign = getFieldValue(data, 'TextAlign', 'left') as 'left' | 'center';

  const items = (blocks ?? [])
    .filter(b => b.type === 'TimelineItemBlock')
    .map(b => {
      const d: BlockData = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        id: b.id,
        stepLabel: getFieldValue(d, 'StepLabel', ''),
        icon: getFieldValue(d, 'Icon', 'fas fa-circle'),
        date: getFieldValue(d, 'Date', ''),
        itemTitle: getFieldValue(d, 'Title', ''),
        description: getFieldValue(d, 'Description', ''),
        accentColor: getFieldValue(d, 'AccentColor', connectorColor),
      };
    });

  return (
    <section style={{ backgroundColor: bgColor, padding: '4rem 0' }}>
      <div className="max-w-4xl mx-auto px-6">
        {(title || subtitle) && (
          <div className={`mb-12 ${textAlign === 'center' ? 'text-center' : ''}`}>
            {title && (
              <h2 style={{ color: titleColor }} className="text-3xl font-black mb-3">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-500 text-lg">{subtitle}</p>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No timeline items — add <strong>TimelineItem</strong> blocks inside.
          </div>
        ) : layout === 'horizontal' ? (
          /* Horizontal layout */
          <div className="overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {items.map((item, idx) => (
                <div key={item.id} className="flex flex-col items-center" style={{ minWidth: '180px' }}>
                  {/* Connector + dot */}
                  <div className="flex items-center w-full mb-4">
                    {idx > 0 && (
                      <div className="flex-1 h-0.5" style={{ backgroundColor: connectorColor }} />
                    )}
                    {idx === 0 && <div className="flex-1" />}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-md"
                      style={{ backgroundColor: item.accentColor }}
                    >
                      <i className={`${item.icon || 'fas fa-circle'} text-sm`} />
                    </div>
                    {idx < items.length - 1 && (
                      <div className="flex-1 h-0.5" style={{ backgroundColor: connectorColor }} />
                    )}
                    {idx === items.length - 1 && <div className="flex-1" />}
                  </div>

                  {/* Content */}
                  <div className="text-center px-3">
                    {item.stepLabel && (
                      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: item.accentColor }}>
                        {item.stepLabel}
                      </div>
                    )}
                    {item.date && (
                      <div className="text-xs text-gray-400 mb-1">{item.date}</div>
                    )}
                    {item.itemTitle && (
                      <div className="font-bold text-gray-800 text-sm mb-1">{item.itemTitle}</div>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Vertical layout */
          <div className="space-y-0">
            {items.map((item, idx) => (
              <div key={item.id} className="flex gap-6">
                {/* Left column: dot + connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: item.accentColor }}
                  >
                    <i className={`${item.icon || 'fas fa-circle'} text-sm`} />
                  </div>
                  {idx < items.length - 1 && (
                    <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: connectorColor, minHeight: '2rem' }} />
                  )}
                </div>

                {/* Right column: content */}
                <div className={`pb-8 flex-1 ${textAlign === 'center' ? 'text-center' : ''}`}>
                  {item.stepLabel && (
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: item.accentColor }}>
                      {item.stepLabel}
                    </div>
                  )}
                  {item.date && (
                    <div className="text-xs text-gray-400 mb-1">{item.date}</div>
                  )}
                  {item.itemTitle && (
                    <h3 className="font-black text-gray-800 text-lg mb-2">{item.itemTitle}</h3>
                  )}
                  {item.description && (
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
