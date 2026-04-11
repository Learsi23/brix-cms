'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: string;
}

function AccordionItem({ question, answer, isOpen, onToggle, accentColor }: AccordionItemProps) {
  return (
    <div
      className="border rounded-xl overflow-hidden transition-all"
      style={{ borderColor: isOpen ? accentColor : '#e5e7eb' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span>{question}</span>
        <i
          className={`fas fa-chevron-down text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: isOpen ? accentColor : '#9ca3af' }}
        />
      </button>
      {isOpen && (
        <div
          className="px-5 pb-5 text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      )}
    </div>
  );
}

interface AccordionBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function AccordionBlock({ data, blocks }: AccordionBlockProps) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const accentColor = getFieldValue(data, 'ActiveColor', '#3b82f6');
  const allowMultiple = getFieldValue(data, 'AllowMultiple', 'false') === 'true';

  const items = (blocks ?? [])
    .filter(b => b.type === 'AccordionItemBlock')
    .map(b => {
      const d: BlockData = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        id: b.id,
        question: getFieldValue(d, 'Question', ''),
        answer: getFieldValue(d, 'Answer', ''),
        openByDefault: getFieldValue(d, 'OpenByDefault', 'false') === 'true',
      };
    });

  const initialOpen = items
    .filter(i => i.openByDefault)
    .map(i => i.id);

  const [openIds, setOpenIds] = useState<string[]>(initialOpen);

  function toggle(id: string) {
    if (allowMultiple) {
      setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setOpenIds(prev => prev.includes(id) ? [] : [id]);
    }
  }

  return (
    <section style={{ backgroundColor: bgColor, padding: '3rem 0' }}>
      <div className="max-w-3xl mx-auto px-6">
        {title && (
          <h2 style={{ color: titleColor }} className="text-3xl font-black mb-8 text-center">
            {title}
          </h2>
        )}
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No accordion items — add <strong>AccordionItem</strong> blocks inside.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <AccordionItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isOpen={openIds.includes(item.id)}
                onToggle={() => toggle(item.id)}
                accentColor={accentColor}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
