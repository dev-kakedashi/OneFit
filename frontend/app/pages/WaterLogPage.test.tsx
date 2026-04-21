// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  getWaterLogs,
  saveWaterLog,
  updateWaterLog,
  deleteWaterLog,
} = vi.hoisted(() => ({
  getWaterLogs: vi.fn(),
  saveWaterLog: vi.fn(),
  updateWaterLog: vi.fn(),
  deleteWaterLog: vi.fn(),
}));

vi.mock('../features/water/api', () => ({
  getWaterLogs,
  saveWaterLog,
  updateWaterLog,
  deleteWaterLog,
}));

vi.mock('../shared/lib/date', async () => {
  const actual = await vi.importActual<typeof import('../shared/lib/date')>(
    '../shared/lib/date',
  );

  return {
    ...actual,
    getTodayString: () => '2026-04-02',
    buildDefaultDateTime: () => '2026-04-02T08:00',
  };
});

import { WaterLogPage } from './WaterLogPage';

describe('WaterLogPage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('一覧を表示する', async () => {
    getWaterLogs.mockResolvedValue([
      {
        id: 1,
        amountMl: 300,
        drankAt: '2026-04-02T08:00:00',
        memo: 'Water',
      },
    ]);

    render(<WaterLogPage />);

    await waitFor(() =>
      expect(getWaterLogs).toHaveBeenCalledWith('2026-04-02'),
    );

    expect(screen.getByText('選択日の水分摂取量')).toBeTruthy();
    expect(screen.getAllByText('300 ml')).toHaveLength(2);
    expect(screen.getByText('Water')).toBeTruthy();
  });

  it('新規登録できる', async () => {
    getWaterLogs.mockResolvedValue([]);
    saveWaterLog.mockResolvedValue({
      id: 1,
      amountMl: 500,
      drankAt: '2026-04-02T10:00:00',
      memo: 'Tea',
    });

    render(<WaterLogPage />);

    await waitFor(() =>
      expect(getWaterLogs).toHaveBeenCalledWith('2026-04-02'),
    );

    fireEvent.click(screen.getByRole('button', { name: '水分を追加' }));

    fireEvent.change(screen.getByLabelText('水分量 (ml) *'), {
      target: { value: '500' },
    });
    fireEvent.change(screen.getByLabelText('日時 *'), {
      target: { value: '2026-04-02T10:00' },
    });
    fireEvent.change(screen.getByLabelText('メモ'), {
      target: { value: 'Tea' },
    });

    fireEvent.click(screen.getByRole('button', { name: '追加' }));

    await waitFor(() =>
      expect(saveWaterLog).toHaveBeenCalledWith({
        amountMl: 500,
        drankAt: '2026-04-02T10:00:00',
        memo: 'Tea',
      }),
    );
  });

  it('記録がない場合の空表示を出す', async () => {
    getWaterLogs.mockResolvedValue([]);

    render(<WaterLogPage />);

    await waitFor(() =>
      expect(screen.getByText('まだ水分記録がありません')).toBeTruthy(),
    );
  });
});

it('空表示の導線からフォームを開くと空表示を隠す', async () => {
  getWaterLogs.mockResolvedValue([]);

  render(<WaterLogPage />);

  const firstAddButton = await screen.findByRole('button', {
    name: '最初の記録を追加',
  });
  fireEvent.click(firstAddButton);

  expect(screen.getByRole('button', { name: '追加' })).toBeTruthy();
  expect(screen.queryByText('まだ水分記録がありません')).toBeNull();
});
