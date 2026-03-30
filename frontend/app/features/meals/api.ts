import { request } from '../../shared/api/client';
import type { Meal, MealInput } from './types';

type MealResponse = {
  id: number;
  meal_name: string;
  calories: number;
  eaten_at: string;
  memo?: string | null;
};

type MealRequest = {
  meal_name: string;
  calories: number;
  eaten_at: string;
  memo?: string | null;
};

const mapMealResponse = (meal: MealResponse): Meal => ({
  id: meal.id,
  name: meal.meal_name,
  calories: meal.calories,
  date: meal.eaten_at,
  memo: meal.memo,
});

const mapMealRequest = (meal: MealInput): MealRequest => ({
  meal_name: meal.name,
  calories: meal.calories,
  eaten_at: meal.date,
  memo: meal.memo?.trim() || null,
});

export const getMeals = async (date: string): Promise<Meal[]> => {
  const response = await request<MealResponse[]>('/meal-logs', undefined, {
    date,
  });

  return response.map(mapMealResponse);
};

export const saveMeal = async (meal: MealInput): Promise<Meal> => {
  const response = await request<MealResponse>('/meal-logs', {
    method: 'POST',
    body: JSON.stringify(mapMealRequest(meal)),
  });

  return mapMealResponse(response);
};

export const updateMeal = async (
  id: number,
  meal: MealInput,
): Promise<Meal> => {
  const response = await request<MealResponse>(`/meal-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapMealRequest(meal)),
  });

  return mapMealResponse(response);
};

export const deleteMeal = async (id: number): Promise<void> => {
  await request<void>(`/meal-logs/${id}`, {
    method: 'DELETE',
  });
};
