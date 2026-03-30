import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { deleteMeal, getMeals, saveMeal, updateMeal } from '../features/meals/api';
import { type Meal } from '../features/meals/types';
import {
  buildDefaultDateTime,
  formatDateTimeForApi,
  formatDateTimeInputValue,
} from '../shared/lib/date';
import { useDailyLogPage } from '../shared/hooks/useDailyLogPage';
import { getErrorMessage } from '../shared/api/client';

const createInitialFormData = (date: string) => ({
  name: '',
  calories: '',
  date: buildDefaultDateTime(date),
  memo: '',
});

const toFormData = (meal: Meal) => ({
  name: meal.name,
  calories: meal.calories.toString(),
  date: formatDateTimeInputValue(meal.date),
  memo: meal.memo || '',
});

export function MealLogPage() {
  const [submitting, setSubmitting] = useState(false);

  const {
    editingItem: editingMeal,
    error,
    formData,
    handleDelete,
    handleEdit,
    items: meals,
    loadItems,
    loading,
    resetForm,
    selectedDate,
    selectedDateLabel,
    setError,
    setFormData,
    setShowForm,
    setSelectedDate,
    showForm,
    toggleForm,
  } = useDailyLogPage<Meal, ReturnType<typeof createInitialFormData>>({
    createInitialFormData,
    deleteConfirmMessage: 'この食事記録を削除しますか？',
    deleteErrorMessage: '食事記録の削除に失敗しました。',
    getItemDate: (meal) => meal.date,
    getItems: getMeals,
    loadErrorMessage: '食事記録の取得に失敗しました。',
    toFormData,
    deleteItem: deleteMeal,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        name: formData.name.trim(),
        calories: Number(formData.calories),
        date: formatDateTimeForApi(formData.date),
        memo: formData.memo.trim() || undefined,
      };

      if (editingMeal) {
        await updateMeal(editingMeal.id, payload);
      } else {
        await saveMeal(payload);
      }

      resetForm();
      await loadItems(selectedDate);
    } catch (err) {
      setError(getErrorMessage(err, '食事記録の保存に失敗しました。'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">食事記録</h2>
          <p className="mt-1 text-sm text-gray-600">{selectedDateLabel} の記録</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={toggleForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'キャンセル' : '食事を追加'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">選択日の摂取カロリー</span>
          <span className="text-2xl font-bold text-orange-600">
            {totalCalories} kcal
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600">{meals.length}件の食事</div>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            {editingMeal ? '食事を編集' : '食事を追加'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                食事名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                placeholder="朝食、ランチ、夕食など"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                カロリー (kcal) *
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) =>
                  setFormData({ ...formData, calories: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                placeholder="500"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                placeholder="料理の詳細など..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-orange-600 px-6 py-2 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {submitting ? '保存中...' : editingMeal ? '更新' : '追加'}
              </button>
              {editingMeal && (
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
            <p className="text-gray-600">食事記録を読み込み中です...</p>
          </div>
        ) : meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                      <span className="text-lg font-bold text-orange-600">
                        {meal.calories} kcal
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(meal.date).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {meal.memo && (
                      <p className="mt-2 text-sm text-gray-600">{meal.memo}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(meal)}
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                      title="編集"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => void handleDelete(meal.id)}
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
              {selectedDateLabel} の食事記録はまだありません
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 text-white transition-colors hover:bg-orange-700"
            >
              <Plus size={20} />
              最初の食事を追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
