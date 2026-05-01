import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CalendarRange,
  Droplets,
  Flame,
  RefreshCw,
  Scale,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import { addDaysToDateOnly, formatDateOnly } from '../../../shared/lib/date';
import { useDashboardPeriodSummary } from '../hooks/useDashboardPeriodSummary';
import { getWeekRange, toDateAtMidnight } from '../lib/calendar';
import { formatWeightDeltaKg, formatWeightKg } from '../../body-weight/lib/format';

type DashboardCrossSummaryProps = {
  todayString: string;
};

const formatDateLabel = (value: string | Date): string =>
  toDateAtMidnight(value).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

const formatWholeNumber = (value: number): string =>
  new Intl.NumberFormat('ja-JP').format(Math.round(value));

const formatPercent = (value: number): string => `${Math.round(value)}%`;

const formatKcalRatio = (value: number, target: number): string =>
  `${formatWholeNumber(value)} / ${formatWholeNumber(target)} kcal`;

const formatWaterRatio = (value: number, target: number): string =>
  `${formatWholeNumber(value)} / ${formatWholeNumber(target)} ml`;

type MetricCardProps = {
  label: string;
  value: string;
  caption: string;
  tone: 'orange' | 'rose' | 'emerald' | 'cyan' | 'slate';
  icon: ReactNode;
};

const toneClasses = {
  orange: {
    card: 'border-orange-100 bg-orange-50/80',
    label: 'text-orange-700',
    value: 'text-orange-800',
    icon: 'bg-orange-100 text-orange-700',
  },
  rose: {
    card: 'border-rose-100 bg-rose-50/80',
    label: 'text-rose-700',
    value: 'text-rose-800',
    icon: 'bg-rose-100 text-rose-700',
  },
  emerald: {
    card: 'border-emerald-100 bg-emerald-50/80',
    label: 'text-emerald-700',
    value: 'text-emerald-800',
    icon: 'bg-emerald-100 text-emerald-700',
  },
  cyan: {
    card: 'border-cyan-100 bg-cyan-50/80',
    label: 'text-cyan-700',
    value: 'text-cyan-800',
    icon: 'bg-cyan-100 text-cyan-700',
  },
  slate: {
    card: 'border-slate-200 bg-slate-50/80',
    label: 'text-slate-600',
    value: 'text-slate-900',
    icon: 'bg-slate-100 text-slate-700',
  },
} as const;

const MetricCard = ({
  label,
  value,
  caption,
  tone,
  icon,
}: MetricCardProps) => {
  const classes = toneClasses[tone];

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${classes.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={`text-xs font-semibold uppercase tracking-[0.24em] ${classes.label}`}
          >
            {label}
          </div>
          <div className={`mt-2 text-2xl font-semibold ${classes.value}`}>
            {value}
          </div>
          <div className="mt-1 text-sm text-slate-500">{caption}</div>
        </div>

        <div className={`rounded-xl p-2 ${classes.icon}`}>{icon}</div>
      </div>
    </div>
  );
};

export function DashboardCrossSummary({ todayString }: DashboardCrossSummaryProps) {
  const currentWeekStartDate = useMemo(
    () => formatDateOnly(getWeekRange(todayString).startDate),
    [todayString],
  );
  const [weekStartDate, setWeekStartDate] = useState(currentWeekStartDate);
  const { summary, loading, error, reload } =
    useDashboardPeriodSummary(weekStartDate);

  useEffect(() => {
    setWeekStartDate(currentWeekStartDate);
  }, [currentWeekStartDate]);

  const weekRange = useMemo(() => getWeekRange(weekStartDate), [weekStartDate]);
  const periodLabel = `${formatDateLabel(weekRange.startDate)} 〜 ${formatDateLabel(weekRange.endDate)}`;
  const isCurrentWeek = weekStartDate === currentWeekStartDate;

  const calorieTargetTotal = summary?.calorieTargetTotal ?? null;
  const waterTargetTotalMl = summary?.waterTargetTotalMl ?? null;
  const calorieAchievementRate =
    summary && calorieTargetTotal && calorieTargetTotal > 0
      ? (summary.intakeCalories / calorieTargetTotal) * 100
      : null;
  const waterAchievementRate =
    summary && waterTargetTotalMl && waterTargetTotalMl > 0
      ? (summary.waterIntakeMl / waterTargetTotalMl) * 100
      : null;

  const weightCard = useMemo(() => {
    if (!summary) {
      return {
        value: '—',
        caption: '記録を読み込んでいます',
        icon: <Scale size={18} />,
        tone: 'slate' as const,
      };
    }

    if (summary.bodyWeightLogCount === 0) {
      return {
        value: '—',
        caption: summary.profileRegistered
          ? 'まだ体重記録がありません'
          : '身体設定を登録すると表示されます',
        icon: <Scale size={18} />,
        tone: 'slate' as const,
      };
    }

    if (
      summary.bodyWeightStartKg === null ||
      summary.bodyWeightEndKg === null
    ) {
      return {
        value: '—',
        caption: '体重の集計に失敗しました',
        icon: <Scale size={18} />,
        tone: 'slate' as const,
      };
    }

    const changeKg = summary.bodyWeightChangeKg ?? 0;

    return {
      value: formatWeightDeltaKg(changeKg),
      caption: `週初め ${formatWeightKg(summary.bodyWeightStartKg)}kg → 最新 ${formatWeightKg(summary.bodyWeightEndKg ?? summary.bodyWeightStartKg)}kg`,
      icon:
        changeKg > 0 ? (
          <TrendingUp size={18} className="text-rose-700" />
        ) : changeKg < 0 ? (
          <TrendingDown size={18} className="text-emerald-700" />
        ) : (
          <Scale size={18} />
        ),
      tone:
        changeKg > 0
          ? ('rose' as const)
          : changeKg < 0
            ? ('emerald' as const)
            : ('slate' as const),
    };
  }, [summary]);

  const statusChips = summary
    ? [
        `記録のある日 ${summary.recordedDayCount}/${summary.windowDays}日`,
        `食事 ${summary.mealDayCount}日`,
        `運動 ${summary.workoutDayCount}日`,
        `水分 ${summary.waterDayCount}日`,
        `体重 ${summary.bodyWeightDayCount}日`,
        summary.profileRegistered ? 'プロフィール登録済み' : 'プロフィール未登録',
      ]
    : [];

  const moveWeek = (days: number) => {
    setWeekStartDate((current) => addDaysToDateOnly(current, days));
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
            <CalendarRange size={14} />
            WEEK SUMMARY
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            週間サマリー
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            月曜始まり・日曜終わりの1週間の食事・運動・水分・体重をまとめて確認できます。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            表示期間: {periodLabel}
            {isCurrentWeek && (
              <span className="ml-2 inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                今週
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => moveWeek(-7)}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            前週
          </button>
          <button
            type="button"
            onClick={() => setWeekStartDate(currentWeekStartDate)}
            className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition-colors hover:bg-sky-100"
          >
            今週に戻す
          </button>
          <button
            type="button"
            onClick={() => moveWeek(7)}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            次週
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-56 rounded-full bg-slate-200" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`cross-summary-skeleton-${index}`}
                  className="h-28 rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            <RefreshCw size={16} />
            再読み込み
          </button>
        </div>
      ) : summary ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={
                calorieTargetTotal !== null ? '摂取達成率' : '摂取量'
              }
              value={
                calorieAchievementRate !== null
                  ? formatPercent(calorieAchievementRate)
                  : `${formatWholeNumber(summary.intakeCalories)} kcal`
              }
              caption={
                calorieTargetTotal !== null && calorieTargetTotal > 0
                  ? formatKcalRatio(summary.intakeCalories, calorieTargetTotal)
                  : `${formatWholeNumber(summary.intakeCalories)} kcal`
              }
              tone="orange"
              icon={<UtensilsCrossed size={18} />}
            />
            <MetricCard
              label="消費総量"
              value={`${formatWholeNumber(summary.burnedCalories)} kcal`}
              caption="週合計"
              tone="rose"
              icon={<Flame size={18} />}
            />
            <MetricCard
              label={waterTargetTotalMl !== null ? '水分達成率' : '水分摂取量'}
              value={
                waterAchievementRate !== null
                  ? formatPercent(waterAchievementRate)
                  : `${formatWholeNumber(summary.waterIntakeMl)} ml`
              }
              caption={
                waterTargetTotalMl !== null && waterTargetTotalMl > 0
                  ? formatWaterRatio(summary.waterIntakeMl, waterTargetTotalMl)
                  : `${formatWholeNumber(summary.waterIntakeMl)} ml`
              }
              tone="cyan"
              icon={<Droplets size={18} />}
            />
            <MetricCard
              label="体重変化"
              value={weightCard.value}
              caption={weightCard.caption}
              tone={weightCard.tone}
              icon={weightCard.icon}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {statusChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
