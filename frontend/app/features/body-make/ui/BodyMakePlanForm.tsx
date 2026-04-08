import { type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Minus,
  Save,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { BODY_MAKE_NOTES, BULK_GUIDE_NOTES, COURSE_META, formatPlanDate } from '../content';
import type {
  BodyMakeFieldErrors,
  BodyMakeForm,
} from '../form';
import type { PlanSafetyAssessment } from '../lib/calculations';
import { formatDurationSummary } from '../lib/calculations';
import type {
  BodyMakeApplyStartOption,
  BodyMakePlanPreview,
  GoalCourse,
} from '../types';

type Props = {
  formData: BodyMakeForm;
  fieldErrors: BodyMakeFieldErrors;
  preview: BodyMakePlanPreview | null;
  planSafety: PlanSafetyAssessment | null;
  riskAcknowledged: boolean;
  saving: boolean;
  applyStartOption: BodyMakeApplyStartOption;
  effectiveFrom: string;
  hasCurrentPlan: boolean;
  hasUpcomingPlan: boolean;
  onCourseChange: (course: GoalCourse) => void;
  onApplyStartOptionChange: (value: BodyMakeApplyStartOption) => void;
  onTargetWeightKgChange: (value: string) => void;
  onDurationDaysChange: (value: string) => void;
  onMemoChange: (value: string) => void;
  onRiskAcknowledgedChange: (checked: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

const COURSE_OPTIONS: GoalCourse[] = ['maintenance', 'diet', 'bulk'];

const renderCourseIcon = (course: GoalCourse, className: string) => {
  if (course === 'maintenance') {
    return <Minus className={className} size={30} />;
  }

  if (course === 'diet') {
    return <TrendingDown className={className} size={30} />;
  }

  return <TrendingUp className={className} size={30} />;
};

export function BodyMakePlanForm({
  formData,
  fieldErrors,
  preview,
  planSafety,
  riskAcknowledged,
  saving,
  applyStartOption,
  effectiveFrom,
  hasCurrentPlan,
  hasUpcomingPlan,
  onCourseChange,
  onApplyStartOptionChange,
  onTargetWeightKgChange,
  onDurationDaysChange,
  onMemoChange,
  onRiskAcknowledgedChange,
  onSubmit,
  onCancel,
}: Props) {
  const tomorrowRecommended = hasCurrentPlan || hasUpcomingPlan;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-2xl font-bold text-gray-900">目標を設定</h3>

      <div className="mt-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">
          コース選択 *
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COURSE_OPTIONS.map((course) => {
            const meta = COURSE_META[course];
            const selected = formData.course === course;

            return (
              <button
                key={course}
                type="button"
                onClick={() => onCourseChange(course)}
                aria-pressed={selected}
                className={`rounded-2xl border px-6 py-7 text-center transition-colors ${
                  selected
                    ? meta.selectedClass
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-center">
                  {renderCourseIcon(
                    course,
                    selected ? meta.iconClass : 'text-gray-400',
                  )}
                </div>
                <div className="mt-4 text-3xl font-semibold text-gray-900">
                  {meta.label}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {meta.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">
          適用開始 *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={applyStartOption === 'today'}
            onClick={() => onApplyStartOptionChange('today')}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
              applyStartOption === 'today'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            今日から
          </button>

          <button
            type="button"
            aria-pressed={applyStartOption === 'tomorrow'}
            onClick={() => onApplyStartOptionChange('tomorrow')}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
              applyStartOption === 'tomorrow'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {tomorrowRecommended ? '明日から（おすすめ）' : '明日から'}
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {applyStartOption === 'today'
            ? '今日のダッシュボード表示も新しい目標に切り替わります。'
            : `${formatPlanDate(effectiveFrom)}から新しい目標へ切り替わります。今日の記録はそのまま残ります。`}
        </p>
      </div>

      {formData.course !== 'maintenance' && (
        <>
          <div className="mt-6">
            <label
              htmlFor="body-make-target-weight"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              目標増減数 (kg) *
            </label>
            <input
              id="body-make-target-weight"
              type="number"
              value={formData.targetWeightKg}
              onChange={(e) => onTargetWeightKgChange(e.target.value)}
              min="0.1"
              step="0.1"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.targetWeightKg && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.targetWeightKg}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {formData.course === 'diet'
                ? '目安: 週0.5〜0.7kg程度までが無理のない減量ペースです'
                : '目安: 週0.2〜0.25kg程度の増量が筋肉中心で進めやすいです'}
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="body-make-duration-days"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              達成期間 (日) *
            </label>
            <input
              id="body-make-duration-days"
              type="number"
              value={formData.durationDays}
              onChange={(e) => onDurationDaysChange(e.target.value)}
              min="1"
              step="1"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.durationDays && (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.durationDays}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {formatDurationSummary(Number(formData.durationDays) || 0)}
            </p>
          </div>
        </>
      )}

      {formData.course === 'bulk' && (
        <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-5">
          <div className="text-lg font-semibold text-gray-900">増量のコツ</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {BULK_GUIDE_NOTES.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {planSafety && (
        <div
          className={`mt-6 rounded-3xl border p-5 ${
            planSafety.level === 'safe'
              ? 'border-emerald-200 bg-emerald-50'
              : planSafety.level === 'warning'
                ? 'border-amber-200 bg-amber-50'
                : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            {planSafety.level === 'safe' ? (
              <CheckCircle2 className="mt-0.5 text-emerald-600" size={20} />
            ) : planSafety.level === 'warning' ? (
              <Info className="mt-0.5 text-amber-600" size={20} />
            ) : planSafety.level === 'danger' ? (
              <AlertTriangle className="mt-0.5 text-red-600" size={20} />
            ) : (
              <ShieldAlert className="mt-0.5 text-red-700" size={20} />
            )}

            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900">
                {planSafety.title}
              </div>
              <p className="mt-2 text-sm text-gray-700">{planSafety.message}</p>

              {planSafety.recommendationText && (
                <p className="mt-2 text-sm font-medium text-gray-800">
                  おすすめ: {planSafety.recommendationText}
                </p>
              )}

              {planSafety.requiresAcknowledgement &&
                planSafety.acknowledgementLabel && (
                  <label className="mt-4 flex items-start gap-3 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={riskAcknowledged}
                      onChange={(e) =>
                        onRiskAcknowledgedChange(e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300"
                    />
                    <span>{planSafety.acknowledgementLabel}</span>
                  </label>
                )}
            </div>
          </div>
        </div>
      )}

      {preview && (planSafety === null || planSafety.level !== 'blocked') && (
        <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 text-blue-600" size={20} />
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900">
                目標カロリー
              </div>
              <div className="mt-2 text-4xl font-bold text-blue-600">
                {preview.targetCalories} kcal/日
              </div>
              <div className="mt-3 text-sm text-gray-600">
                維持カロリー: {preview.maintenanceCalories} kcal/日
              </div>
              <div className="mt-1 text-sm text-gray-600">
                調整量:{' '}
                {formData.course === 'diet'
                  ? `-${preview.dailyCalorieAdjustment}`
                  : formData.course === 'bulk'
                    ? `+${preview.dailyCalorieAdjustment}`
                    : '±0'}{' '}
                kcal/日
              </div>
              <div className="mt-1 text-sm text-gray-600">
                保存すると{formatPlanDate(effectiveFrom)}から開始します
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <label
          htmlFor="body-make-memo"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          メモ
        </label>
        <textarea
          id="body-make-memo"
          value={formData.memo}
          onChange={(e) => onMemoChange(e.target.value)}
          rows={4}
          placeholder="例: 夏までに理想の体型に！"
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <button
          type="submit"
          disabled={
            saving ||
            planSafety?.canSave === false ||
            (planSafety?.requiresAcknowledgement && !riskAcknowledged)
          }
          className="flex-1 rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <span className="inline-flex items-center gap-2">
            <Save size={18} />
            {saving ? '保存中...' : '設定'}
          </span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>

      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900">ボディメイクについて</h3>
        <ul className="mt-5 space-y-3 text-gray-700">
          {BODY_MAKE_NOTES.map((note) => (
            <li key={note} className="flex gap-3">
              <span className="mt-1 text-gray-400">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
