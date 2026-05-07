import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface TableBlockProps {
  data: BlockData;
}

export default function TableBlock({ data }: TableBlockProps) {
  const raw = getFieldValue(data, 'tableData', 'Product | Price | Status\nItem 1 | €10.00 | Available');
  const caption = getFieldValue(data, 'caption', '');
  const style = getFieldValue(data, 'style', 'striped');
  const headerBg = getFieldValue(data, 'headerBackground', '#f3f4f6');
  const headerColor = getFieldValue(data, 'headerColor', '#000000');
  const cellColor = getFieldValue(data, 'cellColor', '#111827');
  const rowBg = getFieldValue(data, 'rowBackground', '#ffffff');
  const rowAltBg = getFieldValue(data, 'rowAlternateBackground', '#f9fafb');
  const borderColor = getFieldValue(data, 'borderColor', '#e5e7eb');
  const cellPadding = getFieldValue(data, 'cellPadding', '12px');
  const textAlign = getFieldValue(data, 'textAlign', 'left') as 'left' | 'center' | 'right';
  const mobileScroll = getFieldValue(data, 'mobileScroll', 'true') === 'true';
  const sectionId = getFieldValue(data, 'sectionId', '');

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        No table data — enter rows in the Table Content field.
      </div>
    );
  }

  const headers = lines[0].split('|').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split('|').map(c => c.trim()));

  const hasBorder = style === 'bordered';

  return (
    <section id={sectionId || undefined} className="py-8 px-4">
      <div className={mobileScroll ? 'overflow-x-auto' : ''}>
        <table
          className="w-full text-sm"
          style={{
            borderCollapse: hasBorder ? 'collapse' : 'separate',
            borderSpacing: 0,
            textAlign,
          }}
        >
          {caption && (
            <caption className="mb-2 text-sm text-gray-500 font-semibold">{caption}</caption>
          )}
          <thead>
            <tr style={{ backgroundColor: headerBg }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    color: headerColor,
                    padding: cellPadding,
                    border: hasBorder ? `1px solid ${borderColor}` : undefined,
                    borderBottom: !hasBorder ? `2px solid ${borderColor}` : undefined,
                    fontWeight: 700,
                    textAlign,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isAlt = ri % 2 === 1;
              const bg = style === 'striped' && isAlt ? rowAltBg : rowBg;
              return (
                <tr key={ri} style={{ backgroundColor: bg }}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        color: cellColor,
                        padding: cellPadding,
                        border: hasBorder ? `1px solid ${borderColor}` : undefined,
                        borderBottom: !hasBorder && style !== 'minimal' ? `1px solid ${borderColor}` : undefined,
                        textAlign,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
