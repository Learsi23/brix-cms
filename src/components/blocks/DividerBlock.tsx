import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function DividerBlock({ data }: { data: BlockData }) {
  const style = getFieldValue(data, 'Style', 'solid');
  const color = getFieldValue(data, 'Color', '#e5e7eb');
  const thickness = getFieldValue(data, 'Thickness', '1px');
  const width = getFieldValue(data, 'Width', '100%');
  const paddingY = getFieldValue(data, 'PaddingY', '2rem');

  return (
    <div style={{ paddingTop: paddingY, paddingBottom: paddingY }} className="flex justify-center">
      <hr
        style={{
          borderStyle: style as 'solid' | 'dashed' | 'dotted' | 'double' | 'none',
          borderColor: color,
          borderTopWidth: thickness,
          width,
          margin: 0,
        }}
      />
    </div>
  );
}
