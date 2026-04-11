import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import type { ReactNode } from 'react';

interface IconColumnProps {
  data: BlockData;
  renderedChildren?: ReactNode[];
}

export default function IconColumn({ data, renderedChildren = [] }: IconColumnProps) {
  const gap = getFieldValue(data, 'Gap', 'gap-6');
  const columnsPerRow = getFieldValue(data, 'ColumnsPerRow', '3');
  const backgroundColor = getFieldValue(data, 'BackgroundColor');
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#1f2937');
  const titleSize = getFieldValue(data, 'TitleSize', '1.75rem');

  const colClass: Record<string, string> = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div style={{ backgroundColor: backgroundColor || undefined }} className="py-8 px-4">
      {title && (
        <h2
          style={{ color: titleColor, fontSize: titleSize }}
          className="font-bold text-center mb-8"
        >
          {title}
        </h2>
      )}
      <div className={`grid ${colClass[columnsPerRow] ?? 'grid-cols-3'} ${gap}`}>
        {renderedChildren.map((child, i) => (
          <div key={i}>{child}</div>
        ))}
      </div>
    </div>
  );
}
