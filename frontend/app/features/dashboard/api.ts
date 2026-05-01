import { request } from '../../shared/api/client';
import type { GoalCourse } from '../body-make/types';
import type {
  DashboardMonthlyMarker,
  DashboardPeriodSummary,
  DashboardSummary,
} from './types';

type DashboardResponse = {
  summary: {
    target_calories: number | null;
    daily_calorie_adjustment: number | null;
    intake_calories: number;
    burned_calories: number;
    calorie_balance: number | null;
    target_water_intake_ml: number | null;
    water_intake_ml: number;
    remaining_water_intake_ml: number | null;
    course: GoalCourse | null;
    target_end_date: string | null;
    target_weight_kg: number | null;
    start_weight_kg: number | null;
    body_make_plan_registered: boolean;
    profile_registered: boolean;
  };
};

type DashboardPeriodSummaryResponse = {
  summary: {
    window_start_date: string;
    window_end_date: string;
    window_days: number;
    calorie_target_total: number | null;
    intake_calories: number;
    burned_calories: number;
    water_target_total_ml: number | null;
    water_intake_ml: number;
    meal_log_count: number;
    meal_day_count: number;
    workout_log_count: number;
    workout_day_count: number;
    water_log_count: number;
    water_day_count: number;
    body_weight_log_count: number;
    body_weight_day_count: number;
    recorded_day_count: number;
    body_weight_start_kg: number | null;
    body_weight_end_kg: number | null;
    body_weight_change_kg: number | null;
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

  const currentPlan =
    response.summary.body_make_plan_registered && response.summary.course
      ? {
          course: response.summary.course,
          targetEndDate: response.summary.target_end_date,
          targetWeightKg: response.summary.target_weight_kg,
          startWeightKg: response.summary.start_weight_kg!,
          dailyCalorieAdjustment: response.summary.daily_calorie_adjustment,
        }
      : null;

  return {
    targetCalories: response.summary.target_calories,
    intakeCalories: response.summary.intake_calories,
    burnedCalories: response.summary.burned_calories,
    calorieBalance: response.summary.calorie_balance,
    targetWaterIntakeMl: response.summary.target_water_intake_ml,
    waterIntakeMl: response.summary.water_intake_ml,
    remainingWaterIntakeMl: response.summary.remaining_water_intake_ml,
    currentPlan,
    profileRegistered: response.summary.profile_registered,
  };
};

export const getPeriodSummary = async (
  date: string,
): Promise<DashboardPeriodSummary> => {
  const response = await request<DashboardPeriodSummaryResponse>(
    '/dashboard/period-summary',
    undefined,
    { date },
  );

  return {
    windowStartDate: response.summary.window_start_date,
    windowEndDate: response.summary.window_end_date,
    windowDays: response.summary.window_days,
    calorieTargetTotal: response.summary.calorie_target_total,
    intakeCalories: response.summary.intake_calories,
    burnedCalories: response.summary.burned_calories,
    waterTargetTotalMl: response.summary.water_target_total_ml,
    waterIntakeMl: response.summary.water_intake_ml,
    mealLogCount: response.summary.meal_log_count,
    mealDayCount: response.summary.meal_day_count,
    workoutLogCount: response.summary.workout_log_count,
    workoutDayCount: response.summary.workout_day_count,
    waterLogCount: response.summary.water_log_count,
    waterDayCount: response.summary.water_day_count,
    bodyWeightLogCount: response.summary.body_weight_log_count,
    bodyWeightDayCount: response.summary.body_weight_day_count,
    recordedDayCount: response.summary.recorded_day_count,
    bodyWeightStartKg: response.summary.body_weight_start_kg,
    bodyWeightEndKg: response.summary.body_weight_end_kg,
    bodyWeightChangeKg: response.summary.body_weight_change_kg,
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
