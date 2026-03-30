import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { getErrorMessage } from '../shared/api/client';
import {
  deleteWorkout,
  getWorkouts,
  saveWorkout,
  updateWorkout,
} from '../features/workouts/api';
import { type Workout } from '../features/workouts/types';
import {
  buildDefaultDateTime,
  formatDateTimeForApi,
  formatDateTimeInputValue,
  getTodayString,
} from '../shared/lib/date';


const createInitialFormData = (date: string) => ({
  exercise: '',
  caloriesBurned: '',
  date: buildDefaultDateTime(date),
  memo: '',
});

export function WorkoutLogPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(() =>
    createInitialFormData(getTodayString()),
  );

  const selectedDateLabel = useMemo(
    () =>
      new Date(`${selectedDate}T00:00:00`).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [selectedDate],
  );

  // workout 一覧も meal と同じく日付単位取得なので、選択日を切り替えて表示する。
  const loadWorkouts = async (targetDate: string) => {
    try {
      setLoading(true);
      setError('');
      const records = await getWorkouts(targetDate);
      const sorted = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setWorkouts(sorted);
    } catch (err) {
      setError(getErrorMessage(err, 'トレーニング記録の取得に失敗しました。'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkouts(selectedDate);
  }, [selectedDate]);

  // 日付変更時に新規作成用の初期値だけ更新し、既存レコード編集中はフォーム内容を保持する。
  useEffect(() => {
    if (!editingWorkout) {
      setFormData(createInitialFormData(selectedDate));
    }
  }, [selectedDate, editingWorkout]);

  const resetForm = () => {
    setFormData(createInitialFormData(selectedDate));
    setEditingWorkout(null);
    setShowForm(false);
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
      return;
    }

    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      // API 契約に合わせた整形は送信時にまとめて行い、state には入力しやすい値を保持する。
      const payload = {
        exercise: formData.exercise.trim(),
        caloriesBurned: Number(formData.caloriesBurned),
        date: formatDateTimeForApi(formData.date),
        memo: formData.memo.trim() || undefined,
      };

      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, payload);
      } else {
        await saveWorkout(payload);
      }

      resetForm();
      await loadWorkouts(selectedDate);
    } catch (err) {
      setError(getErrorMessage(err, 'トレーニング記録の保存に失敗しました。'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setFormData({
      exercise: workout.exercise,
      caloriesBurned: workout.caloriesBurned.toString(),
      date: formatDateTimeInputValue(workout.date),
      memo: workout.memo || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このトレーニング記録を削除しますか？')) {
      return;
    }

    try {
      setError('');
      await deleteWorkout(id);
      await loadWorkouts(selectedDate);
    } catch (err) {
      setError(getErrorMessage(err, 'トレーニング記録の削除に失敗しました。'));
    }
  };

  const totalCalories = workouts.reduce(
    (sum, workout) => sum + workout.caloriesBurned,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">トレーニング記録</h2>
          <p className="mt-1 text-sm text-gray-600">{selectedDateLabel} の記録</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={toggleForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'キャンセル' : 'トレーニングを追加'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">選択日の消費カロリー</span>
          <span className="text-2xl font-bold text-purple-600">
            {totalCalories} kcal
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {workouts.length}件のトレーニング
        </div>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            {editingWorkout ? 'トレーニングを編集' : 'トレーニングを追加'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                種目 *
              </label>
              <input
                type="text"
                value={formData.exercise}
                onChange={(e) =>
                  setFormData({ ...formData, exercise: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                placeholder="ランニング、筋トレ、ヨガなど"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                消費カロリー (kcal) *
              </label>
              <input
                type="number"
                value={formData.caloriesBurned}
                onChange={(e) =>
                  setFormData({ ...formData, caloriesBurned: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                placeholder="300"
                required
                min="0"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                日時 *
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                メモ
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) =>
                  setFormData({ ...formData, memo: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                placeholder="距離、時間、セット数など..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
              >
                {submitting ? '保存中...' : editingWorkout ? '更新' : '追加'}
              </button>
              {editingWorkout && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 className="mb-4 text-xl font-semibold text-gray-900">記録一覧</h3>

        {loading ? (
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <p className="text-gray-600">トレーニング記録を読み込み中です...</p>
          </div>
        ) : workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">
                        {workout.exercise}
                      </h4>
                      <span className="text-lg font-bold text-purple-600">
                        {workout.caloriesBurned} kcal
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {workout.memo && (
                      <p className="mt-2 text-sm text-gray-600">
                        {workout.memo}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(workout)}
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                      title="編集"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => void handleDelete(workout.id)}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                      title="削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white py-12 text-center shadow">
            <p className="mb-4 text-gray-500">
              {selectedDateLabel} のトレーニング記録はまだありません
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700"
            >
              <Plus size={20} />
              最初のトレーニングを追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
