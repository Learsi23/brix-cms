'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface TabsBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function TabsBlock({ data, blocks }: TabsBlockProps) {
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const activeColor = getFieldValue(data, 'TabActiveColor', '#3b82f6');
  const activeTextColor = getFieldValue(data, 'TabActiveTextColor', '#ffffff');
  const inactiveTextColor = getFieldValue(data, 'TabInactiveTextColor', '#6b7280');

  const tabs = (blocks ?? [])
    .filter(b => b.type === 'TabItemBlock')
    .map(b => {
      const d: BlockData = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        id: b.id,
        label: getFieldValue(d, 'TabLabel', 'Tab'),
        icon: getFieldValue(d, 'TabIcon', ''),
        content: getFieldValue(d, 'Content', ''),
      };
    });

  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');

  const activeTab = tabs.find(t => t.id === activeId);

  return (
    <section style={{ backgroundColor: bgColor, padding: '3rem 0' }}>
      <div className="max-w-4xl mx-auto px-6">
        {tabs.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No tab items — add <strong>TabItem</strong> blocks inside.
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
              {tabs.map(tab => {
                const isActive = tab.id === activeId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveId(tab.id)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all -mb-px border border-transparent"
                    style={isActive ? {
                      backgroundColor: activeColor,
                      color: activeTextColor,
                      borderColor: activeColor,
                    } : {
                      color: inactiveTextColor,
                    }}
                  >
                    {tab.icon && <i className={tab.icon} />}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {activeTab && (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: activeTab.content || '' }}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
