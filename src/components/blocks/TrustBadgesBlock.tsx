import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface TrustBadgesBlockProps {
  data: BlockData;
}

export default function TrustBadgesBlock({ data }: TrustBadgesBlockProps) {
  const iconColor = getFieldValue(data, 'iconColor', '#111827');
  const bgColor = getFieldValue(data, 'backgroundColor', '#f9fafb');
  const showBorder = getFieldValue(data, 'showBorder', 'true') === 'true';

  const badges = [1, 2, 3, 4].map(i => ({
    icon: getFieldValue(data, `badge${i}Icon`, i === 1 ? 'fa-truck' : i === 2 ? 'fa-rotate-left' : i === 3 ? 'fa-lock' : 'fa-headset'),
    label: getFieldValue(data, `badge${i}Label`, i === 1 ? 'Free Shipping' : i === 2 ? 'Easy Returns' : i === 3 ? 'Secure Payment' : '24/7 Support'),
    sublabel: getFieldValue(data, `badge${i}Sublabel`, ''),
  })).filter(b => b.label);

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`py-6 px-4 ${showBorder ? 'border-y border-gray-200' : ''}`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{ color: iconColor }}
              >
                <i className={`fas ${badge.icon} text-2xl`} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{badge.label}</p>
                {badge.sublabel && (
                  <p className="text-xs text-gray-500">{badge.sublabel}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
