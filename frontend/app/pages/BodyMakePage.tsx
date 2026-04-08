import { type FormEvent } from 'react';
import { Link } from 'react-router';
import { Target } from 'lucide-react';
import { formatPlanDate } from '../features/body-make/content';
import { BodyMakePlanForm } from '../features/body-make/ui/BodyMakePlanForm';
import { BodyMakePlanSummary } from '../features/body-make/ui/BodyMakePlanSummary';
import { useBodyMakePage } from '../features/body-make/hooks/useBodyMakePage';

export function BodyMakePage() {
  const {
    profileExists,
    currentPlan,
    upcomingPlan,
    hasAnyPlan,
    formData,
    fieldErrors,
    loading,
    saving,
    showForm,
    saved,
    error,
    riskAcknowledged,
    applyStartOption,
    effectiveFrom,
    preview,
    planSafety,
    openForm,
    cancelForm,
    changeCourse,
    changeTargetWeightKg,
    changeDurationDays,
    changeMemo,
    setRiskAcknowledged,
    setApplyStartOption,
    submitPlan,
  } = useBodyMakePage();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPlan();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">ボディメイク設定を読み込み中です...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">ボディメイク</h2>
          <p className="mt-2 text-sm text-gray-600">
            コースと目標期間から、1日の目標カロリーを設定できます。
          </p>
        </div>

        {profileExists && (
          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Target size={18} />
            {hasAnyPlan ? '目標を再設定' : '目標を設定'}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          保存しました！
        </div>
      )}

      {!profileExists && (
        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="text-xl font-semibold text-yellow-900">
            まずは身体設定を入力してください
          </h3>
          <p className="mt-2 text-sm text-yellow-800">
            維持カロリーを計算するために、身長・体重・年齢・活動レベルの登録が必要です。
          </p>
          <Link
            to="/body-settings"
            className="mt-4 inline-flex rounded-xl bg-yellow-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
          >
            身体設定に移動
          </Link>
        </div>
      )}

      {(currentPlan || upcomingPlan) && (
        <div
          className={`grid grid-cols-1 gap-4 ${
            currentPlan && upcomingPlan ? 'xl:grid-cols-2' : ''
          }`}
        >
          {currentPlan && (
            <BodyMakePlanSummary
              plan={currentPlan}
              title="現在のプラン"
            />
          )}

          {upcomingPlan && (
            <BodyMakePlanSummary
              plan={upcomingPlan}
              title={currentPlan ? '次に切り替わるプラン' : '予定中のプラン'}
              hint={`${formatPlanDate(upcomingPlan.effectiveFrom)}から適用`}
              variant="upcoming"
            />
          )}
        </div>
      )}

      {profileExists && showForm && (
        <BodyMakePlanForm
          formData={formData}
          fieldErrors={fieldErrors}
          preview={preview}
          planSafety={planSafety}
          riskAcknowledged={riskAcknowledged}
          saving={saving}
          applyStartOption={applyStartOption}
          effectiveFrom={effectiveFrom}
          hasCurrentPlan={currentPlan !== null}
          hasUpcomingPlan={upcomingPlan !== null}
          onCourseChange={changeCourse}
          onApplyStartOptionChange={setApplyStartOption}
          onTargetWeightKgChange={changeTargetWeightKg}
          onDurationDaysChange={changeDurationDays}
          onMemoChange={changeMemo}
          onRiskAcknowledgedChange={setRiskAcknowledged}
          onSubmit={handleSubmit}
          onCancel={cancelForm}
        />
      )}
    </div>
  );
}
