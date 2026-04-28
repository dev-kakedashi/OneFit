import { describe, expect, it } from 'vitest';
import {
  buildBodyWeightHistoryStats,
  getBodyWeightHistoryWindow,
  sortBodyWeightLogsAscending,
} from './history';

describe('body weight history helpers', () => {
  it('期間ごとの取得範囲を計算する', () => {
    expect(getBodyWeightHistoryWindow('2025-03-31', '1w')).toEqual({
      startDate: '2025-03-25',
      endDate: '2025-03-31',
    });

    expect(getBodyWeightHistoryWindow('2025-03-31', '1m')).toEqual({
      startDate: '2025-02-28',
      endDate: '2025-03-31',
    });
  });

  it('ログを昇順に並べて統計を作る', () => {
    const logs = sortBodyWeightLogsAscending([
      {
        id: 2,
        userId: 1,
        measuredOn: '2025-03-01',
        weightKg: 65.1,
        memo: null,
      },
      {
        id: 1,
        userId: 1,
        measuredOn: '2025-02-01',
        weightKg: 66.3,
        memo: null,
      },
      {
        id: 3,
        userId: 1,
        measuredOn: '2025-04-01',
        weightKg: 64.8,
        memo: null,
      },
    ]);

    expect(logs.map((log) => log.id)).toEqual([1, 2, 3]);

    const stats = buildBodyWeightHistoryStats(logs);

    expect(stats).not.toBeNull();
    expect(stats).toMatchObject({
      count: 3,
      startWeightKg: 66.3,
      endWeightKg: 64.8,
      changeKg: -1.5,
      minWeightKg: 64.8,
      maxWeightKg: 66.3,
    });
    expect(stats?.averageWeightKg).toBeCloseTo(65.4, 1);
  });
});
