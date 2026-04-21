export interface WaterLog {
  id: number;
  amountMl: number;
  drankAt: string;
  memo?: string | null;
}

export interface WaterLogInput {
  amountMl: number;
  drankAt: string;
  memo?: string;
}

export interface WaterLogFormData {
  amountMl: string;
  drankAt: string;
  memo: string;
}
