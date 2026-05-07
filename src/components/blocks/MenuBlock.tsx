import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface MenuBlockProps {
  data: BlockData;
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
  badge?: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

function parseMenuContent(content: string): MenuCategory[] {
  const categories: MenuCategory[] = [];
  let current: MenuCategory | null = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const catMatch = trimmed.match(/^\[(.+)\]$/);
    if (catMatch) {
      current = { name: catMatch[1], items: [] };
      categories.push(current);
    } else if (current) {
      const parts = trimmed.split('|').map(p => p.trim());
      current.items.push({
        name: parts[0] || '',
        description: parts[1] || '',
        price: parts[2] || '',
        badge: parts[3],
      });
    }
  }
  return categories;
}

export default function MenuBlock({ data }: MenuBlockProps) {
  const title = getFieldValue(data, 'title', 'Our Menu');
  const subtitle = getFieldValue(data, 'subtitle', '');
  const menuContent = getFieldValue(data, 'menuContent', '');
  const accentColor = getFieldValue(data, 'accentColor', '#b45309');
  const showDividers = getFieldValue(data, 'showDividers', 'true') === 'true';

  const categories = parseMenuContent(menuContent);

  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-3xl font-black text-gray-900 text-center mb-2">{title}</h2>
        )}
        {subtitle && (
          <p className="text-gray-500 text-center mb-10">{subtitle}</p>
        )}

        {categories.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No menu content — add items in the Menu Content field.
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((cat, ci) => (
              <div key={ci}>
                <h3
                  className="text-lg font-black uppercase tracking-widest mb-4 pb-2"
                  style={{ color: accentColor, borderBottom: `2px solid ${accentColor}` }}
                >
                  {cat.name}
                </h3>
                <div className="space-y-0">
                  {cat.items.map((item, ii) => (
                    <div
                      key={ii}
                      className={`flex items-start justify-between py-3 gap-4 ${showDividers && ii > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{item.name}</span>
                          {item.badge && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                        )}
                      </div>
                      {item.price && (
                        <span className="font-bold text-gray-800 whitespace-nowrap">{item.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
