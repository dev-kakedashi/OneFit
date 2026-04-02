import {
  buildDefaultDateTime,
  formatDateTimeInputValue,
} from '../../../shared/lib/date';
import type { WaterLog, WaterLogFormData } from '../types';

export const createInitialWaterLogFormData = (
  date: string,
): WaterLogFormData => ({
  amountMl: '',
  drankAt: buildDefaultDateTime(date),
  memo: '',
});

export const toWaterLogFormData = (
  waterLog: WaterLog,
): WaterLogFormData => ({
  amountMl: waterLog.amountMl.toString(),
  drankAt: formatDateTimeInputValue(waterLog.drankAt),
  memo: waterLog.memo ?? '',
});
