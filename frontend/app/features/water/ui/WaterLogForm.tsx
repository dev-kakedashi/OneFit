import type { FormEvent } from 'react';
import type { WaterLog, WaterLogFormData } from '../types';

type WaterLogFormProps = {
  formData: WaterLogFormData;
  editingWaterLog: WaterLog | null;
  submitting: boolean;
  onChange: (next: WaterLogFormData) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function WaterLogForm({
  formData,
  editingWaterLog,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: WaterLogFormProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        {editingWaterLog ? '水分記録を編集' : '水分記録を追加'}
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="water-amount-ml"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            水分量 (ml) *
          </label>
          <input
            id="water-amount-ml"
            type="number"
            value={formData.amountMl}
            onChange={(e) =>
              onChange({ ...formData, amountMl: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-cyan-500"
            placeholder="300"
            required
            min="1"
          />
        </div>

        <div>
          <label
            htmlFor="water-drank-at"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            日時 *
          </label>
          <input
            id="water-drank-at"
            type="datetime-local"
            value={formData.drankAt}
            onChange={(e) => onChange({ ...formData, drankAt: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="water-memo"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            メモ
          </label>
          <textarea
            id="water-memo"
            value={formData.memo}
            onChange={(e) => onChange({ ...formData, memo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-cyan-500"
            placeholder="水、お茶、炭酸水など..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-cyan-600 px-6 py-2 text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
          >
            {submitting ? '保存中...' : editingWaterLog ? '更新' : '追加'}
          </button>
          {editingWaterLog && (
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
