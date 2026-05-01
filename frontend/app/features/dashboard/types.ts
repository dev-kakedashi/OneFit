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

export interface DashboardPeriodSummary {
  windowStartDate: string;
  windowEndDate: string;
  windowDays: number;
  calorieTargetTotal: number | null;
  intakeCalories: number;
  burnedCalories: number;
  waterTargetTotalMl: number | null;
  waterIntakeMl: number;
  mealLogCount: number;
  mealDayCount: number;
  workoutLogCount: number;
  workoutDayCount: number;
  waterLogCount: number;
  waterDayCount: number;
  bodyWeightLogCount: number;
  bodyWeightDayCount: number;
  recordedDayCount: number;
  bodyWeightStartKg: number | null;
  bodyWeightEndKg: number | null;
  bodyWeightChangeKg: number | null;
  profileRegistered: boolean;
}

export interface DashboardMonthlyMarker {
  date: string;
  hasMeal: boolean;
  hasWorkout: boolean;
}
