export type GoalCourse = 'maintenance' | 'diet' | 'bulk';
export type BodyMakeApplyStartOption = 'today' | 'tomorrow';

export interface BodyMakePlan {
  id: number;
  userId: number;
  course: GoalCourse;
  effectiveFrom: string;
  durationDays: number;
  targetEndDate: string;
  targetWeightKg: number;
  memo: string | null;
  startWeightKg: number;
  maintenanceCalories: number;
  dailyCalorieAdjustment: number;
  targetCalories: number;
}

export interface BodyMakePlanSaveInput {
  course: GoalCourse;
  effectiveFrom: string;
  targetWeightKg: number;
  durationDays: number;
  memo: string | null;
}

export interface BodyMakePlanPreview {
  maintenanceCalories: number;
  targetWeightKg: number;
  durationDays: number;
  dailyCalorieAdjustment: number;
  targetCalories: number;
}

export interface BodyMakePlanTimeline {
  currentPlan: BodyMakePlan | null;
  upcomingPlan: BodyMakePlan | null;
}
