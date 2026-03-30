export interface Meal {
  id: number;
  name: string;
  calories: number;
  date: string;
  memo?: string | null;
}

export interface MealInput {
  name: string;
  calories: number;
  date: string;
  memo?: string;
}
