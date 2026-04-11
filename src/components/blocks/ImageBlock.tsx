import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function ImageBlock({ data }: { data: BlockData }) {
  const src = getFieldValue(data, 'Source');
  const alt = getFieldValue(data, 'AltText', '');

  if (!src) return null;

  return (
    <figure className="my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-auto rounded-lg" />
    </figure>
  );
}
