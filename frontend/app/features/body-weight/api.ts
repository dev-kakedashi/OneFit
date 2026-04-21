import { request } from '../../shared/api/client';
import type { BodyWeightLog, BodyWeightLogInput } from './types';

type BodyWeightLogResponse = {
  id: number;
  user_id: number;
  measured_on: string;
  weight_kg: number;
  memo?: string | null;
};

type BodyWeightLogRequest = {
  measured_on: string;
  weight_kg: number;
  memo?: string | null;
};

const mapBodyWeightLogResponse = (
  bodyWeightLog: BodyWeightLogResponse,
): BodyWeightLog => ({
  id: bodyWeightLog.id,
  userId: bodyWeightLog.user_id,
  measuredOn: bodyWeightLog.measured_on,
  weightKg: bodyWeightLog.weight_kg,
  memo: bodyWeightLog.memo,
});

const mapBodyWeightLogRequest = (
  bodyWeightLog: BodyWeightLogInput,
): BodyWeightLogRequest => ({
  measured_on: bodyWeightLog.measuredOn,
  weight_kg: bodyWeightLog.weightKg,
  memo: bodyWeightLog.memo?.trim() || null,
});

export const getBodyWeightLogs = async (
  dateFrom: string,
  dateTo?: string,
): Promise<BodyWeightLog[]> => {
  const response = await request<BodyWeightLogResponse[]>(
    '/body-weight-logs',
    undefined,
    {
      date_from: dateFrom,
      date_to: dateTo ?? dateFrom,
    },
  );

  return response.map(mapBodyWeightLogResponse);
};

export const getLatestBodyWeightLog = async (
  date: string,
): Promise<BodyWeightLog | null> => {
  const response = await request<BodyWeightLogResponse | null>(
    '/body-weight-logs/latest',
    undefined,
    {
      date,
    },
  );

  return response ? mapBodyWeightLogResponse(response) : null;
};

export const saveBodyWeightLog = async (
  bodyWeightLog: BodyWeightLogInput,
): Promise<BodyWeightLog> => {
  const response = await request<BodyWeightLogResponse>('/body-weight-logs', {
    method: 'PUT',
    body: JSON.stringify(mapBodyWeightLogRequest(bodyWeightLog)),
  });

  return mapBodyWeightLogResponse(response);
};

export const deleteBodyWeightLog = async (id: number): Promise<void> => {
  await request<void>(`/body-weight-logs/${id}`, {
    method: 'DELETE',
  });
};
