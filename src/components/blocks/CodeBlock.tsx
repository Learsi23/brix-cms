'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface CodeBlockProps {
  data: BlockData;
}

export default function CodeBlock({ data }: CodeBlockProps) {
  const code = getFieldValue(data, 'code', '');
  const language = getFieldValue(data, 'language', 'javascript');
  const theme = getFieldValue(data, 'theme', 'dark');
  const bgColor = getFieldValue(data, 'backgroundColor', '#1e293b');
  const textColor = getFieldValue(data, 'textColor', '#e2e8f0');
  const borderRadius = getFieldValue(data, 'borderRadius', '8px');
  const showLineNumbers = getFieldValue(data, 'showLineNumbers', 'true') === 'true';
  const showCopyButton = getFieldValue(data, 'showCopyButton', 'true') === 'true';
  const maxHeight = getFieldValue(data, 'maxHeight', '');
  const fontSize = getFieldValue(data, 'fontSize', '14px');
  const blockTitle = getFieldValue(data, 'title', '');
  const titleBg = getFieldValue(data, 'titleBackground', '#0f172a');
  const sectionId = getFieldValue(data, 'sectionId', '');

  const [copied, setCopied] = useState(false);

  // Strip HTML tags from code (may come from richtext editor)
  const plainCode = code.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

  async function handleCopy() {
    await navigator.clipboard.writeText(plainCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const lines = plainCode.split('\n');

  return (
    <div id={sectionId || undefined} className="my-6 mx-auto max-w-4xl px-4">
      <div style={{ borderRadius, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ backgroundColor: titleBg }}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {blockTitle || language}
          </span>
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {/* Code area */}
        <div
          style={{
            backgroundColor: bgColor,
            maxHeight: maxHeight || undefined,
            overflowY: maxHeight ? 'auto' : undefined,
          }}
        >
          <pre
            className="overflow-x-auto"
            style={{ margin: 0, padding: '1.25rem 1rem', fontSize }}
          >
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span
                    className="select-none mr-4 text-right"
                    style={{ color: '#4b5563', minWidth: `${String(lines.length).length}ch` }}
                  >
                    {i + 1}
                  </span>
                )}
                <code style={{ color: textColor, fontFamily: 'monospace' }}>{line || ' '}</code>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
