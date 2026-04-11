'use client';

import { useState, useEffect } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title', '');
  const targetDate = getFieldValue(data, 'TargetDate', '');
  const onEndText = getFieldValue(data, 'OnEndText', "It's over!");
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');
  const textColor = getFieldValue(data, 'TextColor', '#1f2937');
  const digitBg = getFieldValue(data, 'DigitBgColor', '#1f2937');
  const digitColor = getFieldValue(data, 'DigitColor', '#ffffff');
  const showLabels = getFieldValue(data, 'ShowLabels', 'true') === 'true';

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!targetDate) return;
    setTimeLeft(calcTimeLeft(targetDate));
    const interval = setInterval(() => {
      const t = calcTimeLeft(targetDate);
      setTimeLeft(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: timeLeft?.days },
    { label: 'Hours', value: timeLeft?.hours },
    { label: 'Mins', value: timeLeft?.minutes },
    { label: 'Secs', value: timeLeft?.seconds },
  ];

  return (
    <section style={{ backgroundColor: bgColor, padding: '3rem 0' }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        {title && (
          <h2 style={{ color: textColor }} className="text-2xl font-black mb-8">
            {title}
          </h2>
        )}

        {!mounted ? null : !timeLeft ? (
          <p style={{ color: textColor }} className="text-xl font-bold">{onEndText}</p>
        ) : (
          <div className="flex justify-center gap-4 flex-wrap">
            {units.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-sm tabular-nums"
                  style={{ backgroundColor: digitBg, color: digitColor }}
                >
                  {String(value ?? 0).padStart(2, '0')}
                </div>
                {showLabels && (
                  <span style={{ color: textColor }} className="text-xs font-semibold uppercase tracking-wider">
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
