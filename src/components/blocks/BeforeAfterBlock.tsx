'use client';

import { useState, useRef, useCallback } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface BeforeAfterBlockProps {
  data: BlockData;
}

export default function BeforeAfterBlock({ data }: BeforeAfterBlockProps) {
  const beforeImage = getFieldValue(data, 'beforeImage', '');
  const afterImage = getFieldValue(data, 'afterImage', '');
  const beforeLabel = getFieldValue(data, 'beforeLabel', 'Before');
  const afterLabel = getFieldValue(data, 'afterLabel', 'After');
  const labelColor = getFieldValue(data, 'labelColor', '#ffffff');
  const labelBg = getFieldValue(data, 'labelBackground', '#000000');
  const orientation = getFieldValue(data, 'orientation', 'horizontal') as 'horizontal' | 'vertical';
  const startingPos = parseFloat(getFieldValue(data, 'startingPosition', '50') || '50');
  const width = getFieldValue(data, 'width', '100%');
  const height = getFieldValue(data, 'height', '500px');
  const borderRadius = getFieldValue(data, 'borderRadius', '0');
  const paddingY = getFieldValue(data, 'paddingY', '2rem');
  const sectionId = getFieldValue(data, 'sectionId', '');

  const [position, setPosition] = useState(startingPos);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (orientation === 'horizontal') {
      setPosition(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
    } else {
      setPosition(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)));
    }
  }, [orientation]);

  const startDrag = useCallback(() => {
    dragging.current = true;
    const stop = () => { dragging.current = false; };
    window.addEventListener('mouseup', stop, { once: true });
    window.addEventListener('touchend', stop, { once: true });
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('touchmove', updatePosition);
    setTimeout(() => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('touchmove', updatePosition);
    }, 30000);
  }, [updatePosition]);

  if (!beforeImage || !afterImage) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        Set Before Image and After Image in the block settings.
      </div>
    );
  }

  const clipAfter = orientation === 'horizontal'
    ? `inset(0 ${100 - position}% 0 0)`
    : `inset(0 0 ${100 - position}% 0)`;

  const lineStyle: React.CSSProperties = orientation === 'horizontal'
    ? { position: 'absolute', top: 0, bottom: 0, left: `${position}%`, width: '3px', transform: 'translateX(-50%)', cursor: 'ew-resize', backgroundColor: '#fff', zIndex: 10 }
    : { position: 'absolute', left: 0, right: 0, top: `${position}%`, height: '3px', transform: 'translateY(-50%)', cursor: 'ns-resize', backgroundColor: '#fff', zIndex: 10 };

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    ...(orientation === 'horizontal' ? { top: '50%', left: `${position}%`, transform: 'translate(-50%, -50%)' } : { left: '50%', top: `${position}%`, transform: 'translate(-50%, -50%)' }),
    width: 40, height: 40, borderRadius: '50%',
    backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 11, cursor: orientation === 'horizontal' ? 'ew-resize' : 'ns-resize',
    userSelect: 'none',
  };

  return (
    <section id={sectionId || undefined} style={{ padding: `${paddingY} 0` }}>
      <div className="flex justify-center">
        <div
          ref={containerRef}
          style={{ position: 'relative', width, height, borderRadius, overflow: 'hidden', userSelect: 'none' }}
          onMouseMove={e => { if (dragging.current) updatePosition(e.nativeEvent); }}
        >
          {/* Before image (full) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeImage} alt={beforeLabel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* After image (clipped) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={afterImage} alt={afterLabel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: clipAfter }} />

          {/* Divider line */}
          <div style={lineStyle} />

          {/* Drag handle */}
          <div style={handleStyle} onMouseDown={startDrag} onTouchStart={startDrag}>
            <i className={`fas ${orientation === 'horizontal' ? 'fa-arrows-left-right' : 'fa-arrows-up-down'} text-gray-600 text-xs`} />
          </div>

          {/* Labels */}
          <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: labelBg, color: labelColor, opacity: position < 20 ? 0 : 1 }}>
            {beforeLabel}
          </span>
          <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: labelBg, color: labelColor, opacity: position > 80 ? 0 : 1 }}>
            {afterLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
