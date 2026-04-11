'use client';

import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import { useState } from 'react';

export default function DropdownBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize = getFieldValue(data, 'TitleSize');
  const backgroundColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const backgroundGradient = getFieldValue(data, 'BackgroundGradient');
  const question = getFieldValue(data, 'Question');
  const questionColor = getFieldValue(data, 'QuestionColor', '#000000');
  const questionSize = getFieldValue(data, 'QuestionSize', '1.125rem');
  const answer = getFieldValue(data, 'Answer');
  const answerColor = getFieldValue(data, 'AnswerColor', '#333333');
  const answerSize = getFieldValue(data, 'AnswerSize', '1rem');
  const dropdownBg = getFieldValue(data, 'DropdownBackgroundColor', '#f8f9fa');
  const openByDefault = getFieldValue(data, 'OpenByDefault', 'false') === 'true';

  const [isOpen, setIsOpen] = useState(openByDefault);

  return (
    <div
      className="py-6 px-4"
      style={{
        background: backgroundGradient || backgroundColor,
      }}
    >
      {title && (
        <h2
          className="font-bold mb-4"
          style={{ color: titleColor, fontSize: titleSize || undefined }}
        >
          {title}
        </h2>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <span
            className="font-semibold"
            style={{ color: questionColor, fontSize: questionSize }}
          >
            {question}
          </span>
          <span
            className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div
            className="px-5 py-4 border-t border-slate-100"
            style={{ backgroundColor: dropdownBg }}
          >
            <div
              style={{ color: answerColor, fontSize: answerSize }}
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
