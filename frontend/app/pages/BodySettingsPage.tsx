import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { getErrorMessage } from '../shared/api/client';
import { getBodySettings, saveBodySettings } from '../features/profile/api';
import { type BodySettings } from '../features/profile/types';
import { calculateBMR, calculateTDEE } from '../features/profile/lib/calculations';


type BodySettingsForm = {
  height: string;
  weight: string;
  age: string;
  gender: BodySettings['gender'];
  activityLevel: BodySettings['activityLevel'];
};

type FieldErrors = Partial<Record<'height' | 'weight' | 'age', string>>;

const EMPTY_FORM: BodySettingsForm = {
  height: '',
  weight: '',
  age: '',
  gender: 'male',
  activityLevel: 'moderate',
};

const GENDER_OPTIONS: Array<{
  value: BodySettings['gender'];
  label: string;
}> = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
];

const ACTIVITY_LEVEL_OPTIONS: Array<{
  value: BodySettings['activityLevel'];
  label: string;
}> = [
  { value: 'sedentary', label: 'ほとんど運動しない' },
  { value: 'light', label: '軽い運動（週1-3日）' },
  { value: 'moderate', label: '中程度の運動（週3-5日）' },
  { value: 'active', label: '激しい運動（週6-7日）' },
  { value: 'very_active', label: '非常に激しい運動' },
];

const toFormData = (settings: BodySettings): BodySettingsForm => ({
  height: String(settings.height),
  weight: String(settings.weight),
  age: String(settings.age),
  gender: settings.gender,
  activityLevel: settings.activityLevel,
});

const buildSettings = (formData: BodySettingsForm): BodySettings | null => {
  if (!formData.height || !formData.weight || !formData.age) {
    return null;
  }

  const height = Number(formData.height);
  const weight = Number(formData.weight);
  const age = Number(formData.age);

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    !Number.isFinite(age) ||
    height <= 0 ||
    weight <= 0 ||
    age <= 0
  ) {
    return null;
  }

  return {
    height,
    weight,
    age,
    gender: formData.gender,
    activityLevel: formData.activityLevel,
  };
};

const validateForm = (formData: BodySettingsForm): FieldErrors => {
  const errors: FieldErrors = {};
  const height = Number(formData.height);
  const weight = Number(formData.weight);
  const age = Number(formData.age);

  if (!formData.height) {
    errors.height = '身長を入力してください。';
  } else if (!Number.isFinite(height) || height < 100 || height > 250) {
    errors.height = '身長は 100〜250cm で入力してください。';
  }

  if (!formData.weight) {
    errors.weight = '体重を入力してください。';
  } else if (!Number.isFinite(weight) || weight < 30 || weight > 200) {
    errors.weight = '体重は 30〜200kg で入力してください。';
  }

  if (!formData.age) {
    errors.age = '年齢を入力してください。';
  } else if (!Number.isFinite(age) || age < 10 || age > 120) {
    errors.age = '年齢は 10〜120 歳で入力してください。';
  }

  return errors;
};

export function BodySettingsPage() {
  const [formData, setFormData] = useState<BodySettingsForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const profile = await getBodySettings();

        if (profile) {
          setFormData(toFormData(profile));
        }
      } catch (err) {
        setError(getErrorMessage(err, 'プロフィールの取得に失敗しました。'));
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const previewSettings = buildSettings(formData);
  const bmr = previewSettings ? calculateBMR(previewSettings) : null;
  const tdee = previewSettings ? calculateTDEE(previewSettings) : null;

  // 保存時だけ厳密に検証し、backend へは正規化済みの値を渡す。
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    const errors = validateForm(formData);
    setFieldErrors(errors);
    setSaved(false);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const settings = buildSettings(formData);
    if (!settings) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      const savedProfile = await saveBodySettings(settings);
      setFormData(toFormData(savedProfile));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'プロフィールの保存に失敗しました。'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 text-center shadow">
        <p className="text-gray-600">プロフィールを読み込み中です...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">身体設定</h2>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={(e) => void handleSave(e)}
          className="space-y-4 rounded-lg bg-white p-6 shadow"
        >
          <h3 className="mb-4 text-xl font-semibold text-gray-900">基本情報</h3>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              身長 (cm)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => {
                setFormData({ ...formData, height: e.target.value });
                setFieldErrors({ ...fieldErrors, height: undefined });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              min="100"
              max="250"
              placeholder="170"
            />
            {fieldErrors.height && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.height}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              体重 (kg)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => {
                setFormData({ ...formData, weight: e.target.value });
                setFieldErrors({ ...fieldErrors, weight: undefined });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              min="30"
              max="200"
              step="0.1"
              placeholder="60"
            />
            {fieldErrors.weight && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.weight}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              年齢
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => {
                setFormData({ ...formData, age: e.target.value });
                setFieldErrors({ ...fieldErrors, age: undefined });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              min="10"
              max="120"
              placeholder="30"
            />
            {fieldErrors.age && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.age}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              性別
            </label>
            <div className="flex flex-wrap gap-4">
              {GENDER_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={formData.gender === option.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as BodySettings['gender'],
                      })
                    }
                    className="mr-2"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              活動レベル
            </label>
            <select
              value={formData.activityLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  activityLevel: e.target.value as BodySettings['activityLevel'],
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Save size={20} />
            {saving ? '保存中...' : '保存'}
          </button>

          {saved && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-green-800">
              保存しました！
            </div>
          )}
        </form>

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

          <div className="rounded-lg bg-white p-6 shadow">
            <h4 className="mb-2 font-semibold text-gray-900">計算について</h4>
            <p className="text-sm leading-relaxed text-gray-600">
              Harris-Benedict方程式を使って基礎代謝を算出し、活動レベルを掛けて必要カロリーを計算しています。
              表示値は backend の計算ルールに合わせて整数化しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
