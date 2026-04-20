import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api/client';
import { getLatestBodyWeightLog } from '../api';
import type { BodyWeightLog } from '../types';

export function useLatestBodyWeightLog(targetDate: string) {
  const [latestBodyWeightLog, setLatestBodyWeightLog] =
    useState<BodyWeightLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setLatestBodyWeightLog(null);
        setError('');

        const data = await getLatestBodyWeightLog(targetDate);

        if (!cancelled) {
          setLatestBodyWeightLog(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, '体重記録の取得に失敗しました。'));
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
  }, [targetDate, reloadKey]);

  return {
    latestBodyWeightLog,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
