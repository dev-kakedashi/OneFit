import { Droplets, Pencil, Trash2 } from 'lucide-react';
import type { WaterLog } from '../types';

type WaterLogListProps = {
  waterLogs: WaterLog[];
  loading: boolean;
  onEdit: (waterLog: WaterLog) => void;
  onDelete: (id: number) => void;
  onCreateFirst: () => void;
};

export function WaterLogList({
  waterLogs,
  loading,
  onEdit,
  onDelete,
  onCreateFirst,
}: WaterLogListProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <p className="text-gray-600">水分記録を読み込み中です...</p>
      </div>
    );
  }

  if (waterLogs.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <div className="mb-4 text-6xl">💧</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          まだ水分記録がありません
        </h3>
        <p className="mb-4 text-gray-600">
          水分摂取量を記録して、1日の達成状況を確認しましょう
        </p>
        <button
          type="button"
          onClick={onCreateFirst}
          className="rounded-lg bg-cyan-600 px-6 py-2 text-white transition-colors hover:bg-cyan-700"
        >
          最初の記録を追加
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {waterLogs.map((waterLog) => (
        <div
          key={waterLog.id}
          className="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-3">
                <h4 className="font-semibold text-gray-900">水分摂取</h4>
                <span className="text-lg font-bold text-cyan-600">
                  {waterLog.amountMl} ml
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(waterLog.drankAt).toLocaleString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {waterLog.memo && (
                <p className="mt-2 text-sm text-gray-600">{waterLog.memo}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(waterLog)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-cyan-50 hover:text-cyan-600"
                title="編集"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(waterLog.id)}
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
