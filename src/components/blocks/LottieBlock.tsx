'use client';

import { useEffect, useRef } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface LottieBlockProps {
  data: BlockData;
}

export default function LottieBlock({ data }: LottieBlockProps) {
  const lottieUrl = getFieldValue(data, 'lottieUrl', '');
  const width = getFieldValue(data, 'width', '300px');
  const height = getFieldValue(data, 'height', '300px');
  const autoPlay = getFieldValue(data, 'autoPlay', 'true') === 'true';
  const loop = getFieldValue(data, 'loop', 'true') === 'true';
  const speed = parseFloat(getFieldValue(data, 'speed', '1') || '1');
  const bgColor = getFieldValue(data, 'backgroundColor', 'transparent');
  const borderRadius = getFieldValue(data, 'borderRadius', '0');
  const sectionId = getFieldValue(data, 'sectionId', '');
  const paddingY = getFieldValue(data, 'paddingY', '1rem');

  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof import('lottie-web')['default']['loadAnimation']> | null>(null);

  useEffect(() => {
    if (!lottieUrl || !containerRef.current) return;

    let cancelled = false;

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return;
      animRef.current?.destroy();
      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay: autoPlay,
        path: lottieUrl,
      });
      animRef.current.setSpeed(speed);
    });

    return () => {
      cancelled = true;
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [lottieUrl, autoPlay, loop, speed]);

  if (!lottieUrl) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No Lottie URL — set a JSON animation URL in the block settings.
      </div>
    );
  }

  return (
    <section id={sectionId || undefined} style={{ padding: `${paddingY} 0` }}>
      <div className="flex justify-center">
        <div
          ref={containerRef}
          style={{ width, height, backgroundColor: bgColor, borderRadius }}
        />
      </div>
    </section>
  );
}
