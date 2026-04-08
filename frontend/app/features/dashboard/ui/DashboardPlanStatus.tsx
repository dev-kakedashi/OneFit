import { Link } from 'react-router';
import { Target } from 'lucide-react';
import { COURSE_META, formatPlanDate } from '../../body-make/content';
import type { DashboardSummary } from '../types';

type Props = {
  summary: DashboardSummary;
  selectedDate: string;
  todayString: string;
};

const getPlanGoalLabel = (summary: DashboardSummary): string => {
  const plan = summary.currentPlan;

  if (!plan) {
    return '';
  }

  if (plan.course === 'maintenance') {
    return '現在の体重を維持';
  }

  if (plan.targetWeightKg === null) {
    return '目標を設定中';
  }

  const sign = plan.course === 'diet' ? '-' : '+';
  return `${sign}${plan.targetWeightKg}kg を目標`;
};

const getPlanAdjustmentLabel = (summary: DashboardSummary): string => {
  const plan = summary.currentPlan;

  if (!plan || plan.dailyCalorieAdjustment === null || plan.course === 'maintenance') {
    return '±0 kcal/日';
  }

  const sign = plan.course === 'diet' ? '-' : '+';
  return `${sign}${plan.dailyCalorieAdjustment} kcal/日`;
};

const getAdjustmentColorClass = (summary: DashboardSummary): string => {
  const plan = summary.currentPlan;

  if (!plan || plan.course === 'maintenance') {
    return 'text-blue-700';
  }

  if (plan.course === 'diet') {
    return 'text-emerald-700';
  }

  return 'text-orange-700';
};

export function DashboardPlanStatus({
  summary,
  selectedDate,
  todayString,
}: Props) {
  const plan = summary.currentPlan;
  const isTodaySelected = selectedDate === todayString;
  const sectionTitle = isTodaySelected ? '現在のプラン' : 'この日のプラン';

  if (!plan) {
    return (
      <Link
        to="/body-make"
        aria-label="ボディメイク目標を設定"
        className="mt-4 block rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
              {sectionTitle}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {isTodaySelected
                ? 'ボディメイク目標を設定'
                : 'この日はボディメイクプラン未設定です'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {isTodaySelected
                ? 'ダッシュボードに現在の目標を表示できます'
                : 'ボディメイク画面で目標を設定すると、日付ごとのプランを確認できます'}
            </p>
          </div>
          <Target className="shrink-0 text-blue-500" size={20} />
        </div>
      </Link>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
            {sectionTitle}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${COURSE_META[plan.course].badgeClass}`}
            >
              {COURSE_META[plan.course].label}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {getPlanGoalLabel(summary)}
            </span>
          </div>

          {plan.targetEndDate && (
            <p className="mt-2 text-sm text-gray-500">
              {formatPlanDate(plan.targetEndDate)}まで
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
          <div className="text-[11px] font-medium text-gray-500">1日あたり調整</div>
          <div
            className={`mt-1 text-sm font-semibold ${getAdjustmentColorClass(summary)}`}
          >
            {getPlanAdjustmentLabel(summary)}
          </div>
        </div>
      </div>
    </div>
  );
}
