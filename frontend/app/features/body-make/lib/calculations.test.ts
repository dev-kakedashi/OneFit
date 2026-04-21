import { describe, expect, it } from 'vitest';
import {
  calculateDailyCalorieAdjustment,
  calculateRecommendedDurationDays,
  calculateTargetCaloriesForPlan,
  calculateWeeklyWeightChangeRate,
  formatDurationSummary,
  getPlanSafetyAssessment,
} from './calculations';

describe('body make calculations', () => {
  it('5kg を 90 日で目指すと 1 日 400kcal 調整になる', () => {
    expect(calculateDailyCalorieAdjustment(5, 90)).toBe(400);
  });

  it('維持コースは維持カロリーをそのまま返す', () => {
    expect(
      calculateTargetCaloriesForPlan({
        maintenanceCalories: 2600,
        course: 'maintenance',
        targetWeightKg: 0,
        durationDays: 0,
      }),
    ).toEqual({
      dailyCalorieAdjustment: 0,
      targetCalories: 2600,
    });
  });

  it('ダイエットコースは維持カロリーから調整量を引く', () => {
    expect(
      calculateTargetCaloriesForPlan({
        maintenanceCalories: 2600,
        course: 'diet',
        targetWeightKg: 5,
        durationDays: 90,
      }),
    ).toEqual({
      dailyCalorieAdjustment: 400,
      targetCalories: 2200,
    });
  });

  it('増量コースは維持カロリーへ調整量を足す', () => {
    expect(
      calculateTargetCaloriesForPlan({
        maintenanceCalories: 2600,
        course: 'bulk',
        targetWeightKg: 5,
        durationDays: 90,
      }),
    ).toEqual({
      dailyCalorieAdjustment: 400,
      targetCalories: 3000,
    });
  });

  it('期間表示を週と月の目安で返す', () => {
    expect(formatDurationSummary(90)).toBe('13週間 / 3ヶ月');
  });

  it('週あたりの増減ペースを計算できる', () => {
    expect(calculateWeeklyWeightChangeRate(5, 35)).toBe(1);
  });

  it('おすすめ日数を計算できる', () => {
    expect(calculateRecommendedDurationDays(5, 0.7)).toBe(50);
    expect(calculateRecommendedDurationDays(5, 0.5)).toBe(70);
    expect(calculateRecommendedDurationDays(3, 0.25)).toBe(84);
    expect(calculateRecommendedDurationDays(3, 0.2)).toBe(105);
  });

  it('無理のないダイエット設定は safe 判定になる', () => {
    expect(
      getPlanSafetyAssessment({
        course: 'diet',
        targetWeightKg: 5,
        durationDays: 90,
        maintenanceCalories: 2600,
        basalMetabolism: 1678,
      }),
    ).toMatchObject({
      level: 'safe',
      canSave: true,
      requiresAcknowledgement: false,
    });
  });

  it('基礎代謝を下回るダイエット設定は blocked 判定になる', () => {
    expect(
      getPlanSafetyAssessment({
        course: 'diet',
        targetWeightKg: 5,
        durationDays: 15,
        maintenanceCalories: 2600,
        basalMetabolism: 1678,
      }),
    ).toMatchObject({
      level: 'blocked',
      canSave: false,
      requiresAcknowledgement: false,
    });
  });

  it('無理のない増量設定は safe 判定になる', () => {
    expect(
      getPlanSafetyAssessment({
        course: 'bulk',
        targetWeightKg: 3,
        durationDays: 90,
        maintenanceCalories: 2600,
        basalMetabolism: 1678,
      }),
    ).toMatchObject({
      level: 'safe',
      canSave: true,
      requiresAcknowledgement: false,
    });
  });

  it('やや高めの増量設定は warning 判定になる', () => {
    expect(
      getPlanSafetyAssessment({
        course: 'bulk',
        targetWeightKg: 3,
        durationDays: 56,
        maintenanceCalories: 2600,
        basalMetabolism: 1678,
      }),
    ).toMatchObject({
      level: 'warning',
      canSave: true,
      requiresAcknowledgement: false,
    });
  });

  it('高すぎる増量設定は danger 判定になる', () => {
    expect(
      getPlanSafetyAssessment({
        course: 'bulk',
        targetWeightKg: 3,
        durationDays: 30,
        maintenanceCalories: 2600,
        basalMetabolism: 1678,
      }),
    ).toMatchObject({
      level: 'danger',
      canSave: true,
      requiresAcknowledgement: true,
    });
  });
});
