// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { useDashboardSummary } = vi.hoisted(() => ({
  useDashboardSummary: vi.fn(),
}));

const { useDashboardCalendarMarkers } = vi.hoisted(() => ({
  useDashboardCalendarMarkers: vi.fn(),
}));

vi.mock('../features/dashboard/hooks/useDashboardSummary', () => ({
  useDashboardSummary,
}));

vi.mock('../features/dashboard/hooks/useDashboardCalendarMarkers', () => ({
  useDashboardCalendarMarkers,
}));

vi.mock('../features/dashboard/ui/DashboardOverview', () => ({
  DashboardOverview: () => <div>overview</div>,
}));

vi.mock('../shared/lib/date', async () => {
  const actual = await vi.importActual<typeof import('../shared/lib/date')>(
    '../shared/lib/date',
  );

  return {
    ...actual,
    getTodayString: () => '2025-01-02',
  };
});

import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('表示中の月に応じて月次マーカーを取得する', () => {
    useDashboardSummary.mockReturnValue({
      summary: {
        targetCalories: 2000,
        intakeCalories: 1200,
        burnedCalories: 300,
        calorieBalance: -1100,
        targetWaterIntakeMl: 2000,
        waterIntakeMl: 900,
        remainingWaterIntakeMl: 1100,
        currentPlan: null,
        profileRegistered: true,
      },
      loading: false,
      error: '',
      reload: vi.fn(),
    });

    useDashboardCalendarMarkers.mockReturnValue({
      markersByDate: {},
      error: '',
    });

    render(<DashboardPage />);

    expect(useDashboardCalendarMarkers).toHaveBeenCalledWith('2025-01-01');

    fireEvent.click(screen.getByLabelText('次の月へ移動'));

    expect(useDashboardCalendarMarkers).toHaveBeenLastCalledWith('2025-02-01');

    fireEvent.click(screen.getByText('今日へ'));

    expect(useDashboardCalendarMarkers).toHaveBeenLastCalledWith('2025-01-01');
  });
});
