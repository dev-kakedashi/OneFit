import { type BodySettings } from '../types';

const ACTIVITY_MULTIPLIERS: Record<BodySettings['activityLevel'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// frontend のプレビュー値と保存後の backend 値がずれないよう、丸め方は backend と同じ floor に揃える。
export const calculateBMR = (settings: BodySettings): number => {
  const { weight, height, age, gender } = settings;

  const maleValue = 66.47 + 13.75 * weight + 5.003 * height - 6.755 * age;
  const femaleValue = 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age;

  if (gender === 'male') {
    return Math.floor(maleValue);
  }

  if (gender === 'female') {
    return Math.floor(femaleValue);
  }

  return Math.floor((maleValue + femaleValue) / 2);
};

export const calculateTDEE = (settings: BodySettings): number => {
  const bmr = calculateBMR(settings);
  return Math.floor(bmr * ACTIVITY_MULTIPLIERS[settings.activityLevel]);
};
