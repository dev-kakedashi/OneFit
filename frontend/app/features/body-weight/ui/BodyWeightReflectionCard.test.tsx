// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildBodyWeightReflectionSnapshot } from '../lib/reflection';
import { BodyWeightReflectionCard } from './BodyWeightReflectionCard';

describe('BodyWeightReflectionCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('差分が 2kg 以上なら強調して表示する', () => {
    const snapshot = buildBodyWeightReflectionSnapshot(
      {
        height: 175,
        weight: 70,
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
        dailyWaterGoalMl: 2000,
      },
      {
        id: 1,
        userId: 1,
        measuredOn: '2026-04-22',
        weightKg: 66,
        memo: null,
      },
    );

    const onReflect = vi.fn();

    render(
      <BodyWeightReflectionCard
        snapshot={snapshot}
        saving={false}
        onReflect={onReflect}
      />,
    );

    expect(screen.getByText('体重に差があります（-4kg）')).toBeTruthy();
    expect(
      screen.getByText('この体重を基本設定に反映すると、カロリー計算が更新されます'),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: 'この体重を基本設定に反映' }),
    );

    expect(onReflect).toHaveBeenCalledTimes(1);
  });

  it('差分が 1kg 未満なら表示しない', () => {
    const snapshot = buildBodyWeightReflectionSnapshot(
      {
        height: 175,
        weight: 70,
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
        dailyWaterGoalMl: 2000,
      },
      {
        id: 1,
        userId: 1,
        measuredOn: '2026-04-22',
        weightKg: 69.4,
        memo: null,
      },
    );

    const { container } = render(
      <BodyWeightReflectionCard
        snapshot={snapshot}
        saving={false}
        onReflect={vi.fn()}
      />,
    );

    expect(snapshot).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('差分が 1kg 以上 2kg 未満なら通常表示になる', () => {
    const snapshot = buildBodyWeightReflectionSnapshot(
      {
        height: 175,
        weight: 70,
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
        dailyWaterGoalMl: 2000,
      },
      {
        id: 1,
        userId: 1,
        measuredOn: '2026-04-22',
        weightKg: 68.8,
        memo: null,
      },
    );

    render(
      <BodyWeightReflectionCard
        snapshot={snapshot}
        saving={false}
        onReflect={vi.fn()}
      />,
    );

    expect(screen.getByText('体重に差があります（-1.2kg）')).toBeTruthy();
    expect(
      screen.queryByText(
        'この体重を基本設定に反映すると、カロリー計算が更新されます',
      ),
    ).toBeNull();
  });
});
