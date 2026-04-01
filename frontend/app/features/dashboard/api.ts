import { request } from '../../shared/api/client';
import type { DashboardMonthlyMarker, DashboardSummary } from './types';

type DashboardResponse = {
  summary: {
    target_calories: number | null;
    intake_calories: number;
    burned_calories: number;
    calorie_balance: number | null;
    profile_registered: boolean;
  };
};

type DashboardMonthlyMarkersResponse = {
  markers: {
    date: string;
    has_meal: boolean;
    has_workout: boolean;
  }[];
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

export const getMonthlyMarkers = async (
  month: string,
): Promise<DashboardMonthlyMarker[]> => {
  const response = await request<DashboardMonthlyMarkersResponse>(
    '/dashboard/monthly-markers',
    undefined,
    { month },
  );

  return response.markers.map((marker) => ({
    date: marker.date,
    hasMeal: marker.has_meal,
    hasWorkout: marker.has_workout,
  }));
};
