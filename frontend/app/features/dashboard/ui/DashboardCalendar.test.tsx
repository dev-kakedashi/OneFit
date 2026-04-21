// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DashboardCalendar } from './DashboardCalendar';

const createProps = () => ({
  selectedDate: '2026-03-05',
  visibleMonth: new Date('2026-03-01T00:00:00'),
  todayString: '2026-03-12',
  markersByDate: {
    '2026-03-05': {
      date: '2026-03-05',
      hasMeal: true,
      hasWorkout: true,
    },
    '2026-03-12': {
      date: '2026-03-12',
      hasMeal: false,
      hasWorkout: true,
    },
  },
  markerError: '',
  onSelectDate: vi.fn(),
  onPreviousMonth: vi.fn(),
  onNextMonth: vi.fn(),
  onSelectToday: vi.fn(),
});

describe('DashboardCalendar', () => {
  afterEach(() => {
    cleanup();
  });

  it('食事マーカーと筋トレマーカーを表示する', () => {
    render(<DashboardCalendar {...createProps()} />);

    expect(screen.getByText('筋トレ')).toBeTruthy();
    expect(screen.getByText('食事')).toBeTruthy();
    expect(screen.getAllByTitle('筋トレ記録あり')).toHaveLength(2);
    expect(screen.getAllByTitle('食事記録あり')).toHaveLength(1);
  });

  it('エラー文言を表示する', () => {
    render(
      <DashboardCalendar
        {...createProps()}
        markerError="記録マークの取得に失敗しました。"
      />,
    );

    expect(screen.getByText('記録マークの取得に失敗しました。')).toBeTruthy();
  });

  it('月移動と日付選択のハンドラーを呼ぶ', () => {
    const props = createProps();
    render(<DashboardCalendar {...props} />);

    fireEvent.click(screen.getByLabelText('前の月へ移動'));
    fireEvent.click(screen.getByText('今日へ'));
    fireEvent.click(screen.getByLabelText('次の月へ移動'));

    const selectedDayButton = screen
      .getAllByRole('button')
      .find(
        (button) =>
          button.textContent?.includes('5') &&
          button.textContent?.includes('選択中'),
      );

    expect(selectedDayButton).toBeTruthy();

    fireEvent.click(selectedDayButton!);

    expect(props.onPreviousMonth).toHaveBeenCalledTimes(1);
    expect(props.onSelectToday).toHaveBeenCalledTimes(1);
    expect(props.onNextMonth).toHaveBeenCalledTimes(1);
    expect(props.onSelectDate).toHaveBeenCalledWith('2026-03-05');
  });
});
