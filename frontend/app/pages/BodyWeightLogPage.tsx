import { useState, type FormEvent } from 'react';
import { Plus, Scale, X } from 'lucide-react';
import {
  deleteBodyWeightLog,
  getBodyWeightLogs,
  saveBodyWeightLog,
} from '../features/body-weight/api';
import {
  createInitialBodyWeightLogFormData,
  toBodyWeightLogFormData,
} from '../features/body-weight/lib/bodyWeightLogForm';
import { formatWeightKg } from '../features/body-weight/lib/format';
import { BodyWeightLogForm } from '../features/body-weight/ui/BodyWeightLogForm';
import { BodyWeightLogList } from '../features/body-weight/ui/BodyWeightLogList';
import type { BodyWeightLog } from '../features/body-weight/types';
import { useDailyLogPage } from '../shared/hooks/useDailyLogPage';
import { getErrorMessage } from '../shared/api/client';

export function BodyWeightLogPage() {
  const [submitting, setSubmitting] = useState(false);

  const {
    editingItem: editingBodyWeightLog,
    error,
    formData,
    handleDelete,
    handleEdit,
    items: bodyWeightLogs,
    loadItems,
    loading,
    resetForm,
    selectedDate,
    selectedDateLabel,
    setError,
    setFormData,
    setSelectedDate,
    showForm,
    toggleForm,
  } = useDailyLogPage<BodyWeightLog, ReturnType<typeof createInitialBodyWeightLogFormData>>({
    createInitialFormData: createInitialBodyWeightLogFormData,
    deleteConfirmMessage: 'この体重記録を削除しますか？',
    deleteErrorMessage: '体重記録の削除に失敗しました。',
    getItemDate: (bodyWeightLog) => bodyWeightLog.measuredOn,
    getItems: getBodyWeightLogs,
    loadErrorMessage: '体重記録の取得に失敗しました。',
    toFormData: toBodyWeightLogFormData,
    deleteItem: deleteBodyWeightLog,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      const savedDate = formData.measuredOn;
      const payload = {
        measuredOn: savedDate,
        weightKg: Number(formData.weightKg),
        memo: formData.memo.trim() || undefined,
      };

      await saveBodyWeightLog(payload);

      resetForm();
      if (savedDate === selectedDate) {
        await loadItems(savedDate);
      } else {
        setSelectedDate(savedDate);
      }
    } catch (err) {
      setError(getErrorMessage(err, '体重記録の保存に失敗しました。'));
    } finally {
      setSubmitting(false);
    }
  };

  const latestBodyWeightLog = bodyWeightLogs[0] ?? null;
  const shouldShowBodyWeightList = !showForm || bodyWeightLogs.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">体重記録</h2>
          <p className="mt-1 text-sm text-gray-600">{selectedDateLabel} の記録</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={toggleForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'キャンセル' : '体重を追加'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-gray-700">選択日の体重</div>
            <div className="mt-1 text-sm text-gray-600">
              {bodyWeightLogs.length}件の記録
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Scale className="text-blue-600" size={28} />
            <span className="text-2xl font-bold text-blue-600">
              {latestBodyWeightLog
                ? `${formatWeightKg(latestBodyWeightLog.weightKg)} kg`
                : '未記録'}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          同じ日付の記録は上書き保存されます。
        </p>
      </div>

      {showForm && (
        <BodyWeightLogForm
          formData={formData}
          editingBodyWeightLog={editingBodyWeightLog}
          submitting={submitting}
          onChange={(next) => setFormData(next)}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <div>
        <h3 className="mb-4 text-xl font-semibold text-gray-900">記録一覧</h3>
        {shouldShowBodyWeightList && (
          <BodyWeightLogList
            bodyWeightLogs={bodyWeightLogs}
            loading={loading}
            onEdit={handleEdit}
            onDelete={(id) => void handleDelete(id)}
            onCreateFirst={toggleForm}
          />
        )}
      </div>
    </div>
  );
}
