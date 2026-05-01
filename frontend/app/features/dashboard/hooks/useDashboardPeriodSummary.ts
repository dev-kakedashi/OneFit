import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../../shared/api/client';
import { getPeriodSummary } from '../api';
import type { DashboardPeriodSummary } from '../types';

type UseDashboardPeriodSummaryResult = {
  summary: DashboardPeriodSummary | null;
  loading: boolean;
  error: string;
  reload: () => void;
};

export function useDashboardPeriodSummary(
  anchorDate: string,
): UseDashboardPeriodSummaryResult {
  const [summary, setSummary] = useState<DashboardPeriodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const previousRangeRef = useRef(anchorDate);

  useEffect(() => {
    let cancelled = false;
    const isRangeChanged = previousRangeRef.current !== anchorDate;
    previousRangeRef.current = anchorDate;

    const run = async () => {
      try {
        setLoading(true);
        if (isRangeChanged) {
          setSummary(null);
        }
        setError('');
        const data = await getPeriodSummary(anchorDate);

        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, '週間サマリーの取得に失敗しました。'));
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
  }, [anchorDate, reloadKey]);

  return {
    summary,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
