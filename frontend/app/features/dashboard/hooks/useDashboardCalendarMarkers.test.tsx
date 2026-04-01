// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { getMonthlyMarkers } = vi.hoisted(() => ({
  getMonthlyMarkers: vi.fn(),
}));

vi.mock('../api', () => ({
  getMonthlyMarkers,
}));

import { useDashboardCalendarMarkers } from './useDashboardCalendarMarkers';

describe('useDashboardCalendarMarkers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('月次マーカーを日付キーで参照できる形に整形する', async () => {
    getMonthlyMarkers.mockResolvedValue([
      { date: '2025-01-02', hasMeal: true, hasWorkout: false },
      { date: '2025-01-05', hasMeal: true, hasWorkout: true },
    ]);

    const { result } = renderHook(() =>
      useDashboardCalendarMarkers('2025-01-01'),
    );

    await waitFor(() =>
      expect(result.current.markersByDate['2025-01-05']).toEqual({
        date: '2025-01-05',
        hasMeal: true,
        hasWorkout: true,
      }),
    );

    expect(getMonthlyMarkers).toHaveBeenCalledWith('2025-01-01');
    expect(result.current.error).toBe('');
  });

  it('対象月が変わると再取得する', async () => {
    getMonthlyMarkers
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { date: '2025-02-10', hasMeal: false, hasWorkout: true },
      ]);

    const { rerender, result } = renderHook(
      ({ targetMonth }) => useDashboardCalendarMarkers(targetMonth),
      {
        initialProps: { targetMonth: '2025-01-01' },
      },
    );

    await waitFor(() =>
      expect(getMonthlyMarkers).toHaveBeenCalledWith('2025-01-01'),
    );

    rerender({ targetMonth: '2025-02-01' });

    await waitFor(() =>
      expect(result.current.markersByDate['2025-02-10']).toEqual({
        date: '2025-02-10',
        hasMeal: false,
        hasWorkout: true,
      }),
    );

    expect(getMonthlyMarkers).toHaveBeenLastCalledWith('2025-02-01');
  });

  it('取得失敗時はエラーを返してマーカーを空にする', async () => {
    getMonthlyMarkers.mockRejectedValue(new Error('取得失敗'));

    const { result } = renderHook(() =>
      useDashboardCalendarMarkers('2025-01-01'),
    );

    await waitFor(() => expect(result.current.error).toBe('取得失敗'));

    expect(result.current.markersByDate).toEqual({});
  });
});
