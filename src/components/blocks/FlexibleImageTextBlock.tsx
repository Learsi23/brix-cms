import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function FlexibleImageTextBlock({ data }: { data: BlockData }) {
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const bgImage = getFieldValue(data, 'BackgroundImage');
  const bgOpacity = getFieldValue(data, 'BackgroundOpacity', '1');
  const paddingV = getFieldValue(data, 'PaddingVertical', 'py-12');
  const paddingH = getFieldValue(data, 'PaddingHorizontal', 'px-6');
  const layout = getFieldValue(data, 'Layout', 'image-left');
  const vAlign = getFieldValue(data, 'VerticalAlignment', 'center');
  const gap = getFieldValue(data, 'Gap', 'gap-8');

  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize = getFieldValue(data, 'TitleSize', 'text-3xl');
  const titleWeight = getFieldValue(data, 'TitleWeight', 'font-bold');
  const titleMb = getFieldValue(data, 'TitleMarginBottom', 'mb-4');

  const subTitle = getFieldValue(data, 'SubTitle');
  const subTitleColor = getFieldValue(data, 'SubTitleColor', '#000000');
  const subTitleSize = getFieldValue(data, 'SubTitleSize', 'text-xl');
  const subTitleMb = getFieldValue(data, 'SubTitleMarginBottom', 'mb-3');

  const image = getFieldValue(data, 'Image');
  const imageWidth = getFieldValue(data, 'ImageWidth', 'w-full');
  const imageMaxW = getFieldValue(data, 'ImageMaxWidth', 'max-w-full');
  const imageRadius = getFieldValue(data, 'ImageBorderRadius', 'rounded-lg');
  const imageShadow = getFieldValue(data, 'ImageShadow', 'shadow-lg');

  const text = getFieldValue(data, 'Text');
  const textColor = getFieldValue(data, 'TextColor', '#000000');
  const textSize = getFieldValue(data, 'TextSize', 'text-base');

  const buttonText = getFieldValue(data, 'ButtonText');
  const buttonLink = getFieldValue(data, 'ButtonLink');
  const buttonStyle = getFieldValue(data, 'ButtonStyle', 'primary');

  const isRow = layout === 'image-left' || layout === 'image-right';
  const isReverse = layout === 'image-right';

  const alignMap: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end' };

  const buttonStyles: Record<string, string> = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500',
    secondary: 'bg-slate-600 text-white hover:bg-slate-500',
    outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50',
  };

  return (
    <div
      className={`${paddingV} ${paddingH} relative`}
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {bgImage && (
        <div className="absolute inset-0 bg-black" style={{ opacity: parseFloat(bgOpacity) }} />
      )}

      <div className={`relative z-10 flex ${isRow ? 'flex-row' : 'flex-col'} ${isReverse ? 'flex-row-reverse' : ''} ${gap} ${alignMap[vAlign] ?? 'items-center'}`}>
        {/* Imagen */}
        {image && (
          <div className={`${isRow ? 'flex-1' : 'w-full'}`}>
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className={`${imageWidth} ${imageMaxW} ${imageRadius} ${imageShadow}`}
            />
          </div>
        )}

        {/* Texto */}
        <div className={`${isRow ? 'flex-1' : 'w-full'}`}>
          {title && (
            <h2 className={`${titleSize} ${titleWeight} ${titleMb}`} style={{ color: titleColor }}>
              {title}
            </h2>
          )}
          {subTitle && (
            <h3 className={`${subTitleSize} font-semibold ${subTitleMb}`} style={{ color: subTitleColor }}>
              {subTitle}
            </h3>
          )}
          {text && (
            <p className={`${textSize} leading-relaxed whitespace-pre-wrap`} style={{ color: textColor }}>
              {text}
            </p>
          )}
          {buttonText && buttonLink && (
            <a
              href={buttonLink}
              className={`inline-block mt-4 px-6 py-3 rounded-lg font-bold transition-colors ${buttonStyles[buttonStyle] ?? buttonStyles.primary}`}
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
