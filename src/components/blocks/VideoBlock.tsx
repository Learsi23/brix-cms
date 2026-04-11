import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  // Already an embed URL
  if (url.includes('/embed/') || url.includes('player.vimeo')) return url;
  return null;
}

export default function VideoBlock({ data }: { data: BlockData }) {
  const videoUrl = getFieldValue(data, 'VideoUrl');
  const aspectRatio = getFieldValue(data, 'AspectRatio', '16/9');
  const maxWidth = getFieldValue(data, 'MaxWidth', '900px');
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', '#6b7280');
  const textAlign = getFieldValue(data, 'TextAlign', 'center');
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const paddingY = getFieldValue(data, 'PaddingY', '2rem');

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
  const [w, h] = aspectRatio.split('/').map(Number);
  const paddingTop = h && w ? `${(h / w) * 100}%` : '56.25%';

  return (
    <section style={{ backgroundColor: bgColor, paddingTop: paddingY, paddingBottom: paddingY }}>
      <div className="max-w-6xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="mb-8" style={{ textAlign: textAlign as 'left' | 'center' | 'right' }}>
            {title && <h2 style={{ color: titleColor }} className="text-3xl font-black mb-3">{title}</h2>}
            {subtitle && <p style={{ color: subtitleColor }} className="text-lg">{subtitle}</p>}
          </div>
        )}
        {embedUrl ? (
          <div className="mx-auto" style={{ maxWidth }}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ paddingTop }}>
              <iframe
                src={embedUrl}
                title={title || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 bg-slate-100 rounded-2xl text-slate-400 text-sm">
            Enter a YouTube or Vimeo URL
          </div>
        )}
      </div>
    </section>
  );
}
