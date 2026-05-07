import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import type { ReactNode, CSSProperties } from 'react';

interface FullColumnBlockProps {
  data: BlockData;
  renderedChildren?: ReactNode[];
}

export default function FullColumnBlock({ data, renderedChildren = [] }: FullColumnBlockProps) {
  const bgColor = getFieldValue(data, 'backgroundColor', '');
  const bgImage = getFieldValue(data, 'backgroundImage', '');
  const overlayOpacity = parseFloat(getFieldValue(data, 'backgroundOverlayOpacity', '0') || '0');
  const overlayColor = getFieldValue(data, 'backgroundOverlayColor', '#000000');
  const maxCols = getFieldValue(data, 'maxColumns', '3');
  const gap = getFieldValue(data, 'gap', 'gap-6');
  const paddingY = getFieldValue(data, 'paddingY', '3rem');
  const paddingX = getFieldValue(data, 'paddingX', '1.5rem');
  const paddingTop = getFieldValue(data, 'paddingTop', '');
  const paddingBottom = getFieldValue(data, 'paddingBottom', '');
  const marginTop = getFieldValue(data, 'marginTop', '');
  const marginBottom = getFieldValue(data, 'marginBottom', '');
  const itemsAlign = getFieldValue(data, 'itemsAlign', 'stretch');
  const sectionId = getFieldValue(data, 'sectionId', '');
  const minHeight = getFieldValue(data, 'minHeight', 'auto');
  const reverseOnMobile = getFieldValue(data, 'reverseOnMobile', 'false') === 'true';
  const borderRadius = getFieldValue(data, 'borderRadius', 'rounded-none');
  const shadow = getFieldValue(data, 'shadow', 'shadow-none');
  const border = getFieldValue(data, 'border', '');
  const zIndexVal = getFieldValue(data, 'zIndex', 'auto');
  const customClasses = getFieldValue(data, 'customClasses', '');
  const stickySection = getFieldValue(data, 'stickySection', 'false') === 'true';
  const stickyTopOffset = getFieldValue(data, 'stickyTopOffset', '0');
  const hideOnMobile = getFieldValue(data, 'hideOnMobile', 'false') === 'true';
  const hideOnDesktop = getFieldValue(data, 'hideOnDesktop', 'false') === 'true';

  const titleSida = getFieldValue(data, 'titleSida', '');
  const titleSidaColor = getFieldValue(data, 'titleSidaColor', '');
  const titleSidaSize = getFieldValue(data, 'titleSidaSize', '1rem');
  const titleSidaAlign = getFieldValue(data, 'titleSidaAlign', 'left');
  const title = getFieldValue(data, 'title', '');
  const titleColor = getFieldValue(data, 'titleColor', '');
  const titleSize = getFieldValue(data, 'titleSize', '2rem');
  const titleWeight = getFieldValue(data, 'titleWeight', 'bold');
  const titleAlignment = getFieldValue(data, 'titleAlignment', 'left');
  const subTitle = getFieldValue(data, 'subTitle', '');
  const subTitleColor = getFieldValue(data, 'subTitleColor', '');
  const subTitleSize = getFieldValue(data, 'subTitleSize', '1.1rem');
  const description = getFieldValue(data, 'description', '');
  const descriptionColor = getFieldValue(data, 'descriptionColor', '');

  const colClasses: Record<string, string> = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const sectionStyle: CSSProperties = {
    position: stickySection ? 'sticky' : 'relative',
    top: stickySection ? stickyTopOffset : undefined,
    minHeight,
    marginTop: marginTop || undefined,
    marginBottom: marginBottom || undefined,
    border: border || undefined,
    zIndex: zIndexVal !== 'auto' ? Number(zIndexVal) : undefined,
  };

  if (bgColor) sectionStyle.backgroundColor = bgColor;
  if (bgImage) {
    sectionStyle.backgroundImage = `url(${bgImage})`;
    sectionStyle.backgroundSize = 'cover';
    sectionStyle.backgroundPosition = 'center';
  }

  const innerPadding: CSSProperties = {
    padding: `${paddingTop || paddingY} ${paddingX} ${paddingBottom || paddingY}`,
    position: 'relative',
  };

  const hasHeader = titleSida || title || subTitle || description;
  const visibilityClass = hideOnMobile ? 'hidden md:block' : hideOnDesktop ? 'md:hidden' : '';

  return (
    <section
      id={sectionId || undefined}
      style={sectionStyle}
      className={`${borderRadius} ${shadow} ${customClasses} ${visibilityClass}`}
    >
      {bgImage && overlayOpacity > 0 && (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={innerPadding}>
        {hasHeader && (
          <div className="mb-8">
            {titleSida && (
              <p
                style={{ color: titleSidaColor || undefined, fontSize: titleSidaSize, textAlign: titleSidaAlign as CSSProperties['textAlign'] }}
                className="uppercase tracking-widest text-xs font-semibold mb-2"
              >
                {titleSida}
              </p>
            )}
            {title && (
              <h2 style={{ color: titleColor || undefined, fontSize: titleSize, fontWeight: titleWeight, textAlign: titleAlignment as CSSProperties['textAlign'] }}>
                {title}
              </h2>
            )}
            {subTitle && (
              <p style={{ color: subTitleColor || undefined, fontSize: subTitleSize }} className="mt-2">
                {subTitle}
              </p>
            )}
            {description && (
              <div
                style={{ color: descriptionColor || undefined }}
                className="prose prose-sm max-w-none mt-3"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>
        )}
        <div
          className={`grid ${colClasses[maxCols] ?? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} ${gap} ${reverseOnMobile ? 'flex-col-reverse' : ''}`}
          style={{ alignItems: itemsAlign }}
        >
          {renderedChildren.map((child, i) => (
            <div key={i}>{child}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
