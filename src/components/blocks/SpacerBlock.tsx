import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function SpacerBlock({ data }: { data: BlockData }) {
  const height = getFieldValue(data, 'Height', '48px');
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  return <div style={{ height, backgroundColor: bgColor }} aria-hidden="true" />;
}
