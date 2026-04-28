import type { BodySettings } from '../../profile/types';
import type { BodyWeightLog } from '../types';
import { formatWeightDeltaKg, formatWeightKg } from './format';

export type BodyWeightReflectionSnapshot = {
  latestWeightLabel: string;
  currentWeightLabel: string;
  differenceLabel: string;
  helperLabel: string;
  ctaLabel: string;
  variant: 'compact' | 'strong';
};

export const buildBodyWeightReflectionSnapshot = (
  profile: BodySettings | null,
  latestLog: BodyWeightLog | null,
): BodyWeightReflectionSnapshot | null => {
  if (!profile || !latestLog) {
    return null;
  }

  const differenceKg = latestLog.weightKg - profile.weight;
  const absDifferenceKg = Math.abs(differenceKg);

  if (absDifferenceKg < 1) {
    return null;
  }

  const variant = absDifferenceKg >= 2 ? 'strong' : 'compact';

  return {
    latestWeightLabel: `最新体重：${formatWeightKg(latestLog.weightKg)}kg`,
    currentWeightLabel: `身体設定：${formatWeightKg(profile.weight)}kg`,
    differenceLabel: `体重に差があります（${formatWeightDeltaKg(differenceKg)}）`,
    helperLabel:
      'この体重を身体設定に反映すると、カロリー計算が更新されます',
    ctaLabel: 'この体重を身体設定に反映',
    variant,
  };
};
