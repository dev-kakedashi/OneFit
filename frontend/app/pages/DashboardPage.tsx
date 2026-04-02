import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { getErrorMessage } from '../shared/api/client';
import { getDailySummary } from '../features/dashboard/api';
import { type DashboardSummary } from '../features/dashboard/types';
import { getTodayString } from '../shared/lib/date';


export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ダッシュボード集計は backend を正とし、frontend 側では今日のサマリー取得だけを担当する。
  const loadSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDailySummary(getTodayString());
      setSummary(data);
    } catch (err) {
      setError(getErrorMessage(err, 'ダッシュボードの取得に失敗しました。'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 text-center shadow">
        <p className="text-gray-600">ダッシュボードを読み込み中です...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-4 text-red-700">{error}</p>
        <button
          onClick={() => void loadSummary()}
          className="rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!summary?.profileRegistered) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-yellow-900">
            まずは身体設定を入力してください
          </h2>
          <p className="mb-4 text-yellow-700">
            目標カロリーを計算するために、身体情報の登録が必要です。
          </p>
          <Link
            to="/body-settings"
            className="inline-block rounded-lg bg-yellow-600 px-6 py-2 text-white transition-colors hover:bg-yellow-700"
          >
            身体設定に移動
          </Link>
        </div>
      </div>
    );
  }

  const calorieGoal = summary.targetCalories ?? 0;
  const netCalories = summary.intakeCalories - summary.burnedCalories;

  // backend の calorie_balance は「摂取 - 消費 - 目標」なので、画面の「残り」は符号を反転して扱う。
  const remaining =
    summary.calorieBalance === null ? 0 : -summary.calorieBalance;
  const progressPercentage =
    calorieGoal > 0 ? Math.round((netCalories / calorieGoal) * 100) : 0;
  const progressWidth =
    calorieGoal > 0 ? Math.min((netCalories / calorieGoal) * 100, 100) : 0;

  const getBalanceIcon = () => {
    if (remaining > 0) {
      return <TrendingDown className="text-green-600" size={24} />;
    }

    if (remaining < 0) {
      return <TrendingUp className="text-red-600" size={24} />;
    }

    return <Minus className="text-gray-600" size={24} />;
  };

  const getBalanceColor = () => {
    if (remaining > 0) {
      return 'text-green-600';
    }

    if (remaining < 0) {
      return 'text-red-600';
    }

    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">今日の目標カロリー</div>
          <div className="text-3xl font-bold text-blue-600">
            {calorieGoal}
            <span className="ml-1 text-lg text-gray-600">kcal</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">今日の摂取カロリー</div>
          <div className="text-3xl font-bold text-orange-600">
            {summary.intakeCalories}
            <span className="ml-1 text-lg text-gray-600">kcal</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">今日の消費カロリー</div>
          <div className="text-3xl font-bold text-purple-600">
            {summary.burnedCalories}
            <span className="ml-1 text-lg text-gray-600">kcal</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">今日のカロリー収支</div>
          <div className="flex items-center gap-2">
            {getBalanceIcon()}
            <div className={`text-3xl font-bold ${getBalanceColor()}`}>
              {remaining > 0 ? '+' : ''}
              {remaining}
              <span className="ml-1 text-lg text-gray-600">kcal</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {remaining > 0
              ? `あと${remaining}kcal摂取できます`
              : remaining < 0
                ? `${Math.abs(remaining)}kcalオーバーです`
                : '目標達成！'}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">進捗状況</span>
          <span className="text-sm text-gray-600">{progressPercentage}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all ${
              netCalories > calorieGoal ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.max(0, progressWidth)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/meals"
          className="rounded-lg bg-orange-500 p-6 text-white transition-colors hover:bg-orange-600"
        >
          <h3 className="mb-2 text-xl font-semibold">食事を記録</h3>
          <p className="text-orange-100">日付ごとの食事を記録できます</p>
        </Link>
        <Link
          to="/workouts"
          className="rounded-lg bg-purple-500 p-6 text-white transition-colors hover:bg-purple-600"
        >
          <h3 className="mb-2 text-xl font-semibold">トレーニングを記録</h3>
          <p className="text-purple-100">日付ごとの運動を記録できます</p>
        </Link>
      </div>
    </div>
  );
}
