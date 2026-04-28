// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  getBodyWeightLogs,
  saveBodyWeightLog,
  deleteBodyWeightLog,
} = vi.hoisted(() => ({
  getBodyWeightLogs: vi.fn(),
  saveBodyWeightLog: vi.fn(),
  deleteBodyWeightLog: vi.fn(),
}));

const { useBodyWeightReflection } = vi.hoisted(() => ({
  useBodyWeightReflection: vi.fn(),
}));

const { BodyWeightHistoryChart } = vi.hoisted(() => ({
  BodyWeightHistoryChart: vi.fn(() => <div>history-chart</div>),
}));

vi.mock('../features/body-weight/api', () => ({
  getBodyWeightLogs,
  saveBodyWeightLog,
  deleteBodyWeightLog,
}));

vi.mock('../features/body-weight/hooks/useBodyWeightReflection', () => ({
  useBodyWeightReflection,
}));

vi.mock('../features/body-weight/ui/BodyWeightHistoryChart', () => ({
  BodyWeightHistoryChart,
}));

vi.mock('../shared/lib/date', async () => {
  const actual = await vi.importActual<typeof import('../shared/lib/date')>(
    '../shared/lib/date',
  );

  return {
    ...actual,
    getTodayString: () => '2026-04-02',
  };
});

import { BodyWeightLogPage } from './BodyWeightLogPage';

describe('BodyWeightLogPage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('一覧を表示する', async () => {
    getBodyWeightLogs.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        measuredOn: '2026-04-02',
        weightKg: 65.5,
        memo: '朝一',
      },
    ]);
    useBodyWeightReflection.mockReturnValue({
      loading: false,
      saving: false,
      notice: null,
      snapshot: null,
      reflectLatestWeight: vi.fn(),
    });

    render(<BodyWeightLogPage />);

    await waitFor(() =>
      expect(getBodyWeightLogs).toHaveBeenCalledWith('2026-04-02'),
    );

    expect(BodyWeightHistoryChart).toHaveBeenCalledWith(
      expect.objectContaining({
        todayString: '2026-04-02',
        refreshToken: 0,
      }),
      undefined,
    );

    expect(screen.getAllByText('65.5 kg')).toHaveLength(2);
    expect(screen.getByText('朝一')).toBeTruthy();
  });

  it('新規登録できる', async () => {
    getBodyWeightLogs.mockResolvedValue([]);
    saveBodyWeightLog.mockResolvedValue({
      id: 1,
      userId: 1,
      measuredOn: '2026-04-01',
      weightKg: 65.5,
      memo: '朝一',
    });
    useBodyWeightReflection.mockReturnValue({
      loading: false,
      saving: false,
      notice: null,
      snapshot: null,
      reflectLatestWeight: vi.fn(),
    });

    render(<BodyWeightLogPage />);

    await waitFor(() =>
      expect(getBodyWeightLogs).toHaveBeenCalledWith('2026-04-02'),
    );

    fireEvent.click(screen.getByRole('button', { name: '体重を追加' }));

    fireEvent.change(screen.getByLabelText('体重 (kg) *'), {
      target: { value: '65.5' },
    });
    fireEvent.change(screen.getByLabelText('測定日 *'), {
      target: { value: '2026-04-01' },
    });
    fireEvent.change(screen.getByLabelText('メモ'), {
      target: { value: '朝一' },
    });

    fireEvent.click(screen.getByRole('button', { name: '追加' }));

    await waitFor(() =>
      expect(saveBodyWeightLog).toHaveBeenCalledWith({
        measuredOn: '2026-04-01',
        weightKg: 65.5,
        memo: '朝一',
      }),
    );

    await waitFor(() =>
      expect(getBodyWeightLogs).toHaveBeenCalledTimes(2),
    );

    expect(getBodyWeightLogs).toHaveBeenLastCalledWith('2026-04-01');

    await waitFor(() =>
      expect(BodyWeightHistoryChart).toHaveBeenLastCalledWith(
        expect.objectContaining({
          todayString: '2026-04-02',
          refreshToken: 1,
        }),
        undefined,
      ),
    );
  });

  it('記録がない場合の空表示を出す', async () => {
    getBodyWeightLogs.mockResolvedValue([]);
    useBodyWeightReflection.mockReturnValue({
      loading: false,
      saving: false,
      notice: null,
      snapshot: null,
      reflectLatestWeight: vi.fn(),
    });

    render(<BodyWeightLogPage />);

    await waitFor(() =>
      expect(screen.getByText('まだ体重記録がありません')).toBeTruthy(),
    );
  });
});
