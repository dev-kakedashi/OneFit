import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useDashboardCalendarMarkers } from '../features/dashboard/hooks/useDashboardCalendarMarkers';
import { useDashboardSummary } from '../features/dashboard/hooks/useDashboardSummary';
import {
  addMonths,
  getMonthStart,
  toDateAtMidnight,
} from '../features/dashboard/lib/calendar';
import { DashboardCalendar } from '../features/dashboard/ui/DashboardCalendar';
import { DashboardOverview } from '../features/dashboard/ui/DashboardOverview';
import { useLatestBodyWeightLog } from '../features/body-weight/hooks/useLatestBodyWeightLog';
import { formatDateOnly, getTodayString } from '../shared/lib/date';

export function DashboardPage() {
  const todayString = getTodayString();
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(todayString),
  );

  const { summary, loading, error, reload } = useDashboardSummary(selectedDate);
  const {
    latestBodyWeightLog,
    loading: bodyWeightLoading,
    error: bodyWeightError,
  } = useLatestBodyWeightLog(selectedDate);
  const visibleMonthString = useMemo(
    () => formatDateOnly(visibleMonth),
    [visibleMonth],
  );
  const { markersByDate, error: markerError } =
    useDashboardCalendarMarkers(visibleMonthString);

  const selectedDateLabel = useMemo(
    () =>
      toDateAtMidnight(selectedDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
    [selectedDate],
  );

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setVisibleMonth(getMonthStart(dateString));
  };

  if (loading && !summary) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 text-center shadow">
        <p className="text-gray-600">
          {selectedDateLabel} のダッシュボードを読み込み中です...
        </p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-4 text-red-700">{error}</p>
        <button
          onClick={reload}
          className="rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  if (!summary.profileRegistered) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-yellow-900">
            まずは身体設定を入力してください
          </h2>
          <p className="mb-4 text-yellow-700">
            目標カロリーを計算するために、身体情報の登録が必要です。
          </p>
          <Link
            to="/body-settings"
            className="inline-block rounded-lg bg-yellow-600 px-6 py-2 text-white transition-colors hover:bg-yellow-700"
          >
            身体設定に移動
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && summary && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
          <p className="mt-1 text-sm text-gray-600">
            カレンダーから日付を切り替えて、その日の食事と運動バランスを確認できます。
          </p>
        </div>
        <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          {selectedDateLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <DashboardCalendar
          selectedDate={selectedDate}
          visibleMonth={visibleMonth}
          todayString={todayString}
          markersByDate={markersByDate}
          markerError={markerError}
          onSelectDate={handleSelectDate}
          onPreviousMonth={() =>
            setVisibleMonth((current) => addMonths(current, -1))
          }
          onNextMonth={() => setVisibleMonth((current) => addMonths(current, 1))}
          onSelectToday={() => handleSelectDate(todayString)}
        />
        <DashboardOverview
          selectedDate={selectedDate}
          todayString={todayString}
          summary={summary}
          latestBodyWeightLog={latestBodyWeightLog}
          bodyWeightLoading={bodyWeightLoading}
          bodyWeightError={bodyWeightError}
        />
      </div>
    </div>
  );
}
