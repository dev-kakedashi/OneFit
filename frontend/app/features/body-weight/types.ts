export interface BodyWeightLog {
  id: number;
  userId: number;
  measuredOn: string;
  weightKg: number;
  memo?: string | null;
}

export interface BodyWeightLogInput {
  measuredOn: string;
  weightKg: number;
  memo?: string;
}

export interface BodyWeightLogFormData {
  measuredOn: string;
  weightKg: string;
  memo: string;
}
