'use client';

import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface OpeningHoursBlockProps {
  data: BlockData;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export default function OpeningHoursBlock({ data }: OpeningHoursBlockProps) {
  const title = getFieldValue(data, 'title', 'Opening Hours');
  const closedLabel = getFieldValue(data, 'closedLabel', 'Closed');
  const nowOpenLabel = getFieldValue(data, 'nowOpenLabel', "We're open now!");
  const nowClosedLabel = getFieldValue(data, 'nowClosedLabel', "We're closed right now");
  const openColor = getFieldValue(data, 'openColor', '#16a34a');
  const closedColor = getFieldValue(data, 'closedColor', '#dc2626');
  const highlightToday = getFieldValue(data, 'highlightToday', 'true') === 'true';

  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // Mon=0
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const schedule = DAYS.map((day, i) => {
    const open = getFieldValue(data, `${day}Open`, '');
    const close = getFieldValue(data, `${day}Close`, '');
    const isClosed = !open || !close;
    let isOpenNow = false;
    if (!isClosed && i === todayIndex) {
      isOpenNow = nowMinutes >= timeToMinutes(open) && nowMinutes < timeToMinutes(close);
    }
    return { label: DAY_LABELS[i], open, close, isClosed, isToday: i === todayIndex, isOpenNow };
  });

  const todaySchedule = schedule[todayIndex];
  const siteIsOpen = todaySchedule.isOpenNow;

  return (
    <section className="py-8 px-4">
      <div className="max-w-sm mx-auto">
        {title && (
          <h2 className="text-xl font-black text-gray-800 mb-4 text-center">{title}</h2>
        )}

        {/* Live status badge */}
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mb-4"
          style={{ backgroundColor: siteIsOpen ? `${openColor}20` : `${closedColor}20`, color: siteIsOpen ? openColor : closedColor }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: siteIsOpen ? openColor : closedColor }} />
          {siteIsOpen ? nowOpenLabel : nowClosedLabel}
        </div>

        {/* Schedule table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {schedule.map((day, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''} ${highlightToday && day.isToday ? 'bg-gray-50' : ''}`}
            >
              <span className={`text-sm ${highlightToday && day.isToday ? 'font-black text-gray-900' : 'text-gray-600'}`}>
                {day.label}
                {highlightToday && day.isToday && (
                  <span className="ml-2 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">today</span>
                )}
              </span>
              {day.isClosed ? (
                <span className="text-sm font-medium" style={{ color: closedColor }}>{closedLabel}</span>
              ) : (
                <span className="text-sm text-gray-700 font-medium tabular-nums">
                  {day.open} – {day.close}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
