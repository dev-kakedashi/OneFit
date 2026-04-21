import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { getBodySettings, saveBodySettings } from '../features/profile/api';
import {
  buildBodySettings,
  EMPTY_BODY_SETTINGS_FORM,
  type BodySettingsForm,
  type FieldErrors,
  toBodySettingsFormData,
  validateBodySettingsForm,
} from '../features/profile/lib/bodySettingsForm';
import { calculateBMR, calculateTDEE } from '../features/profile/lib/calculations';
import { type BodySettings } from '../features/profile/types';
import { BodySettingsPreview } from '../features/profile/ui/BodySettingsPreview';
import { getErrorMessage } from '../shared/api/client';

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

export function BodySettingsPage() {
  const [formData, setFormData] = useState<BodySettingsForm>(
    EMPTY_BODY_SETTINGS_FORM,
  );
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
          setFormData(toBodySettingsFormData(profile));
        }
      } catch (err) {
        setError(getErrorMessage(err, 'プロフィールの取得に失敗しました。'));
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const previewSettings = buildBodySettings(formData);
  const bmr = previewSettings ? calculateBMR(previewSettings) : null;
  const tdee = previewSettings ? calculateTDEE(previewSettings) : null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    const errors = validateBodySettingsForm(formData);
    setFieldErrors(errors);
    setSaved(false);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const settings = buildBodySettings(formData);
    if (!settings) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      const savedProfile = await saveBodySettings(settings);
      setFormData(toBodySettingsFormData(savedProfile));
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
            <label
              htmlFor="body-height"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              身長 (cm)
            </label>
            <input
              id="body-height"
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
            <label
              htmlFor="body-weight"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              体重 (kg)
            </label>
            <input
              id="body-weight"
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
            <label
              htmlFor="body-age"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              年齢
            </label>
            <input
              id="body-age"
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
            <label
              htmlFor="body-activity-level"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              活動レベル
            </label>
            <select
              id="body-activity-level"
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

          <div>
            <label
              htmlFor="body-daily-water-goal"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              1日の目標水分量 (ml)
            </label>
            <input
              id="body-daily-water-goal"
              type="number"
              value={formData.dailyWaterGoalMl}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  dailyWaterGoalMl: e.target.value,
                });
                setFieldErrors({
                  ...fieldErrors,
                  dailyWaterGoalMl: undefined,
                });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-cyan-500"
              min="250"
              max="10000"
              step="50"
              placeholder="2000"
            />
            {fieldErrors.dailyWaterGoalMl && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.dailyWaterGoalMl}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              未入力でも保存できます。ダッシュボードでは「目標未設定」として表示されます。
            </p>
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

        <BodySettingsPreview
          previewSettings={previewSettings}
          bmr={bmr}
          tdee={tdee}
        />
      </div>
    </div>
  );
}
