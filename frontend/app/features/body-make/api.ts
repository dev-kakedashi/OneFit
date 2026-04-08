import { request } from '../../shared/api/client';
import type { BodyMakePlan, BodyMakePlanSaveInput, GoalCourse } from './types';

type BodyMakePlanResponse = {
  id: number;
  user_id: number;
  course: GoalCourse;
  effective_from: string;
  duration_days: number;
  target_end_date: string;
  target_weight_kg: number;
  memo: string | null;
  start_weight_kg: number;
  maintenance_calories: number;
  daily_calorie_adjustment: number;
  target_calories: number;
};

type BodyMakePlanUpsertRequest = {
  course: GoalCourse;
  effective_from: string;
  target_weight_kg: number;
  duration_days: number;
  memo: string | null;
};

const mapBodyMakePlanResponse = (
  plan: BodyMakePlanResponse,
): BodyMakePlan => ({
  id: plan.id,
  userId: plan.user_id,
  course: plan.course,
  effectiveFrom: plan.effective_from,
  durationDays: plan.duration_days,
  targetEndDate: plan.target_end_date,
  targetWeightKg: plan.target_weight_kg,
  memo: plan.memo,
  startWeightKg: plan.start_weight_kg,
  maintenanceCalories: plan.maintenance_calories,
  dailyCalorieAdjustment: plan.daily_calorie_adjustment,
  targetCalories: plan.target_calories,
});

const mapBodyMakePlanRequest = (
  input: BodyMakePlanSaveInput,
): BodyMakePlanUpsertRequest => ({
  course: input.course,
  effective_from: input.effectiveFrom,
  target_weight_kg: input.targetWeightKg,
  duration_days: input.durationDays,
  memo: input.memo,
});

export const getLatestBodyMakePlan = async (): Promise<BodyMakePlan | null> => {
  const response = await request<BodyMakePlanResponse | null>(
    '/body-make-plans/latest',
  );

  return response ? mapBodyMakePlanResponse(response) : null;
};

export const getBodyMakePlans = async (): Promise<BodyMakePlan[]> => {
  const response = await request<BodyMakePlanResponse[]>('/body-make-plans');
  return response.map(mapBodyMakePlanResponse);
};

export const saveBodyMakePlan = async (
  input: BodyMakePlanSaveInput,
): Promise<BodyMakePlan> => {
  const response = await request<BodyMakePlanResponse>('/body-make-plans', {
    method: 'PUT',
    body: JSON.stringify(mapBodyMakePlanRequest(input)),
  });

  return mapBodyMakePlanResponse(response);
};
