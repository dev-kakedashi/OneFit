// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DashboardOverview } from './DashboardOverview';

const createSummary = () => ({
  targetCalories: 2000,
  intakeCalories: 1500,
  burnedCalories: 400,
  calorieBalance: -900,
  targetWaterIntakeMl: 2000,
  waterIntakeMl: 1200,
  remainingWaterIntakeMl: 800,
  currentPlan: null,
  profileRegistered: true,
});

describe('DashboardOverview', () => {
  it('水分摂取量カードを表示する', () => {
    render(
      <MemoryRouter>
        <DashboardOverview
          selectedDate="2026-04-02"
          todayString="2026-04-02"
          summary={createSummary()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('水分摂取量')).toBeTruthy();

    const waterCard = screen.getByText('水分摂取量').closest('div')?.parentElement;
    expect(waterCard?.textContent).toContain('1200');
    expect(waterCard?.textContent).toContain('2000');

    expect(screen.getByText('あと 800 ml')).toBeTruthy();
    expect(screen.getByText('水分を記録')).toBeTruthy();
  });

  it('水分目標が未設定でも文言を表示する', () => {
    render(
      <MemoryRouter>
        <DashboardOverview
          selectedDate="2026-04-02"
          todayString="2026-04-02"
          summary={{
            ...createSummary(),
            targetWaterIntakeMl: null,
            remainingWaterIntakeMl: null,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('目標を設定すると達成状況を表示できます')).toBeTruthy();
  });

  it('目標達成時の文言を表示する', () => {
    render(
      <MemoryRouter>
        <DashboardOverview
          selectedDate="2026-04-02"
          todayString="2026-04-02"
          summary={{
            ...createSummary(),
            waterIntakeMl: 2200,
            remainingWaterIntakeMl: 0,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('目標達成です')).toBeTruthy();
  });
});
