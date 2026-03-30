import { request } from '../../shared/api/client';
import type { DashboardSummary } from './types';

type DashboardResponse = {
  summary: {
    target_calories: number | null;
    intake_calories: number;
    burned_calories: number;
    calorie_balance: number | null;
    profile_registered: boolean;
  };
};

export const getDailySummary = async (
  date: string,
): Promise<DashboardSummary> => {
  const response = await request<DashboardResponse>(
    '/dashboard/daily-summary',
    undefined,
    { date },
  );

  return {
    targetCalories: response.summary.target_calories,
    intakeCalories: response.summary.intake_calories,
    burnedCalories: response.summary.burned_calories,
    calorieBalance: response.summary.calorie_balance,
    profileRegistered: response.summary.profile_registered,
  };
};
