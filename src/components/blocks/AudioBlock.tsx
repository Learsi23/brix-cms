import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface AudioBlockProps {
  data: BlockData;
}

export default function AudioBlock({ data }: AudioBlockProps) {
  const audioUrl = getFieldValue(data, 'audioUrl', '');
  const coverImage = getFieldValue(data, 'coverImage', '');
  const title = getFieldValue(data, 'title', '');
  const description = getFieldValue(data, 'description', '');
  const artist = getFieldValue(data, 'artist', '');
  const showControls = getFieldValue(data, 'showControls', 'true') === 'true';
  const autoPlay = getFieldValue(data, 'autoPlay', 'false') === 'true';
  const loop = getFieldValue(data, 'loop', 'false') === 'true';
  const style = getFieldValue(data, 'style', 'card');
  const bgColor = getFieldValue(data, 'backgroundColor', '#f3f4f6');
  const textColor = getFieldValue(data, 'textColor', '#000000');
  const accentColor = getFieldValue(data, 'accentColor', '#5B6EF5');
  const sectionId = getFieldValue(data, 'sectionId', '');

  if (!audioUrl) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No audio URL — set an Audio URL in the block settings.
      </div>
    );
  }

  if (style === 'minimal') {
    return (
      <section id={sectionId || undefined} className="py-4 px-6">
        {title && <p className="font-semibold text-sm mb-2" style={{ color: textColor }}>{title}</p>}
        <audio
          src={audioUrl}
          controls={showControls}
          autoPlay={autoPlay}
          loop={loop}
          className="w-full"
          style={{ accentColor }}
        />
      </section>
    );
  }

  if (style === 'full') {
    return (
      <section id={sectionId || undefined} style={{ backgroundColor: bgColor }} className="py-8 px-6">
        <div className="max-w-2xl mx-auto">
          {title && <h3 className="text-xl font-black mb-1" style={{ color: textColor }}>{title}</h3>}
          {artist && <p className="text-sm mb-4" style={{ color: accentColor }}>{artist}</p>}
          {description && (
            <div className="text-sm mb-4 prose prose-sm max-w-none" style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: description }} />
          )}
          <audio
            src={audioUrl}
            controls={showControls}
            autoPlay={autoPlay}
            loop={loop}
            className="w-full"
            style={{ accentColor }}
          />
        </div>
      </section>
    );
  }

  // card style (default)
  return (
    <section id={sectionId || undefined} className="py-8 px-6">
      <div
        className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-md"
        style={{ backgroundColor: bgColor }}
      >
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={title || 'cover'} className="w-full h-48 object-cover" />
        )}
        <div className="p-5">
          {title && <h3 className="font-black text-lg mb-0.5" style={{ color: textColor }}>{title}</h3>}
          {artist && <p className="text-sm mb-3" style={{ color: accentColor }}>{artist}</p>}
          {description && (
            <div className="text-sm mb-4 prose prose-sm max-w-none" style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: description }} />
          )}
          <audio
            src={audioUrl}
            controls={showControls}
            autoPlay={autoPlay}
            loop={loop}
            className="w-full"
            style={{ accentColor }}
          />
        </div>
      </div>
    </section>
  );
}
