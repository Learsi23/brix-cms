import Link from 'next/link';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

const HEIGHT_MAP: Record<string, string> = {
  'full-screen': 'min-h-screen',
  'half-screen': 'min-h-[65vh]',
  'compact':     'min-h-[42vh]',
};

const ALIGN_MAP: Record<string, string> = {
  left:   'items-start text-left',
  center: 'items-center text-center',
  right:  'items-end text-right',
};

export default function HeroBlock({ data }: { data: BlockData }) {
  const title           = getFieldValue(data, 'Title');
  const titleColor      = getFieldValue(data, 'TitleColor',      '#ffffff');
  const titleSize       = getFieldValue(data, 'TitleSize',       '3.5rem');
  const subtitle        = getFieldValue(data, 'Subtitle');
  const subtitleColor   = getFieldValue(data, 'SubtitleColor',   '#e2e8f0');
  const subtitleSize    = getFieldValue(data, 'SubtitleSize',    '1.2rem');
  const description     = getFieldValue(data, 'Description');
  const background      = getFieldValue(data, 'Background');
  const bgColor         = getFieldValue(data, 'BackgroundColor', '#0f172a');
  const overlayColor    = getFieldValue(data, 'OverlayColor',    '#000000');
  const overlayOpacity  = parseFloat(getFieldValue(data, 'OverlayOpacity', '0.45'));
  const height          = getFieldValue(data, 'Height',          'half-screen');
  const textAlign       = getFieldValue(data, 'TextAlign',       'center');
  const buttonText      = getFieldValue(data, 'ButtonText');
  const buttonUrl       = getFieldValue(data, 'ButtonUrl',       '#');
  const buttonColor     = getFieldValue(data, 'ButtonColor',     '#3b82f6');
  const buttonTextColor = getFieldValue(data, 'ButtonTextColor', '#ffffff');

  const heightClass = HEIGHT_MAP[height]    ?? 'min-h-[65vh]';
  const alignClass  = ALIGN_MAP[textAlign]  ?? 'items-center text-center';

  return (
    <section
      className={`relative flex flex-col justify-center px-6 py-24 ${heightClass}`}
      style={{
        backgroundImage:    background ? `url(${background})` : undefined,
        backgroundSize:     'cover',
        backgroundPosition: 'center center',
        backgroundRepeat:   'no-repeat',
        backgroundColor:    bgColor,
      }}
    >
      {/* Dynamic overlay — uses OverlayColor + OverlayOpacity from block data */}
      {background && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: Number.isFinite(overlayOpacity) ? overlayOpacity : 0.45,
          }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 mx-auto w-full max-w-4xl flex flex-col gap-5 ${alignClass}`}>
        {title && (
          <h1
            className="font-black leading-tight"
            style={{ color: titleColor, fontSize: titleSize }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            className="max-w-2xl leading-relaxed"
            style={{ color: subtitleColor, fontSize: subtitleSize }}
          >
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-white/75 text-lg max-w-xl">{description}</p>
        )}
        {buttonText && (
          <div className="mt-2">
            <Link
              href={buttonUrl}
              className="inline-block px-8 py-3 rounded-xl font-bold text-base transition-opacity hover:opacity-85"
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
            >
              {buttonText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
