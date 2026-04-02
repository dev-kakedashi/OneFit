import { request } from '../../shared/api/client';
import type { WaterLog, WaterLogInput } from './types';

type WaterLogResponse = {
  id: number;
  amount_ml: number;
  drank_at: string;
  memo?: string | null;
};

type WaterLogRequest = {
  amount_ml: number;
  drank_at: string;
  memo?: string | null;
};

const mapWaterLogResponse = (waterLog: WaterLogResponse): WaterLog => ({
  id: waterLog.id,
  amountMl: waterLog.amount_ml,
  drankAt: waterLog.drank_at,
  memo: waterLog.memo,
});

const mapWaterLogRequest = (waterLog: WaterLogInput): WaterLogRequest => ({
  amount_ml: waterLog.amountMl,
  drank_at: waterLog.drankAt,
  memo: waterLog.memo?.trim() || null,
});

export const getWaterLogs = async (date: string): Promise<WaterLog[]> => {
  const response = await request<WaterLogResponse[]>('/water-logs', undefined, {
    date,
  });
  return response.map(mapWaterLogResponse);
};

export const saveWaterLog = async (
  waterLog: WaterLogInput,
): Promise<WaterLog> => {
  const response = await request<WaterLogResponse>('/water-logs', {
    method: 'POST',
    body: JSON.stringify(mapWaterLogRequest(waterLog)),
  });

  return mapWaterLogResponse(response);
};

export const updateWaterLog = async (
  id: number,
  waterLog: WaterLogInput,
): Promise<WaterLog> => {
  const response = await request<WaterLogResponse>(`/water-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapWaterLogRequest(waterLog)),
  });

  return mapWaterLogResponse(response);
};

export const deleteWaterLog = async (id: number): Promise<void> => {
  await request<void>(`/water-logs/${id}`, {
    method: 'DELETE',
  });
};
