// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DashboardPlanStatus } from './DashboardPlanStatus';

describe('DashboardPlanStatus', () => {
  it('登録済みプランを自然に表示できる', () => {
    render(
      <MemoryRouter>
        <DashboardPlanStatus
          selectedDate="2026-04-08"
          todayString="2026-04-08"
          summary={{
            targetCalories: 2236,
            intakeCalories: 300,
            burnedCalories: 250,
            calorieBalance: -1936,
            targetWaterIntakeMl: 2000,
            waterIntakeMl: 1200,
            remainingWaterIntakeMl: 800,
            currentPlan: {
              course: 'diet',
              targetEndDate: '2026-07-04',
              targetWeightKg: 5,
              dailyCalorieAdjustment: 400,
            },
            profileRegistered: true,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('ダイエット')).toBeTruthy();
    expect(screen.getByText('-5kg を目標')).toBeTruthy();
    expect(screen.getByText('2026年7月4日まで')).toBeTruthy();
    expect(screen.getByText('-400 kcal/日')).toBeTruthy();
  });

  it('未設定時はボディメイク設定への導線を表示する', () => {
    render(
      <MemoryRouter>
        <DashboardPlanStatus
          selectedDate="2026-04-08"
          todayString="2026-04-08"
          summary={{
            targetCalories: 2636,
            intakeCalories: 300,
            burnedCalories: 250,
            calorieBalance: -2336,
            targetWaterIntakeMl: 2000,
            waterIntakeMl: 1200,
            remainingWaterIntakeMl: 800,
            currentPlan: null,
            profileRegistered: true,
          }}
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'ボディメイク目標を設定' });
    expect(link.getAttribute('href')).toBe('/body-make');
  });

  it('過去日を見ているときはこの日のプランと表示する', () => {
    render(
      <MemoryRouter>
        <DashboardPlanStatus
          selectedDate="2026-04-05"
          todayString="2026-04-08"
          summary={{
            targetCalories: 2236,
            intakeCalories: 300,
            burnedCalories: 250,
            calorieBalance: -1936,
            targetWaterIntakeMl: 2000,
            waterIntakeMl: 1200,
            remainingWaterIntakeMl: 800,
            currentPlan: {
              course: 'diet',
              targetEndDate: '2026-07-04',
              targetWeightKg: 5,
              dailyCalorieAdjustment: 400,
            },
            profileRegistered: true,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('この日のプラン')).toBeTruthy();
  });
});
