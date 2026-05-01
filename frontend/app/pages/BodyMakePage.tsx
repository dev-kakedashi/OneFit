import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, Target, Trash2, X } from 'lucide-react';
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
    deletingPlanId,
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
    deletePlan,
  } = useBodyMakePage();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    setShowCancelConfirm(false);
  }, [upcomingPlan?.id]);

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
        <div className="space-y-4">
          {currentPlan && (
            <BodyMakePlanSummary
              plan={currentPlan}
              title="現在有効なプラン"
            />
          )}

          {upcomingPlan && (
            <BodyMakePlanSummary
              plan={upcomingPlan}
              title={currentPlan ? '次回適用予定' : '予定中のプラン'}
              hint={`${formatPlanDate(upcomingPlan.effectiveFrom)}から自動で切り替わります`}
              variant="upcoming"
              footer={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2 text-sm text-blue-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>
                      現在のプランとは別に予約されています。誤って設定した場合は取り消せます。
                    </p>
                  </div>

                  {showCancelConfirm ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                      >
                        <X size={16} />
                        やめる
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const deleted = await deletePlan(upcomingPlan.id);
                          if (deleted) {
                            setShowCancelConfirm(false);
                          }
                        }}
                        disabled={deletingPlanId === upcomingPlan.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        <Trash2 size={16} />
                        {deletingPlanId === upcomingPlan.id
                          ? '取り消し中...'
                          : '取り消す'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                    >
                      <Trash2 size={16} />
                      予約を取り消す
                    </button>
                  )}
                </div>
              }
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
