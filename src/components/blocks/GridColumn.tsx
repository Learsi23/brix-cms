'use client';

import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import type { ReactNode } from 'react';

interface GridColumnProps {
  data: BlockData;
  renderedChildren?: ReactNode[];
}

export default function GridColumn({ data, renderedChildren = [] }: GridColumnProps) {
  const backgroundColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const backgroundImage = getFieldValue(data, 'BackgroundImage');
  const backgroundOverlayOpacity = getFieldValue(data, 'BackgroundOverlayOpacity', '0');
  const backgroundOverlayColor = getFieldValue(data, 'BackgroundOverlayColor', '#000000');
  const maxColumns = getFieldValue(data, 'MaxColumns', '3');
  const gap = getFieldValue(data, 'Gap', 'gap-6');
  const paddingY = getFieldValue(data, 'PaddingY', '3rem');
  const paddingX = getFieldValue(data, 'PaddingX', '1.5rem');
  const itemsAlign = getFieldValue(data, 'ItemsAlign', 'stretch');
  const sectionId = getFieldValue(data, 'SectionId');

  const titleSida = getFieldValue(data, 'TitleSida');
  const titleSidaColor = getFieldValue(data, 'TitleSidaColor', '#1eb300');
  const titleSidaSize = getFieldValue(data, 'TitleSidaSize', '200px');
  const titleSidaAlign = getFieldValue(data, 'TitleSidaAlign', 'left');

  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#000000');
  const titleSize = getFieldValue(data, 'TitleSize');

  const subTitle = getFieldValue(data, 'SubTitle');
  const subTitleColor = getFieldValue(data, 'SubTitleColor', '#000000');
  const subTitleSize = getFieldValue(data, 'SubTitleSize');

  const description = getFieldValue(data, 'Description');
  const descriptionColor = getFieldValue(data, 'DescriptionColor');

  const headerTextAlign = getFieldValue(data, 'HeaderTextAlign', 'left');

  const gridColsClass = `grid-cols-1 md:grid-cols-2 lg:grid-cols-${maxColumns}`;

  const alignClass = itemsAlign === 'start' ? 'items-start' :
                     itemsAlign === 'center' ? 'items-center' :
                     itemsAlign === 'end' ? 'items-end' : 'items-stretch';

  const headerWidthClass = 'max-w-7xl mx-auto';

  const overlayStyle = backgroundOverlayOpacity !== '0' ? {
    backgroundColor: backgroundOverlayColor,
    opacity: parseFloat(backgroundOverlayOpacity),
  } : {};

  return (
    <div 
      id={sectionId || undefined}
      className="relative overflow-hidden" 
      style={{ 
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: paddingY,
        paddingBottom: paddingY,
        paddingLeft: paddingX,
        paddingRight: paddingX,
      }}
    >
      {backgroundImage && backgroundOverlayOpacity !== '0' && (
        <div className="absolute inset-0 z-0" style={overlayStyle} />
      )}

      <div className="relative z-10">
        <div className={headerWidthClass}>
          {titleSida && (
            <p 
              className="font-bold tracking-tight mb-4"
              style={{ 
                color: titleSidaColor, 
                fontSize: titleSidaSize,
                textAlign: titleSidaAlign as 'left' | 'center' | 'right'
              }}
            >
              {titleSida}
            </p>
          )}
          
          {title && (
            <h2 
              className="font-bold mb-4" 
              style={{ 
                color: titleColor, 
                fontSize: titleSize || undefined,
                textAlign: headerTextAlign as 'left' | 'center' | 'right'
              }}
            >
              {title}
            </h2>
          )}
          
          {subTitle && (
            <h3 
              className="font-medium mb-6"
              style={{ 
                color: subTitleColor, 
                fontSize: subTitleSize || undefined,
                textAlign: headerTextAlign as 'left' | 'center' | 'right'
              }}
            >
              {subTitle}
            </h3>
          )}

          {description && (
            <p 
              className="mb-8 text-gray-600"
              style={{ 
                color: descriptionColor,
                textAlign: headerTextAlign as 'left' | 'center' | 'right'
              }}
            >
              {description}
            </p>
          )}

          <div className={`grid ${gridColsClass} ${gap} ${alignClass}`}>
            {renderedChildren.map((child, i) => (
              <div
                key={i}
                className="h-full"
                style={{
                  animation: `fadeIn 0.6s ease-out ${0.1 * i}s forwards`,
                  opacity: 0,
                }}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
