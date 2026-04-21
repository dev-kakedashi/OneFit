import { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../../../shared/api/client';
import { getBodySettings, saveBodySettings } from '../../profile/api';
import type { BodySettings } from '../../profile/types';
import type { BodyWeightLog } from '../types';
import {
  buildBodyWeightReflectionSnapshot,
  type BodyWeightReflectionSnapshot,
} from '../lib/reflection';
import { formatWeightKg } from '../lib/format';

type ReflectionNotice = {
  tone: 'success' | 'error';
  message: string;
};

type UseBodyWeightReflectionOptions = {
  latestLog: BodyWeightLog | null;
  enabled?: boolean;
  onSaved?: () => void;
};

type UseBodyWeightReflectionResult = {
  loading: boolean;
  saving: boolean;
  notice: ReflectionNotice | null;
  snapshot: BodyWeightReflectionSnapshot | null;
  reflectLatestWeight: () => Promise<void>;
};

export function useBodyWeightReflection({
  latestLog,
  enabled = true,
  onSaved,
}: UseBodyWeightReflectionOptions): UseBodyWeightReflectionResult {
  const [profile, setProfile] = useState<BodySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ReflectionNotice | null>(null);

  useEffect(() => {
    if (!enabled) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);

        const data = await getBodySettings();

        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setNotice({
            tone: 'error',
            message: getErrorMessage(err, '身体設定の取得に失敗しました。'),
          });
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
  }, [enabled]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const snapshot = useMemo(
    () => buildBodyWeightReflectionSnapshot(profile, latestLog),
    [profile, latestLog],
  );

  const reflectLatestWeight = async () => {
    if (!profile || !latestLog || snapshot === null) {
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      const savedProfile = await saveBodySettings({
        ...profile,
        weight: latestLog.weightKg,
      });

      setProfile(savedProfile);
      onSaved?.();
      setNotice({
        tone: 'success',
        message: `身体設定の体重を${formatWeightKg(latestLog.weightKg)}kgに反映しました。カロリーを再計算しました。`,
      });
    } catch (err) {
      setNotice({
        tone: 'error',
        message: getErrorMessage(err, '体重の反映に失敗しました。'),
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    notice,
    snapshot,
    reflectLatestWeight,
  };
}
