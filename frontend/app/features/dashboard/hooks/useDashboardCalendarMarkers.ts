import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../../../shared/api/client';
import { getMonthlyMarkers } from '../api';
import { type DashboardMonthlyMarker } from '../types';

export function useDashboardCalendarMarkers(targetMonth: string) {
  const [markers, setMarkers] = useState<DashboardMonthlyMarker[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setError('');
        const data = await getMonthlyMarkers(targetMonth);

        if (!cancelled) {
          setMarkers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setMarkers([]);
          setError(getErrorMessage(err, '記録マークの取得に失敗しました。'));
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [targetMonth]);

  const markersByDate = useMemo(
    () =>
      // カレンダー描画中に日付文字列から即参照できるよう、連想配列へ正規化しておく。
      markers.reduce<Record<string, DashboardMonthlyMarker>>((acc, marker) => {
        acc[marker.date] = marker;
        return acc;
      }, {}),
    [markers],
  );

  return {
    markersByDate,
    error,
  };
}
