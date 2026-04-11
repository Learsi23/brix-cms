import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import type { ReactNode } from 'react';

interface ColumnBlockProps {
  data: BlockData;
  // Acepta nodos ya renderizados — evita importar BlockRenderer (circular)
  renderedChildren?: ReactNode[];
}

export default function ColumnBlock({ data, renderedChildren = [] }: ColumnBlockProps) {
  const gap = getFieldValue(data, 'Gap', 'gap-6');
  const columns = getFieldValue(data, 'Columns', '2');

  const colClass: Record<string, string> = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`my-8 grid ${colClass[columns] ?? 'grid-cols-2'} ${gap}`}>
      {renderedChildren.map((child, i) => (
        <div key={i}>{child}</div>
      ))}
    </div>
  );
}
