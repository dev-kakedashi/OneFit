import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildDefaultDateTime,
  formatDateOnly,
  formatDateTimeForApi,
  formatDateTimeInputValue,
  getTodayString,
  isToday,
} from './date';

describe('date utilities', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Date を yyyy-mm-dd 形式に整形する', () => {
    expect(formatDateOnly(new Date(2025, 0, 2, 3, 4, 5))).toBe('2025-01-02');
  });

  it('datetime-local 用の値に整形する', () => {
    expect(formatDateTimeInputValue(new Date(2025, 0, 2, 3, 4, 5))).toBe(
      '2025-01-02T03:04',
    );
  });

  it('API 送信用に秒を補完する', () => {
    expect(formatDateTimeForApi('2025-01-02T03:04')).toBe(
      '2025-01-02T03:04:00',
    );
    expect(formatDateTimeForApi('2025-01-02T03:04:59')).toBe(
      '2025-01-02T03:04:59',
    );
  });

  it('選択日を維持したまま現在時刻を初期値に使う', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 2, 9, 30, 0));

    expect(buildDefaultDateTime('2025-01-10')).toBe('2025-01-10T09:30');
  });

  it('今日判定を行う', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 2, 9, 30, 0));

    expect(getTodayString()).toBe('2025-01-02');
    expect(isToday('2025-01-02T18:00:00')).toBe(true);
    expect(isToday('2025-01-03T00:00:00')).toBe(false);
  });
});
