import { Pencil, Scale, Trash2 } from 'lucide-react';
import { formatBodyWeightDate, formatWeightKg } from '../lib/format';
import type { BodyWeightLog } from '../types';

type BodyWeightLogListProps = {
  bodyWeightLogs: BodyWeightLog[];
  loading: boolean;
  onEdit: (bodyWeightLog: BodyWeightLog) => void;
  onDelete: (id: number) => void;
  onCreateFirst: () => void;
};

export function BodyWeightLogList({
  bodyWeightLogs,
  loading,
  onEdit,
  onDelete,
  onCreateFirst,
}: BodyWeightLogListProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <p className="text-gray-600">体重記録を読み込み中です...</p>
      </div>
    );
  }

  if (bodyWeightLogs.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <div className="mb-4 flex justify-center">
          <Scale className="text-blue-500" size={48} />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          まだ体重記録がありません
        </h3>
        <p className="mb-4 text-gray-600">
          体重を記録して、ボディメイクの変化を見える化しましょう
        </p>
        <button
          type="button"
          onClick={onCreateFirst}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          最初の記録を追加
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bodyWeightLogs.map((bodyWeightLog) => (
        <div
          key={bodyWeightLog.id}
          className="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-3">
                <h4 className="font-semibold text-gray-900">体重</h4>
                <span className="text-lg font-bold text-blue-600">
                  {formatWeightKg(bodyWeightLog.weightKg)} kg
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {formatBodyWeightDate(bodyWeightLog.measuredOn)}
              </div>
              {bodyWeightLog.memo && (
                <p className="mt-2 text-sm text-gray-600">
                  {bodyWeightLog.memo}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(bodyWeightLog)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                title="編集"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(bodyWeightLog.id)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                title="削除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
