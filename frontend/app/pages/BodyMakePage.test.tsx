// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { getBodySettings } = vi.hoisted(() => ({
  getBodySettings: vi.fn(),
}));

const { getBodyMakePlans, saveBodyMakePlan, deleteBodyMakePlan } = vi.hoisted(
  () => ({
    getBodyMakePlans: vi.fn(),
    saveBodyMakePlan: vi.fn(),
    deleteBodyMakePlan: vi.fn(),
  }),
);

vi.mock('../features/profile/api', () => ({
  getBodySettings,
}));

vi.mock('../features/body-make/api', () => ({
  getBodyMakePlans,
  saveBodyMakePlan,
  deleteBodyMakePlan,
}));

vi.mock('../shared/lib/date', async () => {
  const actual = await vi.importActual<typeof import('../shared/lib/date')>(
    '../shared/lib/date',
  );

  return {
    ...actual,
    getTodayString: () => '2026-04-08',
    getTomorrowString: () => '2026-04-09',
  };
});

import { BodyMakePage } from './BodyMakePage';

describe('BodyMakePage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('プロフィール未登録時は身体設定への導線を表示する', async () => {
    getBodySettings.mockResolvedValue(null);
    getBodyMakePlans.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <BodyMakePage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('まずは身体設定を入力してください'),
    ).toBeTruthy();

    const bodySettingsLink = screen.getByRole('link', {
      name: '身体設定に移動',
    });

    expect(bodySettingsLink.getAttribute('href')).toBe('/body-settings');
  });

  it('新規作成時は今日からのダイエットプランを保存できる', async () => {
    getBodySettings.mockResolvedValue({
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      dailyWaterGoalMl: 2000,
    });
    getBodyMakePlans.mockResolvedValue([]);
    saveBodyMakePlan.mockResolvedValue({
      id: 1,
      userId: 1,
      course: 'diet',
      effectiveFrom: '2026-04-08',
      durationDays: 90,
      targetEndDate: '2026-07-06',
      targetWeightKg: 5,
      memo: '夏までに絞る',
      startWeightKg: 70,
      maintenanceCalories: 2636,
      dailyCalorieAdjustment: 400,
      targetCalories: 2236,
    });

    render(
      <MemoryRouter>
        <BodyMakePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('ボディメイク')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '目標を設定' }));
    fireEvent.click(screen.getByRole('button', { name: /ダイエット/ }));

    fireEvent.change(screen.getByLabelText('目標増減数 (kg) *'), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText('達成期間 (日) *'), {
      target: { value: '90' },
    });
    fireEvent.change(screen.getByLabelText('メモ'), {
      target: { value: '夏までに絞る' },
    });

    expect(screen.getByText('2236 kcal/日')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '設定' }));

    await waitFor(() =>
      expect(saveBodyMakePlan).toHaveBeenCalledWith({
        course: 'diet',
        effectiveFrom: '2026-04-08',
        targetWeightKg: 5,
        durationDays: 90,
        memo: '夏までに絞る',
      }),
    );

    expect(await screen.findByText('保存しました！')).toBeTruthy();
  });

  it('既存プランがある場合は明日からが初期選択になる', async () => {
    getBodySettings.mockResolvedValue({
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      dailyWaterGoalMl: 2000,
    });
    getBodyMakePlans.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        course: 'diet',
        effectiveFrom: '2026-04-01',
        durationDays: 90,
        targetEndDate: '2026-06-29',
        targetWeightKg: 5,
        memo: '継続中',
        startWeightKg: 70,
        maintenanceCalories: 2636,
        dailyCalorieAdjustment: 400,
        targetCalories: 2236,
      },
    ]);
    saveBodyMakePlan.mockResolvedValue({
      id: 2,
      userId: 1,
      course: 'bulk',
      effectiveFrom: '2026-04-09',
      durationDays: 90,
      targetEndDate: '2026-07-07',
      targetWeightKg: 3,
      memo: '次は増量',
      startWeightKg: 70,
      maintenanceCalories: 2636,
      dailyCalorieAdjustment: 240,
      targetCalories: 2876,
    });

    render(
      <MemoryRouter>
        <BodyMakePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('現在有効なプラン')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '目標を再設定' }));

    const tomorrowButton = screen.getByRole('button', {
      name: '明日から（おすすめ）',
    });

    expect(tomorrowButton.getAttribute('aria-pressed')).toBe('true');
    expect(
      screen.getByText(
        '2026年4月9日から新しい目標へ切り替わります。今日の記録はそのまま残ります。',
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /増量/ }));
    fireEvent.change(screen.getByLabelText('目標増減数 (kg) *'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('達成期間 (日) *'), {
      target: { value: '90' },
    });
    fireEvent.change(screen.getByLabelText('メモ'), {
      target: { value: '次は増量' },
    });

    fireEvent.click(screen.getByRole('button', { name: '設定' }));

    await waitFor(() =>
      expect(saveBodyMakePlan).toHaveBeenCalledWith({
        course: 'bulk',
        effectiveFrom: '2026-04-09',
        targetWeightKg: 3,
        durationDays: 90,
        memo: '次は増量',
      }),
    );
  });

  it('次回適用予定プランは予約を取り消せる', async () => {
    getBodySettings.mockResolvedValue({
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      dailyWaterGoalMl: 2000,
    });
    getBodyMakePlans.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        course: 'diet',
        effectiveFrom: '2026-04-01',
        durationDays: 90,
        targetEndDate: '2026-06-29',
        targetWeightKg: 5,
        memo: '継続中',
        startWeightKg: 70,
        maintenanceCalories: 2636,
        dailyCalorieAdjustment: 400,
        targetCalories: 2236,
      },
      {
        id: 2,
        userId: 1,
        course: 'bulk',
        effectiveFrom: '2026-04-09',
        durationDays: 90,
        targetEndDate: '2026-07-07',
        targetWeightKg: 3,
        memo: '次は増量',
        startWeightKg: 70,
        maintenanceCalories: 2636,
        dailyCalorieAdjustment: 240,
        targetCalories: 2876,
      },
    ]);
    deleteBodyMakePlan.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <BodyMakePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('次回適用予定')).toBeTruthy();
    expect(
      screen.getByText('2026年4月9日から自動で切り替わります'),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '予約を取り消す' }));
    fireEvent.click(screen.getByRole('button', { name: '取り消す' }));

    await waitFor(() => expect(deleteBodyMakePlan).toHaveBeenCalledWith(2));
    await waitFor(() =>
      expect(screen.queryByText('次回適用予定')).toBeNull(),
    );
  });

  it('危険すぎるダイエット設定では保存を止める', async () => {
    getBodySettings.mockResolvedValue({
      height: 165,
      weight: 70,
      age: 26,
      gender: 'male',
      activityLevel: 'moderate',
      dailyWaterGoalMl: 2000,
    });
    getBodyMakePlans.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <BodyMakePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('ボディメイク')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '目標を設定' }));
    fireEvent.click(screen.getByRole('button', { name: /ダイエット/ }));

    fireEvent.change(screen.getByLabelText('目標増減数 (kg) *'), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText('達成期間 (日) *'), {
      target: { value: '15' },
    });

    expect(
      await screen.findByText('この設定では安全なプランを作成できません'),
    ).toBeTruthy();
    expect(screen.getByText(/50〜70日程度/)).toBeTruthy();

    const saveButton = screen.getByRole('button', {
      name: '設定',
    }) as HTMLButtonElement;

    expect(saveButton.disabled).toBe(true);
    expect(screen.queryByText('200 kcal/日')).toBeNull();
    expect(saveBodyMakePlan).not.toHaveBeenCalled();
  });

  it('危険な増量設定では同意チェック後に保存できる', async () => {
    getBodySettings.mockResolvedValue({
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      dailyWaterGoalMl: 2000,
    });
    getBodyMakePlans.mockResolvedValue([]);
    saveBodyMakePlan.mockResolvedValue({
      id: 1,
      userId: 1,
      course: 'bulk',
      effectiveFrom: '2026-04-08',
      durationDays: 30,
      targetEndDate: '2026-05-07',
      targetWeightKg: 3,
      memo: '筋量アップ',
      startWeightKg: 70,
      maintenanceCalories: 2636,
      dailyCalorieAdjustment: 720,
      targetCalories: 3356,
    });

    render(
      <MemoryRouter>
        <BodyMakePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('ボディメイク')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '目標を設定' }));
    fireEvent.click(screen.getByRole('button', { name: /増量/ }));

    expect(
      screen.getByText(
        'おすすめの増量は、少しずつ体重を増やしながら筋トレを継続する方法です',
      ),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText('目標増減数 (kg) *'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('達成期間 (日) *'), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText('メモ'), {
      target: { value: '筋量アップ' },
    });

    expect(
      await screen.findByText(
        'この目標は増量ペースが高く、脂肪増加が大きくなる可能性があります',
      ),
    ).toBeTruthy();
    expect(screen.getByText(/84〜105日程度/)).toBeTruthy();

    const saveButton = screen.getByRole('button', {
      name: '設定',
    }) as HTMLButtonElement;

    expect(saveButton.disabled).toBe(true);

    fireEvent.click(
      screen.getByLabelText('脂肪増加リスクを理解した上でこの目標を設定する'),
    );

    expect(saveButton.disabled).toBe(false);

    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(saveBodyMakePlan).toHaveBeenCalledWith({
        course: 'bulk',
        effectiveFrom: '2026-04-08',
        targetWeightKg: 3,
        durationDays: 30,
        memo: '筋量アップ',
      }),
    );
  });
});
