import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api/client';
import { getDailySummary } from '../api';
import { type DashboardSummary } from '../types';

export function useDashboardSummary(selectedDate: string) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setSummary(null);
        setError('');
        const data = await getDailySummary(selectedDate);

        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'ダッシュボードの取得に失敗しました。'));
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
  }, [selectedDate, reloadKey]);

  return {
    summary,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
