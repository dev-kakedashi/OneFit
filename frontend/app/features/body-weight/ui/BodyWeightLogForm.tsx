import type { FormEvent } from 'react';
import type { BodyWeightLog, BodyWeightLogFormData } from '../types';

type BodyWeightLogFormProps = {
  formData: BodyWeightLogFormData;
  editingBodyWeightLog: BodyWeightLog | null;
  submitting: boolean;
  onChange: (next: BodyWeightLogFormData) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function BodyWeightLogForm({
  formData,
  editingBodyWeightLog,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: BodyWeightLogFormProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        {editingBodyWeightLog ? '体重記録を編集' : '体重記録を追加'}
      </h3>

      <p className="mb-4 text-sm text-gray-500">
        同じ日付の記録は上書き保存されます。
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="body-weight-weight-kg"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            体重 (kg) *
          </label>
          <input
            id="body-weight-weight-kg"
            type="number"
            value={formData.weightKg}
            onChange={(e) =>
              onChange({ ...formData, weightKg: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="65.5"
            required
            min="20"
            max="300"
            step="0.1"
          />
        </div>

        <div>
          <label
            htmlFor="body-weight-measured-on"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            測定日 *
          </label>
          <input
            id="body-weight-measured-on"
            type="date"
            value={formData.measuredOn}
            onChange={(e) =>
              onChange({ ...formData, measuredOn: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="body-weight-memo"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            メモ
          </label>
          <textarea
            id="body-weight-memo"
            value={formData.memo}
            onChange={(e) => onChange({ ...formData, memo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="朝一、トレーニング後など..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? '保存中...' : editingBodyWeightLog ? '更新' : '追加'}
          </button>
          {editingBodyWeightLog && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
