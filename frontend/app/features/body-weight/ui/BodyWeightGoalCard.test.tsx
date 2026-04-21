// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { BodyWeightGoalCard } from './BodyWeightGoalCard';

describe('BodyWeightGoalCard', () => {
  it('未達時は開始時体重から固定の目標体重を表示する', () => {
    render(
      <MemoryRouter>
        <BodyWeightGoalCard
          plan={{
            course: 'diet',
            targetEndDate: '2026-07-04',
            targetWeightKg: 5,
            startWeightKg: 70,
            dailyCalorieAdjustment: 400,
          }}
          latestLog={{
            id: 1,
            userId: 1,
            measuredOn: '2026-04-20',
            weightKg: 67.5,
            memo: null,
          }}
          loading={false}
          error=""
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('目標 65kg')).toBeTruthy();
    expect(screen.getByText(/残り 2\.5kg/)).toBeTruthy();

    const link = screen.getByRole('link', { name: '体重記録へ' });
    expect(link.getAttribute('href')).toBe('/body-weight-logs');
  });

  it('目標達成時は新しい目標設定へ誘導する', () => {
    render(
      <MemoryRouter>
        <BodyWeightGoalCard
          plan={{
            course: 'diet',
            targetEndDate: '2026-07-04',
            targetWeightKg: 5,
            startWeightKg: 70,
            dailyCalorieAdjustment: 400,
          }}
          latestLog={{
            id: 1,
            userId: 1,
            measuredOn: '2026-04-20',
            weightKg: 64.8,
            memo: null,
          }}
          loading={false}
          error=""
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('目標達成')).toBeTruthy();

    const link = screen.getByRole('link', { name: '新しい目標を設定' });
    expect(link.getAttribute('href')).toBe('/body-make');
  });

  it('記録がない場合は記録導線を表示する', () => {
    render(
      <MemoryRouter>
        <BodyWeightGoalCard
          plan={null}
          latestLog={null}
          loading={false}
          error=""
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: '体重を記録' });
    expect(link.getAttribute('href')).toBe('/body-weight-logs');
  });
});
