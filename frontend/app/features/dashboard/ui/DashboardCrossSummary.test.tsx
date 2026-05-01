// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { useDashboardPeriodSummary } = vi.hoisted(() => ({
  useDashboardPeriodSummary: vi.fn(),
}));

vi.mock('../hooks/useDashboardPeriodSummary', () => ({
  useDashboardPeriodSummary,
}));

import { DashboardCrossSummary } from './DashboardCrossSummary';

describe('DashboardCrossSummary', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('週間サマリーを表示する', () => {
    useDashboardPeriodSummary.mockReturnValue({
      summary: {
        windowStartDate: '2026-04-27',
        windowEndDate: '2026-05-03',
        windowDays: 7,
        calorieTargetTotal: 14000,
        intakeCalories: 11200,
        burnedCalories: 800,
        waterTargetTotalMl: 4000,
        waterIntakeMl: 3000,
        mealLogCount: 4,
        mealDayCount: 4,
        workoutLogCount: 1,
        workoutDayCount: 1,
        waterLogCount: 3,
        waterDayCount: 2,
        bodyWeightLogCount: 2,
        bodyWeightDayCount: 3,
        recordedDayCount: 4,
        bodyWeightStartKg: 69.7,
        bodyWeightEndKg: 73,
        bodyWeightChangeKg: 3.3,
        profileRegistered: true,
      },
      loading: false,
      error: '',
      reload: vi.fn(),
    });

    render(<DashboardCrossSummary todayString="2026-05-01" />);

    expect(useDashboardPeriodSummary).toHaveBeenCalledWith('2026-04-27');
    expect(screen.getByText('週間サマリー')).toBeTruthy();
    expect(screen.getByText(/2026\/4\/27 〜 2026\/5\/3/)).toBeTruthy();
    expect(screen.getByText('摂取達成率')).toBeTruthy();
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('11,200 / 14,000 kcal')).toBeTruthy();
    expect(screen.getByText('消費総量')).toBeTruthy();
    expect(screen.getByText('800 kcal')).toBeTruthy();
    expect(screen.getByText('週合計')).toBeTruthy();
    expect(screen.getByText('水分達成率')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('3,000 / 4,000 ml')).toBeTruthy();
    expect(screen.getByText('体重変化')).toBeTruthy();
    expect(screen.getByText('+3.3kg')).toBeTruthy();
    expect(screen.getByText('週初め 69.7kg → 最新 73kg')).toBeTruthy();
    expect(screen.getByText('記録のある日 4/7日')).toBeTruthy();
    expect(screen.getByText('プロフィール登録済み')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '前週' }));

    expect(useDashboardPeriodSummary).toHaveBeenLastCalledWith('2026-04-20');

    fireEvent.click(screen.getByRole('button', { name: '今週に戻す' }));

    expect(useDashboardPeriodSummary).toHaveBeenLastCalledWith('2026-04-27');
  });
});
