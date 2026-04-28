import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../../../shared/api/client';
import { getBodyWeightLogs } from '../api';
import {
  getBodyWeightHistoryWindow,
  sortBodyWeightLogsAscending,
  type BodyWeightHistoryRange,
  type BodyWeightHistoryWindow,
} from '../lib/history';
import type { BodyWeightLog } from '../types';

type UseBodyWeightHistoryResult = {
  logs: BodyWeightLog[];
  loading: boolean;
  error: string;
  reload: () => void;
  window: BodyWeightHistoryWindow;
};

export function useBodyWeightHistory(
  endDate: string,
  range: BodyWeightHistoryRange,
  refreshToken = 0,
): UseBodyWeightHistoryResult {
  const [logs, setLogs] = useState<BodyWeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const window = useMemo(
    () => getBodyWeightHistoryWindow(endDate, range),
    [endDate, range],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setLogs([]);
        setError('');

        const data = await getBodyWeightLogs(window.startDate, window.endDate);

        if (!cancelled) {
          setLogs(sortBodyWeightLogsAscending(data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, '体重推移の取得に失敗しました。'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [window.startDate, window.endDate, reloadKey, refreshToken]);

  return {
    logs,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
    window,
  };
}
