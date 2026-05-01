import { useMemo } from 'react';
import { Link } from 'react-router';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { toDateAtMidnight } from '../lib/calendar';
import { type DashboardSummary } from '../types';
import type { BodyWeightLog } from '../../body-weight/types';
import { DashboardHydrationCard } from './DashboardHydrationCard';
import { DashboardPlanStatus } from './DashboardPlanStatus';

type DashboardOverviewProps = {
  selectedDate: string;
  todayString: string;
  summary: DashboardSummary;
  latestBodyWeightLog?: BodyWeightLog | null;
  bodyWeightLoading?: boolean;
  bodyWeightError?: string;
};

export function DashboardOverview({
  selectedDate,
  todayString,
  summary,
  latestBodyWeightLog = null,
  bodyWeightLoading = false,
  bodyWeightError = '',
}: DashboardOverviewProps) {
  const selectedDateObject = useMemo(
    () => toDateAtMidnight(selectedDate),
    [selectedDate],
  );

  const selectedDateLabel = useMemo(
    () =>
      selectedDateObject.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
    [selectedDateObject],
  );

  const selectedDayMeta = useMemo(
    () =>
      selectedDateObject.toLocaleDateString('ja-JP', {
        month: 'long',
        weekday: 'long',
      }),
    [selectedDateObject],
  );

  const calorieGoal = summary.targetCalories ?? 0;
  const remainingCalories =
    summary.calorieBalance === null ? 0 : summary.calorieBalance;
  const progressPercentage =
    calorieGoal > 0 ? Math.round((summary.intakeCalories / calorieGoal) * 100) : 0;
  const progressWidth =
    calorieGoal > 0
      ? Math.min((summary.intakeCalories / calorieGoal) * 100, 100)
      : 0;
  const isOverGoal = calorieGoal > 0 && summary.intakeCalories > calorieGoal;

  const balanceDescription =
    remainingCalories > 0
      ? `あと${remainingCalories}kcal摂取できます`
      : remainingCalories < 0
        ? `${Math.abs(remainingCalories)}kcalオーバーです`
        : '目標達成！';

  const renderBalanceIcon = (neutralClass = 'text-gray-600', size = 24) => {
    if (remainingCalories > 0) {
      return <TrendingDown className="text-green-600" size={size} />;
    }

    if (remainingCalories < 0) {
      return <TrendingUp className="text-red-600" size={size} />;
    }

    return <Minus className={neutralClass} size={size} />;
  };

  const getBalanceColor = (neutralClass = 'text-gray-600') => {
    if (remainingCalories > 0) {
      return 'text-green-600';
    }

    if (remainingCalories < 0) {
      return 'text-red-600';
    }

    return neutralClass;
  };

  return (
    <>
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Selected day</p>
            <h3 className="mt-1 text-2xl font-semibold text-gray-900">
              {selectedDateLabel}
            </h3>
          </div>
          {selectedDate === todayString && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              TODAY
            </span>
          )}
        </div>

        <DashboardPlanStatus
          summary={summary}
          selectedDate={selectedDate}
          todayString={todayString}
          latestBodyWeightLog={latestBodyWeightLog}
          bodyWeightLoading={bodyWeightLoading}
          bodyWeightError={bodyWeightError}
        />

        <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
            Daily focus
          </p>

          <div className="mt-4 flex items-end gap-4">
            <span className="text-6xl font-semibold leading-none">
              {selectedDateObject.getDate()}
            </span>
            <div className="pb-2 text-sm text-slate-300">{selectedDayMeta}</div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs font-medium text-slate-300">摂取</div>
              <div className="mt-2 text-2xl font-semibold">
                {summary.intakeCalories}
                <span className="ml-1 text-sm text-slate-300">kcal</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs font-medium text-slate-300">消費</div>
              <div className="mt-2 text-2xl font-semibold">
                {summary.burnedCalories}
                <span className="ml-1 text-sm text-slate-300">kcal</span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-white/10 p-4">
            <div className="text-xs font-medium text-slate-300">食事予算</div>
            <div className="mt-2 flex items-center gap-2">
              {renderBalanceIcon('text-white', 22)}
              <div
                className={`text-2xl font-semibold ${getBalanceColor('text-white')}`}
              >
                {remainingCalories}
                <span className="ml-1 text-sm text-slate-300">kcal</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-300">{balanceDescription}</p>
          </div>

          <DashboardHydrationCard
            waterIntakeMl={summary.waterIntakeMl}
            targetWaterIntakeMl={summary.targetWaterIntakeMl}
            remainingWaterIntakeMl={summary.remainingWaterIntakeMl}
          />
        </div>
      </section>

      <div className="space-y-6 xl:col-span-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-1 text-sm text-gray-600">目標カロリー</div>
            <div className="text-3xl font-bold text-blue-600">
              {calorieGoal}
              <span className="ml-1 text-lg text-gray-600">kcal</span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-1 text-sm text-gray-600">摂取カロリー</div>
            <div className="text-3xl font-bold text-orange-600">
              {summary.intakeCalories}
              <span className="ml-1 text-lg text-gray-600">kcal</span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-1 text-sm text-gray-600">消費カロリー</div>
            <div className="text-3xl font-bold text-purple-600">
              {summary.burnedCalories}
              <span className="ml-1 text-lg text-gray-600">kcal</span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-1 text-sm text-gray-600">残り摂取可能カロリー</div>
            <div className="flex items-center gap-2">
              {renderBalanceIcon()}
              <div className={`text-3xl font-bold ${getBalanceColor()}`}>
                {remainingCalories}
                <span className="ml-1 text-lg text-gray-600">kcal</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">{balanceDescription}</div>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          運動による消費は参考値として表示しています。食事予算には自動で加算しません。
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedDateLabel} の食事進捗
            </span>
            <span className="text-sm text-gray-600">{progressPercentage}%</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                isOverGoal ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.max(0, progressWidth)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Link
            to="/meals"
            className="rounded-lg bg-orange-500 p-6 text-white transition-colors hover:bg-orange-600"
          >
            <h3 className="mb-2 text-xl font-semibold">食事を記録</h3>
            <p className="text-orange-100">日付ごとの食事を記録できます</p>
          </Link>

          <Link
            to="/workouts"
            className="rounded-lg bg-purple-500 p-6 text-white transition-colors hover:bg-purple-600"
          >
            <h3 className="mb-2 text-xl font-semibold">トレーニングを記録</h3>
            <p className="text-purple-100">日付ごとの運動を記録できます</p>
          </Link>

          <Link
            to="/water-logs"
            className="rounded-lg bg-cyan-500 p-6 text-white transition-colors hover:bg-cyan-600"
          >
            <h3 className="mb-2 text-xl font-semibold">水分を記録</h3>
            <p className="text-cyan-100">飲んだ水分量を日付ごとに記録できます</p>
          </Link>
        </div>
      </div>
    </>
  );
}
