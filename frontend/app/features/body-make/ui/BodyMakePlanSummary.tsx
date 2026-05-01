import type { ReactNode } from 'react';
import { COURSE_META, formatPlanDate } from '../content';
import type { BodyMakePlan } from '../types';

type Props = {
  plan: BodyMakePlan;
  title: string;
  hint?: string;
  variant?: 'current' | 'upcoming';
  footer?: ReactNode;
};

export function BodyMakePlanSummary({
  plan,
  title,
  hint,
  variant = 'current',
  footer,
}: Props) {
  const isUpcoming = variant === 'upcoming';

  return (
    <section
      className={`rounded-3xl border p-6 shadow-sm ${
        isUpcoming
          ? 'border-blue-100 bg-blue-50/40'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isUpcoming && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                予約済み
              </span>
            )}
          </div>
          {hint && (
            <p
              className={`mt-1 text-sm ${
                isUpcoming ? 'text-blue-700' : 'text-gray-500'
              }`}
            >
              {hint}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${COURSE_META[plan.course].badgeClass}`}
            >
              {COURSE_META[plan.course].label}
            </span>
            <span className="text-sm text-gray-500">
              {formatPlanDate(plan.effectiveFrom)} 開始
            </span>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-sm text-gray-500">目標カロリー</div>
          <div className="text-3xl font-bold text-blue-600">
            {plan.targetCalories} kcal/日
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white/80 p-4">
          <div className="text-sm text-gray-500">維持カロリー</div>
          <div className="mt-2 text-xl font-semibold text-gray-900">
            {plan.maintenanceCalories} kcal/日
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 p-4">
          <div className="text-sm text-gray-500">調整量</div>
          <div className="mt-2 text-xl font-semibold text-gray-900">
            {plan.course === 'diet'
              ? `-${plan.dailyCalorieAdjustment}`
              : plan.course === 'bulk'
                ? `+${plan.dailyCalorieAdjustment}`
                : '±0'}
            {' kcal/日'}
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 p-4">
          <div className="text-sm text-gray-500">
            {isUpcoming ? '適用開始日' : '目標期間'}
          </div>
          {isUpcoming ? (
            <>
              <div className="mt-2 text-base font-semibold text-gray-900">
                {formatPlanDate(plan.effectiveFrom)}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                この日から切り替わります
              </div>
            </>
          ) : (
            <>
              <div className="mt-2 text-base font-semibold text-gray-900">
                {formatPlanDate(plan.effectiveFrom)} 〜{' '}
                {formatPlanDate(plan.targetEndDate)}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {plan.course === 'maintenance'
                  ? '現状維持'
                  : `${plan.targetWeightKg}kg / ${plan.durationDays}日`}
              </div>
            </>
          )}
        </div>
      </div>

      {plan.memo && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white/80 p-4">
          <div className="text-sm font-medium text-gray-500">メモ</div>
          <p className="mt-2 text-gray-700">{plan.memo}</p>
        </div>
      )}

      {footer && (
        <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
          {footer}
        </div>
      )}
    </section>
  );
}
