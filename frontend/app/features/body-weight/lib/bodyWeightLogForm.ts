import type { BodyWeightLog } from '../types';
import type { BodyWeightLogFormData } from '../types';

export const createInitialBodyWeightLogFormData = (
  date: string,
): BodyWeightLogFormData => ({
  measuredOn: date,
  weightKg: '',
  memo: '',
});

export const toBodyWeightLogFormData = (
  bodyWeightLog: BodyWeightLog,
): BodyWeightLogFormData => ({
  measuredOn: bodyWeightLog.measuredOn,
  weightKg: bodyWeightLog.weightKg.toString(),
  memo: bodyWeightLog.memo ?? '',
});
