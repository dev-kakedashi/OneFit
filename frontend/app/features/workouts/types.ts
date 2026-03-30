export interface Workout {
  id: number;
  exercise: string;
  caloriesBurned: number;
  date: string;
  memo?: string | null;
}

export interface WorkoutInput {
  exercise: string;
  caloriesBurned: number;
  date: string;
  memo?: string;
}
