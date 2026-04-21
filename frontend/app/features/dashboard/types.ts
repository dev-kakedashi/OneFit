import type { GoalCourse } from '../body-make/types';

export interface DashboardCurrentPlan {
  course: GoalCourse;
  targetEndDate: string | null;
  targetWeightKg: number | null;
  startWeightKg: number;
  dailyCalorieAdjustment: number | null;
}

export interface DashboardSummary {
  targetCalories: number | null;
  intakeCalories: number;
  burnedCalories: number;
  calorieBalance: number | null;
  targetWaterIntakeMl: number | null;
  waterIntakeMl: number;
  remainingWaterIntakeMl: number | null;
  currentPlan: DashboardCurrentPlan | null;
  profileRegistered: boolean;
}

export interface DashboardMonthlyMarker {
  date: string;
  hasMeal: boolean;
  hasWorkout: boolean;
}
