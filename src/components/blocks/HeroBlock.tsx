import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function HeroBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#ffffff');
  const titleSize = getFieldValue(data, 'TitleSize', '3rem');
  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', '#ffffff');
  const subtitleSize = getFieldValue(data, 'SubtitleSize', '1.25rem');
  const description = getFieldValue(data, 'Description');
  const background = getFieldValue(data, 'Background');

  return (
    <section
      className="relative flex items-center justify-center min-h-[60vh] px-6 py-20"
      style={{
        backgroundImage: background ? `url(${background})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: background ? undefined : '#1e293b',
      }}
    >
      {background && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
        {title && (
          <h1 style={{ color: titleColor, fontSize: titleSize || undefined }} className="font-black leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <h2 style={{ color: subtitleColor, fontSize: subtitleSize || undefined }} className="font-semibold">
            {subtitle}
          </h2>
        )}
        {description && (
          <p className="text-white/80 text-lg">{description}</p>
        )}
      </div>
    </section>
  );
}
