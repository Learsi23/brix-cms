'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface FAQBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function FAQBlock({ data, blocks }: FAQBlockProps) {
  const style = getFieldValue(data, 'style', 'cards') as 'list' | 'cards' | 'bordered';
  const bgColor = getFieldValue(data, 'backgroundColor', 'transparent');
  const paddingY = getFieldValue(data, 'paddingY', '3rem');
  const title = getFieldValue(data, 'title', '');
  const titleColor = getFieldValue(data, 'titleColor', '#000000');
  const titleAlign = getFieldValue(data, 'titleAlign', 'center') as 'left' | 'center' | 'right';
  const description = getFieldValue(data, 'description', '');
  const descriptionColor = getFieldValue(data, 'descriptionColor', '#666666');
  const questionColor = getFieldValue(data, 'questionColor', '#000000');
  const questionWeight = getFieldValue(data, 'questionWeight', '600');
  const answerColor = getFieldValue(data, 'answerColor', '#555555');
  const iconColor = getFieldValue(data, 'iconColor', '#5B6EF5');
  const borderColor = getFieldValue(data, 'borderColor', '#e5e7eb');
  const columns = getFieldValue(data, 'columns', '1');
  const sectionId = getFieldValue(data, 'sectionId', '');

  const items = (blocks ?? [])
    .map(b => {
      const d: BlockData = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        id: b.id,
        question: getFieldValue(d, 'question', '') || getFieldValue(d, 'Question', ''),
        answer: getFieldValue(d, 'answer', '') || getFieldValue(d, 'Answer', ''),
      };
    })
    .filter(i => i.question);

  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No FAQ items — add child blocks with <strong>question</strong> and <strong>answer</strong> fields.
      </div>
    );
  }

  function renderItem(item: { id: string; question: string; answer: string }) {
    const isOpen = openIds.includes(item.id);

    if (style === 'list') {
      return (
        <div key={item.id} className="py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex items-start justify-between text-left gap-3"
          >
            <span style={{ color: questionColor, fontWeight: questionWeight }}>{item.question}</span>
            <i className={`fas fa-plus mt-0.5 flex-shrink-0 text-sm transition-transform ${isOpen ? 'rotate-45' : ''}`} style={{ color: iconColor }} />
          </button>
          {isOpen && (
            <div
              className="mt-3 text-sm leading-relaxed prose prose-sm max-w-none"
              style={{ color: answerColor }}
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          )}
        </div>
      );
    }

    if (style === 'bordered') {
      return (
        <div key={item.id} className="rounded-xl overflow-hidden transition-all" style={{ border: `2px solid ${isOpen ? iconColor : borderColor}` }}>
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
          >
            <span style={{ color: questionColor, fontWeight: questionWeight }}>{item.question}</span>
            <i className={`fas fa-chevron-down text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: isOpen ? iconColor : '#9ca3af' }} />
          </button>
          {isOpen && (
            <div
              className="px-5 pb-5 text-sm leading-relaxed prose prose-sm max-w-none"
              style={{ color: answerColor }}
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          )}
        </div>
      );
    }

    return (
      <div key={item.id} className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: '#fff', border: `1px solid ${borderColor}` }}>
        <button
          onClick={() => toggle(item.id)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span style={{ color: questionColor, fontWeight: questionWeight }}>{item.question}</span>
          <i className={`fas fa-chevron-down text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: isOpen ? iconColor : '#9ca3af' }} />
        </button>
        {isOpen && (
          <div
            className="px-5 pb-5 text-sm leading-relaxed border-t prose prose-sm max-w-none"
            style={{ color: answerColor, borderColor }}
            dangerouslySetInnerHTML={{ __html: item.answer }}
          />
        )}
      </div>
    );
  }

  const gridClass = columns === '2' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3';

  return (
    <section id={sectionId || undefined} style={{ backgroundColor: bgColor, padding: `${paddingY} 0` }}>
      <div className="max-w-4xl mx-auto px-6">
        {(title || description) && (
          <div className="mb-10" style={{ textAlign: titleAlign }}>
            {title && (
              <h2 className="text-3xl font-black mb-3" style={{ color: titleColor }}>{title}</h2>
            )}
            {description && (
              <div
                className="text-base opacity-80 prose prose-sm max-w-none"
                style={{ color: descriptionColor }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>
        )}
        <div className={gridClass}>
          {items.map(item => renderItem(item))}
        </div>
      </div>
    </section>
  );
}
