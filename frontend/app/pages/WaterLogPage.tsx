import { useState, type FormEvent } from 'react';
import { Droplets, Plus, X } from 'lucide-react';
import {
  deleteWaterLog,
  getWaterLogs,
  saveWaterLog,
  updateWaterLog,
} from '../features/water/api';
import {
  createInitialWaterLogFormData,
  toWaterLogFormData,
} from '../features/water/lib/waterLogForm';
import type { WaterLog } from '../features/water/types';
import { WaterLogForm } from '../features/water/ui/WaterLogForm';
import { WaterLogList } from '../features/water/ui/WaterLogList';
import { useDailyLogPage } from '../shared/hooks/useDailyLogPage';
import { formatDateTimeForApi } from '../shared/lib/date';
import { getErrorMessage } from '../shared/api/client';

export function WaterLogPage() {
  const [submitting, setSubmitting] = useState(false);

  const {
    editingItem: editingWaterLog,
    error,
    formData,
    handleDelete,
    handleEdit,
    items: waterLogs,
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
  } = useDailyLogPage<WaterLog, ReturnType<typeof createInitialWaterLogFormData>>(
    {
      createInitialFormData: createInitialWaterLogFormData,
      deleteConfirmMessage: 'この水分記録を削除しますか？',
      deleteErrorMessage: '水分記録の削除に失敗しました。',
      getItemDate: (waterLog) => waterLog.drankAt,
      getItems: getWaterLogs,
      loadErrorMessage: '水分記録の取得に失敗しました。',
      toFormData: toWaterLogFormData,
      deleteItem: deleteWaterLog,
    },
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        amountMl: Number(formData.amountMl),
        drankAt: formatDateTimeForApi(formData.drankAt),
        memo: formData.memo.trim() || undefined,
      };

      if (editingWaterLog) {
        await updateWaterLog(editingWaterLog.id, payload);
      } else {
        await saveWaterLog(payload);
      }

      resetForm();
      await loadItems(selectedDate);
    } catch (err) {
      setError(getErrorMessage(err, '水分記録の保存に失敗しました。'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalWaterIntake = waterLogs.reduce(
    (sum, waterLog) => sum + waterLog.amountMl,
    0,
  );

  const shouldShowWaterLogList = !showForm || waterLogs.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">水分記録</h2>
          <p className="mt-1 text-sm text-gray-600">{selectedDateLabel} の記録</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="button"
            onClick={toggleForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-white transition-colors hover:bg-cyan-700"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'キャンセル' : '水分を追加'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-gray-700">選択日の水分摂取量</div>
            <div className="mt-1 text-sm text-gray-600">
              {waterLogs.length}件の記録
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Droplets className="text-cyan-600" size={28} />
            <span className="text-2xl font-bold text-cyan-600">
              {totalWaterIntake} ml
            </span>
          </div>
        </div>
      </div>

      {showForm && (
        <WaterLogForm
          formData={formData}
          editingWaterLog={editingWaterLog}
          submitting={submitting}
          onChange={(next) => setFormData(next)}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <div>
        <h3 className="mb-4 text-xl font-semibold text-gray-900">記録一覧</h3>
        {shouldShowWaterLogList && (
          <WaterLogList
            waterLogs={waterLogs}
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
