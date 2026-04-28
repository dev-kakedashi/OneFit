// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BodyWeightLog } from '../types';

const { getBodyWeightLogs } = vi.hoisted(() => ({
  getBodyWeightLogs: vi.fn(),
}));

vi.mock('../api', () => ({
  getBodyWeightLogs,
}));

import { useBodyWeightHistory } from './useBodyWeightHistory';

describe('useBodyWeightHistory', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('指定期間のログを取得し、日付順に並べる', async () => {
    getBodyWeightLogs.mockResolvedValue([
      {
        id: 2,
        userId: 1,
        measuredOn: '2025-02-28',
        weightKg: 64.8,
        memo: null,
      },
      {
        id: 1,
        userId: 1,
        measuredOn: '2025-02-01',
        weightKg: 66.3,
        memo: null,
      },
    ]);

    const { result } = renderHook(() =>
      useBodyWeightHistory('2025-03-31', '1m'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getBodyWeightLogs).toHaveBeenCalledWith('2025-02-28', '2025-03-31');
    expect(result.current.logs.map((log: BodyWeightLog) => log.id)).toEqual([
      1, 2,
    ]);
    expect(result.current.error).toBe('');
  });

  it('再読み込みで再取得する', async () => {
    getBodyWeightLogs.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useBodyWeightHistory('2025-03-31', '1w'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getBodyWeightLogs).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(getBodyWeightLogs).toHaveBeenCalledTimes(2));
  });

  it('外部の更新トークン変更でも再取得する', async () => {
    getBodyWeightLogs.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ refreshToken }: { refreshToken: number }) =>
        useBodyWeightHistory('2025-03-31', '1m', refreshToken),
      {
        initialProps: { refreshToken: 0 },
      },
    );

    await waitFor(() => expect(getBodyWeightLogs).toHaveBeenCalledTimes(1));

    rerender({ refreshToken: 1 });

    await waitFor(() => expect(getBodyWeightLogs).toHaveBeenCalledTimes(2));
  });
});
