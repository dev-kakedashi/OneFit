import { describe, expect, it } from 'vitest';
import {
  getBodyMakePlanTimeline,
  getDefaultApplyStartOption,
  getEditableBodyMakePlan,
  upsertBodyMakePlanInList,
} from './timeline';
import type { BodyMakePlan } from './types';

const buildPlan = (overrides: Partial<BodyMakePlan>): BodyMakePlan => ({
  id: 1,
  userId: 1,
  course: 'diet',
  effectiveFrom: '2026-04-01',
  durationDays: 90,
  targetEndDate: '2026-06-29',
  targetWeightKg: 5,
  memo: null,
  startWeightKg: 70,
  maintenanceCalories: 2636,
  dailyCalorieAdjustment: 400,
  targetCalories: 2236,
  ...overrides,
});

describe('body make timeline helpers', () => {
  it('現在プランと予定プランを切り分けられる', () => {
    const timeline = getBodyMakePlanTimeline(
      [
        buildPlan({ id: 1, effectiveFrom: '2026-04-01', course: 'diet' }),
        buildPlan({ id: 2, effectiveFrom: '2026-04-09', course: 'bulk' }),
      ],
      '2026-04-08',
    );

    expect(timeline.currentPlan?.id).toBe(1);
    expect(timeline.upcomingPlan?.id).toBe(2);
  });

  it('既存プランがあると適用開始の初期値は tomorrow になる', () => {
    const timeline = getBodyMakePlanTimeline(
      [buildPlan({ id: 1, effectiveFrom: '2026-04-01' })],
      '2026-04-08',
    );

    expect(getDefaultApplyStartOption(timeline)).toBe('tomorrow');
    expect(getEditableBodyMakePlan(timeline)?.id).toBe(1);
  });

  it('保存後のプランを一覧へ上書き反映できる', () => {
    const currentPlans = [
      buildPlan({ id: 1, effectiveFrom: '2026-04-01' }),
      buildPlan({ id: 2, effectiveFrom: '2026-04-09', course: 'bulk' }),
    ];

    const updated = upsertBodyMakePlanInList(
      currentPlans,
      buildPlan({ id: 3, effectiveFrom: '2026-04-09', course: 'diet' }),
    );

    expect(updated).toHaveLength(2);
    expect(updated[0].id).toBe(3);
    expect(updated[0].course).toBe('diet');
  });
});
