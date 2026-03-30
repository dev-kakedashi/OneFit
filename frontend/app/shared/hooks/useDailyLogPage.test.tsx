// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/date', () => ({
  getTodayString: () => '2025-01-02',
}));

import { useDailyLogPage } from './useDailyLogPage';

type TestItem = {
  id: number;
  date: string;
  title: string;
};

type TestForm = {
  title: string;
  date: string;
};

const createInitialFormData = (date: string): TestForm => ({
  title: '',
  date,
});

const toFormData = (item: TestItem): TestForm => ({
  title: item.title,
  date: item.date,
});

const createOptions = ({
  getItems = vi.fn<() => Promise<TestItem[]>>().mockResolvedValue([]),
  deleteItem = vi.fn<(id: number) => Promise<void>>().mockResolvedValue(
    undefined,
  ),
}: {
  getItems?: (date: string) => Promise<TestItem[]>;
  deleteItem?: (id: number) => Promise<void>;
} = {}) => ({
  createInitialFormData,
  deleteConfirmMessage: 'この記録を削除しますか？',
  deleteErrorMessage: '削除に失敗しました。',
  getItemDate: (item: TestItem) => item.date,
  getItems,
  loadErrorMessage: '取得に失敗しました。',
  toFormData,
  deleteItem,
});

describe('useDailyLogPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初回表示時に一覧を取得して日時順に並べる', async () => {
    const getItems = vi.fn().mockResolvedValue([
      { id: 1, date: '2025-01-02T08:00:00', title: '朝食' },
      { id: 2, date: '2025-01-02T12:00:00', title: '昼食' },
    ]);

    const { result } = renderHook(() =>
      useDailyLogPage<TestItem, TestForm>(createOptions({ getItems })),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getItems).toHaveBeenCalledWith('2025-01-02');
    expect(result.current.items.map((item: TestItem) => item.id)).toEqual([2, 1]);
    expect(result.current.formData).toEqual({
      title: '',
      date: '2025-01-02',
    });
  });

  it('編集中でないときは日付変更でフォーム初期値を更新する', async () => {
    const getItems = vi.fn().mockResolvedValue([]);

    const { result } = renderHook(() =>
      useDailyLogPage<TestItem, TestForm>(createOptions({ getItems })),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setFormData({
        title: '一時入力',
        date: '2025-01-02',
      });
    });

    act(() => {
      result.current.setSelectedDate('2025-01-03');
    });

    await waitFor(() =>
      expect(getItems).toHaveBeenLastCalledWith('2025-01-03'),
    );

    expect(result.current.formData).toEqual({
      title: '',
      date: '2025-01-03',
    });
  });

  it('編集開始後はフォームに値を反映し、日付変更しても編集中の内容を保持する', async () => {
    const getItems = vi.fn().mockResolvedValue([]);
    const editingTarget: TestItem = {
      id: 10,
      date: '2025-01-02T18:30:00',
      title: '夕食',
    };

    const { result } = renderHook(() =>
      useDailyLogPage<TestItem, TestForm>(createOptions({ getItems })),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleEdit(editingTarget);
    });

    expect(result.current.editingItem).toEqual(editingTarget);
    expect(result.current.showForm).toBe(true);
    expect(result.current.formData).toEqual(toFormData(editingTarget));

    act(() => {
      result.current.setSelectedDate('2025-01-03');
    });

    await waitFor(() =>
      expect(getItems).toHaveBeenLastCalledWith('2025-01-03'),
    );

    expect(result.current.editingItem).toEqual(editingTarget);
    expect(result.current.formData).toEqual(toFormData(editingTarget));
  });

  it('削除確認後に削除と再取得を行う', async () => {
    const getItems = vi
      .fn()
      .mockResolvedValueOnce([
        { id: 1, date: '2025-01-02T08:00:00', title: '朝食' },
        { id: 2, date: '2025-01-02T12:00:00', title: '昼食' },
      ])
      .mockResolvedValueOnce([
        { id: 2, date: '2025-01-02T12:00:00', title: '昼食' },
      ]);

    const deleteItem = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { result } = renderHook(() =>
      useDailyLogPage<TestItem, TestForm>(
        createOptions({ getItems, deleteItem }),
      ),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleDelete(1);
    });

    expect(window.confirm).toHaveBeenCalledWith('この記録を削除しますか？');
    expect(deleteItem).toHaveBeenCalledWith(1);
    expect(getItems).toHaveBeenCalledTimes(2);
    expect(getItems).toHaveBeenLastCalledWith('2025-01-02');
    expect(result.current.items.map((item: TestItem) => item.id)).toEqual([2]);
  });
});
