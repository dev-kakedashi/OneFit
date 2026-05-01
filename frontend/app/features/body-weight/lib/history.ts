import { addDaysToDateOnly, formatDateOnly } from '../../../shared/lib/date';
import type { BodyWeightLog } from '../types';

export type BodyWeightHistoryRange = '1w' | '1m' | '3m' | '6m' | '1y';

export type BodyWeightHistoryRangeOption = {
  value: BodyWeightHistoryRange;
  label: string;
};

export const BODY_WEIGHT_HISTORY_RANGE_OPTIONS: BodyWeightHistoryRangeOption[] = [
  { value: '1w', label: '1週間' },
  { value: '1m', label: '1カ月' },
  { value: '3m', label: '3カ月' },
  { value: '6m', label: '6カ月' },
  { value: '1y', label: '1年' },
];

export const DEFAULT_BODY_WEIGHT_HISTORY_RANGE: BodyWeightHistoryRange = '1m';

export type BodyWeightHistoryWindow = {
  startDate: string;
  endDate: string;
};

export type BodyWeightHistoryStats = {
  count: number;
  startWeightKg: number;
  endWeightKg: number;
  changeKg: number;
  averageWeightKg: number;
  minWeightKg: number;
  maxWeightKg: number;
};

const addMonthsToDateOnly = (dateString: string, months: number): string => {
  const date = new Date(`${dateString}T00:00:00`);
  const originalDay = date.getDate();

  date.setDate(1);
  date.setMonth(date.getMonth() + months);

  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  date.setDate(Math.min(originalDay, lastDayOfMonth));
  return formatDateOnly(date);
};

export const getBodyWeightHistoryWindow = (
  endDate: string,
  range: BodyWeightHistoryRange,
): BodyWeightHistoryWindow => {
  let startDate: string;

  switch (range) {
    case '1w':
      startDate = addDaysToDateOnly(endDate, -6);
      break;
    case '1m':
      startDate = addMonthsToDateOnly(endDate, -1);
      break;
    case '3m':
      startDate = addMonthsToDateOnly(endDate, -3);
      break;
    case '6m':
      startDate = addMonthsToDateOnly(endDate, -6);
      break;
    case '1y':
      startDate = addMonthsToDateOnly(endDate, -12);
      break;
  }

  return {
    startDate,
    endDate,
  };
};

export const sortBodyWeightLogsAscending = (
  logs: BodyWeightLog[],
): BodyWeightLog[] =>
  [...logs].sort((left, right) => {
    const leftTime = new Date(`${left.measuredOn}T00:00:00`).getTime();
    const rightTime = new Date(`${right.measuredOn}T00:00:00`).getTime();

    return leftTime - rightTime || left.id - right.id;
  });

export const buildBodyWeightHistoryStats = (
  logs: BodyWeightLog[],
): BodyWeightHistoryStats | null => {
  if (logs.length === 0) {
    return null;
  }

  const sortedLogs = sortBodyWeightLogsAscending(logs);
  const weights = sortedLogs.map((log) => log.weightKg);
  const count = sortedLogs.length;
  const startWeightKg = sortedLogs[0]!.weightKg;
  const endWeightKg = sortedLogs[count - 1]!.weightKg;
  const changeKg = endWeightKg - startWeightKg;
  const averageWeightKg =
    weights.reduce((total, weight) => total + weight, 0) / count;

  return {
    count,
    startWeightKg,
    endWeightKg,
    changeKg,
    averageWeightKg,
    minWeightKg: Math.min(...weights),
    maxWeightKg: Math.max(...weights),
  };
};

export const formatBodyWeightHistoryDateLabel = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatBodyWeightHistoryCompactDateLabel = (
  value: string,
): string => {
  const date = new Date(`${value}T00:00:00`);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatBodyWeightHistoryWindowLabel = (
  window: BodyWeightHistoryWindow,
): string =>
  `${formatBodyWeightHistoryCompactDateLabel(window.startDate)} 〜 ${formatBodyWeightHistoryCompactDateLabel(window.endDate)}`;
