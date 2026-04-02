import type { BodySettings } from '../types';

export type BodySettingsForm = {
  height: string;
  weight: string;
  age: string;
  gender: BodySettings['gender'];
  activityLevel: BodySettings['activityLevel'];
  dailyWaterGoalMl: string;
};

export type FieldErrors = Partial<
  Record<'height' | 'weight' | 'age' | 'dailyWaterGoalMl', string>
>;

export const EMPTY_BODY_SETTINGS_FORM: BodySettingsForm = {
  height: '',
  weight: '',
  age: '',
  gender: 'male',
  activityLevel: 'moderate',
  dailyWaterGoalMl: '',
};

export const toBodySettingsFormData = (
  settings: BodySettings,
): BodySettingsForm => ({
  height: String(settings.height),
  weight: String(settings.weight),
  age: String(settings.age),
  gender: settings.gender,
  activityLevel: settings.activityLevel,
  dailyWaterGoalMl:
    settings.dailyWaterGoalMl === null ? '' : String(settings.dailyWaterGoalMl),
});

export const buildBodySettings = (
  formData: BodySettingsForm,
): BodySettings | null => {
  if (!formData.height || !formData.weight || !formData.age) {
    return null;
  }

  const height = Number(formData.height);
  const weight = Number(formData.weight);
  const age = Number(formData.age);
  const dailyWaterGoalMl = formData.dailyWaterGoalMl
    ? Number(formData.dailyWaterGoalMl)
    : null;

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    !Number.isFinite(age) ||
    height <= 0 ||
    weight <= 0 ||
    age <= 0 ||
    (formData.dailyWaterGoalMl &&
      (!Number.isFinite(dailyWaterGoalMl) || (dailyWaterGoalMl ?? 0) <= 0))
  ) {
    return null;
  }

  return {
    height,
    weight,
    age,
    gender: formData.gender,
    activityLevel: formData.activityLevel,
    dailyWaterGoalMl,
  };
};

export const validateBodySettingsForm = (
  formData: BodySettingsForm,
): FieldErrors => {
  const errors: FieldErrors = {};
  const height = Number(formData.height);
  const weight = Number(formData.weight);
  const age = Number(formData.age);
  const dailyWaterGoalMl = Number(formData.dailyWaterGoalMl);

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

  if (
    formData.dailyWaterGoalMl &&
    (!Number.isFinite(dailyWaterGoalMl) ||
      dailyWaterGoalMl < 250 ||
      dailyWaterGoalMl > 10000)
  ) {
    errors.dailyWaterGoalMl =
      '目標水分量は 250〜10000ml の範囲で入力してください。';
  }

  return errors;
};
