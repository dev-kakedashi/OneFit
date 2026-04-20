import type { DashboardCurrentPlan } from '../../dashboard/types';
import type { BodyWeightLog } from '../types';
import { formatBodyWeightDate, formatWeightKg } from './format';

export type BodyWeightGoalSnapshot = {
  title: string;
  statusLabel: string;
  detailLabel: string;
  ctaLabel: string;
  ctaHref: string;
  tone: 'neutral' | 'info' | 'success';
  achieved: boolean;
};

export const buildBodyWeightGoalSnapshot = (
  plan: DashboardCurrentPlan | null,
  latestLog: BodyWeightLog | null,
): BodyWeightGoalSnapshot => {
  if (!plan) {
    if (!latestLog) {
      return {
        title: '体重',
        statusLabel: 'まだ記録がありません',
        detailLabel: 'まずは 1 件、記録を始めましょう',
        ctaLabel: '体重を記録',
        ctaHref: '/body-weight-logs',
        tone: 'neutral',
        achieved: false,
      };
    }

    return {
      title: '体重',
      statusLabel: 'ボディメイク未設定',
      detailLabel: `最新 ${formatWeightKg(latestLog.weightKg)}kg / ${formatBodyWeightDate(latestLog.measuredOn)}`,
      ctaLabel: '目標を設定',
      ctaHref: '/body-make',
      tone: 'info',
      achieved: false,
    };
  }

  if (!latestLog) {
    return {
      title: '体重',
      statusLabel:
        plan.course === 'maintenance'
          ? '現状維持中'
          : 'まだ体重記録がありません',
      detailLabel:
        plan.course === 'maintenance'
          ? '記録を続けると変化が見えやすくなります'
          : '記録を追加すると目標との差が見えます',
      ctaLabel: '体重を記録',
      ctaHref: '/body-weight-logs',
      tone: plan.course === 'maintenance' ? 'info' : 'neutral',
      achieved: false,
    };
  }

  if (plan.course === 'maintenance' || plan.targetWeightKg === null) {
    return {
      title: '体重',
      statusLabel: '現状維持中',
      detailLabel: `最新 ${formatWeightKg(latestLog.weightKg)}kg / ${formatBodyWeightDate(latestLog.measuredOn)}`,
      ctaLabel: '体重記録へ',
      ctaHref: '/body-weight-logs',
      tone: 'info',
      achieved: false,
    };
  }

  const remainingKg =
    plan.course === 'diet'
      ? Math.max(0, latestLog.weightKg - plan.targetWeightKg)
      : Math.max(0, plan.targetWeightKg - latestLog.weightKg);

  const achieved = remainingKg === 0;

  return {
    title: '体重',
    statusLabel: achieved
      ? '目標達成'
      : `目標まで ${formatWeightKg(remainingKg)}kg`,
    detailLabel: `最新 ${formatWeightKg(latestLog.weightKg)}kg / ${formatBodyWeightDate(latestLog.measuredOn)}`,
    ctaLabel: achieved ? '新しい目標を設定' : '体重記録へ',
    ctaHref: achieved ? '/body-make' : '/body-weight-logs',
    tone: achieved ? 'success' : 'info',
    achieved,
  };
};
