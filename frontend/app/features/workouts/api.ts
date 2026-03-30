import { request } from '../../shared/api/client';
import type { Workout, WorkoutInput } from './types';

type WorkoutResponse = {
  id: number;
  workout_name: string;
  burned_calories: number;
  worked_out_at: string;
  memo?: string | null;
};

type WorkoutRequest = {
  workout_name: string;
  burned_calories: number;
  worked_out_at: string;
  memo?: string | null;
};

const mapWorkoutResponse = (workout: WorkoutResponse): Workout => ({
  id: workout.id,
  exercise: workout.workout_name,
  caloriesBurned: workout.burned_calories,
  date: workout.worked_out_at,
  memo: workout.memo,
});

const mapWorkoutRequest = (workout: WorkoutInput): WorkoutRequest => ({
  workout_name: workout.exercise,
  burned_calories: workout.caloriesBurned,
  worked_out_at: workout.date,
  memo: workout.memo?.trim() || null,
});

export const getWorkouts = async (date: string): Promise<Workout[]> => {
  const response = await request<WorkoutResponse[]>(
    '/workout-logs',
    undefined,
    { date },
  );

  return response.map(mapWorkoutResponse);
};

export const saveWorkout = async (
  workout: WorkoutInput,
): Promise<Workout> => {
  const response = await request<WorkoutResponse>('/workout-logs', {
    method: 'POST',
    body: JSON.stringify(mapWorkoutRequest(workout)),
  });

  return mapWorkoutResponse(response);
};

export const updateWorkout = async (
  id: number,
  workout: WorkoutInput,
): Promise<Workout> => {
  const response = await request<WorkoutResponse>(`/workout-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapWorkoutRequest(workout)),
  });

  return mapWorkoutResponse(response);
};

export const deleteWorkout = async (id: number): Promise<void> => {
  await request<void>(`/workout-logs/${id}`, {
    method: 'DELETE',
  });
};
