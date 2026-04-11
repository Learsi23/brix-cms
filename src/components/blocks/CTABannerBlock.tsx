import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import Link from 'next/link';

export default function CTABannerBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#ffffff');
  const titleSize = getFieldValue(data, 'TitleSize', '2rem');
  const subtitle = getFieldValue(data, 'Subtitle');
  const subtitleColor = getFieldValue(data, 'SubtitleColor', 'rgba(255,255,255,0.8)');
  const btn1Text = getFieldValue(data, 'Btn1Text', 'Get started');
  const btn1Url = getFieldValue(data, 'Btn1Url', '#');
  const btn1Bg = getFieldValue(data, 'Btn1BgColor', '#ffffff');
  const btn1TextColor = getFieldValue(data, 'Btn1TextColor', '#111827');
  const btn2Text = getFieldValue(data, 'Btn2Text');
  const btn2Url = getFieldValue(data, 'Btn2Url', '#');
  const btn2Color = getFieldValue(data, 'Btn2Color', '#ffffff');
  const bgColor = getFieldValue(data, 'BackgroundColor', '#10b981');
  const bgColor2 = getFieldValue(data, 'BackgroundColor2');
  const bgImage = getFieldValue(data, 'BackgroundImage');
  const paddingY = getFieldValue(data, 'PaddingY', '5rem');
  const textAlign = getFieldValue(data, 'TextAlign', 'center') as 'left' | 'center' | 'right';

  const background = bgImage
    ? `url(${bgImage})`
    : bgColor2
      ? `linear-gradient(135deg, ${bgColor}, ${bgColor2})`
      : bgColor;

  return (
    <section
      className="relative"
      style={{
        background,
        backgroundSize: bgImage ? 'cover' : undefined,
        backgroundPosition: bgImage ? 'center' : undefined,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        textAlign,
      }}
    >
      {bgImage && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {title && (
          <h2 style={{ color: titleColor, fontSize: titleSize }} className="font-black mb-4 leading-tight">
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{ color: subtitleColor }} className="text-lg mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className={`flex flex-wrap gap-4 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
          {btn1Text && (
            <Link
              href={btn1Url}
              style={{ backgroundColor: btn1Bg, color: btn1TextColor }}
              className="px-7 py-3 font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              {btn1Text}
            </Link>
          )}
          {btn2Text && (
            <Link
              href={btn2Url}
              style={{ color: btn2Color, border: `2px solid ${btn2Color}` }}
              className="px-7 py-3 font-bold rounded-xl text-sm bg-transparent hover:opacity-90 transition-opacity"
            >
              {btn2Text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
