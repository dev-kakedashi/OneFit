export interface DashboardSummary {
  targetCalories: number | null;
  intakeCalories: number;
  burnedCalories: number;
  calorieBalance: number | null;
  profileRegistered: boolean;
}

export interface DashboardMonthlyMarker {
  date: string;
  hasMeal: boolean;
  hasWorkout: boolean;
}
