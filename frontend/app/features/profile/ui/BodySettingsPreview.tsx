import type { BodySettings } from '../types';

type BodySettingsPreviewProps = {
  previewSettings: BodySettings | null;
  bmr: number | null;
  tdee: number | null;
};

export function BodySettingsPreview({
  previewSettings,
  bmr,
  tdee,
}: BodySettingsPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
        <h3 className="mb-2 text-lg font-semibold opacity-90">基礎代謝 (BMR)</h3>
        <div className="mb-2 text-4xl font-bold">
          {bmr ?? '--'} <span className="text-xl opacity-90">kcal/日</span>
        </div>
        <p className="text-sm opacity-80">
          必須項目を入力すると preview が表示されます
        </p>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
        <h3 className="mb-2 text-lg font-semibold opacity-90">必要カロリー (TDEE)</h3>
        <div className="mb-2 text-4xl font-bold">
          {tdee ?? '--'} <span className="text-xl opacity-90">kcal/日</span>
        </div>
        <p className="text-sm opacity-80">
          backend と同じ計算式で求めた維持カロリー
        </p>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 p-6 text-white shadow-lg">
        <h3 className="mb-2 text-lg font-semibold opacity-90">目標水分量</h3>
        <div className="mb-2 text-4xl font-bold">
          {previewSettings?.dailyWaterGoalMl ?? '--'}
          <span className="ml-2 text-xl opacity-90">ml/日</span>
        </div>
        <p className="text-sm opacity-80">
          ダッシュボードの水滴表示と日次の達成状況に使用されます
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h4 className="mb-2 font-semibold text-gray-900">計算について</h4>
        <p className="text-sm leading-relaxed text-gray-600">
          Harris-Benedict方程式を使って基礎代謝を算出し、活動レベルを掛けて必要カロリーを計算しています。
          表示値は backend の計算ルールに合わせて整数化しています。
        </p>
      </div>
    </div>
  );
}
