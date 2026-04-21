import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  UtensilsCrossed,
} from 'lucide-react';
import { buildCalendarDays, weekdayLabels } from '../lib/calendar';
import { type DashboardMonthlyMarker } from '../types';

type DashboardCalendarProps = {
  selectedDate: string;
  visibleMonth: Date;
  todayString: string;
  markersByDate: Record<string, DashboardMonthlyMarker>;
  markerError?: string;
  onSelectDate: (dateString: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectToday: () => void;
};

export function DashboardCalendar({
  selectedDate,
  visibleMonth,
  todayString,
  markersByDate,
  markerError,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onSelectToday,
}: DashboardCalendarProps) {
  const visibleMonthLabel = useMemo(
    () =>
      visibleMonth.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
      }),
    [visibleMonth],
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, selectedDate, todayString),
    [visibleMonth, selectedDate, todayString],
  );

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Calendar</p>
          <h3 className="mt-1 text-2xl font-semibold text-gray-900">
            {visibleMonthLabel}
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            aria-label="前の月へ移動"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onSelectToday}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            今日へ
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-full border border-gray-200 p-2 text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            aria-label="次の月へ移動"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 font-medium text-red-600 ring-1 ring-red-100">
          <Dumbbell size={12} />
          筋トレ
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 font-medium text-orange-600 ring-1 ring-orange-100">
          <UtensilsCrossed size={12} />
          食事
        </span>
      </div>

      {markerError && <p className="mt-3 text-xs text-red-600">{markerError}</p>}

      <div className="mt-6 grid grid-cols-7 gap-2">
        {weekdayLabels.map((label, index) => (
          <div
            key={label}
            className={`px-2 text-center text-xs font-semibold ${
              index === 0
                ? 'text-rose-400'
                : index === 6
                  ? 'text-blue-400'
                  : 'text-gray-500'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const marker = markersByDate[day.dateString];

          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() => onSelectDate(day.dateString)}
              className={`flex aspect-square min-h-[82px] flex-col rounded-2xl border px-3 py-2 text-left transition-all ${
                day.isSelected
                  ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : day.isCurrentMonth
                    ? 'border-gray-200 bg-white text-gray-900 hover:border-blue-200 hover:bg-blue-50'
                    : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{day.dayNumber}</span>
                {!day.isCurrentMonth && (
                  <span className="text-[11px] font-medium">{day.monthNumber}月</span>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-1">
                  {marker?.hasWorkout && (
                    <span
                      title="筋トレ記録あり"
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        day.isSelected
                          ? 'bg-red-500 text-white'
                          : 'bg-red-50 text-red-600 ring-1 ring-red-100'
                      }`}
                    >
                      <Dumbbell size={10} />
                    </span>
                  )}
                  {marker?.hasMeal && (
                    <span
                      title="食事記録あり"
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        day.isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-orange-50 text-orange-600 ring-1 ring-orange-100'
                      }`}
                    >
                      <UtensilsCrossed size={10} />
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-medium">
                  {day.isSelected ? '選択中' : day.isToday ? '今日' : '\u00A0'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
