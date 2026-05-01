// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { getPeriodSummary } = vi.hoisted(() => ({
  getPeriodSummary: vi.fn(),
}));

vi.mock('../api', () => ({
  getPeriodSummary,
}));

import { useDashboardPeriodSummary } from './useDashboardPeriodSummary';

describe('useDashboardPeriodSummary', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('指定週のサマリーを取得する', async () => {
    getPeriodSummary.mockResolvedValue({
      windowStartDate: '2026-03-23',
      windowEndDate: '2026-03-29',
      windowDays: 7,
      calorieTargetTotal: 14000,
      intakeCalories: 1200,
      burnedCalories: 300,
      waterTargetTotalMl: 14000,
      waterIntakeMl: 1000,
      mealLogCount: 2,
      mealDayCount: 2,
      workoutLogCount: 1,
      workoutDayCount: 1,
      waterLogCount: 2,
      waterDayCount: 2,
      bodyWeightLogCount: 2,
      bodyWeightDayCount: 2,
      recordedDayCount: 3,
      bodyWeightStartKg: 65.2,
      bodyWeightEndKg: 64.7,
      bodyWeightChangeKg: -0.5,
      profileRegistered: true,
    });

    const { result } = renderHook(() =>
      useDashboardPeriodSummary('2026-03-27'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getPeriodSummary).toHaveBeenCalledWith('2026-03-27');
    expect(result.current.summary?.recordedDayCount).toBe(3);
    expect(result.current.error).toBe('');
  });

  it('再読み込みで再取得する', async () => {
    getPeriodSummary.mockResolvedValue({
      windowStartDate: '2026-03-23',
      windowEndDate: '2026-03-29',
      windowDays: 7,
      calorieTargetTotal: 14000,
      intakeCalories: 0,
      burnedCalories: 0,
      waterTargetTotalMl: 14000,
      waterIntakeMl: 0,
      mealLogCount: 0,
      mealDayCount: 0,
      workoutLogCount: 0,
      workoutDayCount: 0,
      waterLogCount: 0,
      waterDayCount: 0,
      bodyWeightLogCount: 0,
      bodyWeightDayCount: 0,
      recordedDayCount: 0,
      bodyWeightStartKg: null,
      bodyWeightEndKg: null,
      bodyWeightChangeKg: null,
      profileRegistered: false,
    });

    const { result } = renderHook(() =>
      useDashboardPeriodSummary('2026-03-27'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getPeriodSummary).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(getPeriodSummary).toHaveBeenCalledTimes(2));
  });
});
