// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BodyWeightHistoryRange } from '../lib/history';

const { useBodyWeightHistory } = vi.hoisted(() => ({
  useBodyWeightHistory: vi.fn(),
}));

vi.mock('../hooks/useBodyWeightHistory', () => ({
  useBodyWeightHistory,
}));

import { BodyWeightHistoryChart } from './BodyWeightHistoryChart';

const sampleLogs = [
  {
    id: 1,
    userId: 1,
    measuredOn: '2025-02-01',
    weightKg: 66.3,
    memo: null,
  },
  {
    id: 2,
    userId: 1,
    measuredOn: '2025-03-01',
    weightKg: 65.1,
    memo: null,
  },
  {
    id: 3,
    userId: 1,
    measuredOn: '2025-03-31',
    weightKg: 64.8,
    memo: null,
  },
];

const startDateByRange: Record<BodyWeightHistoryRange, string> = {
  '1w': '2025-03-25',
  '1m': '2025-02-28',
  '3m': '2024-12-31',
  '6m': '2024-09-30',
  '1y': '2024-03-31',
};

describe('BodyWeightHistoryChart', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('期間ボタンで取得範囲を切り替える', () => {
    useBodyWeightHistory.mockImplementation(
      (todayString: string, range: BodyWeightHistoryRange) => ({
        logs: sampleLogs,
        loading: false,
        error: '',
        reload: vi.fn(),
        window: {
          startDate: startDateByRange[range],
          endDate: todayString,
        },
      }),
    );

    render(<BodyWeightHistoryChart todayString="2025-03-31" />);

    expect(useBodyWeightHistory).toHaveBeenCalledWith(
      '2025-03-31',
      '1m',
      0,
    );
    expect(screen.getByText('-1.5kg')).toBeTruthy();
    expect(screen.getByText('65.4kg')).toBeTruthy();
    expect(screen.getByText('2025/2/28 の体重')).toBeTruthy();
    expect(screen.getByText('2025/3/31 の体重')).toBeTruthy();
    expect(screen.getAllByText('3件の記録')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: '1週間' }));

    expect(useBodyWeightHistory).toHaveBeenLastCalledWith(
      '2025-03-31',
      '1w',
      0,
    );
    expect(
      screen.getByRole('button', { name: '1週間' }).getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('記録がない場合は空表示を出す', () => {
    useBodyWeightHistory.mockReturnValue({
      logs: [],
      loading: false,
      error: '',
      reload: vi.fn(),
      window: {
        startDate: '2025-02-28',
        endDate: '2025-03-31',
      },
    });

    render(<BodyWeightHistoryChart todayString="2025-03-31" />);

    expect(
      screen.getByText('この期間には体重記録がありません'),
    ).toBeTruthy();
  });
});
