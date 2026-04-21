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

// targetWeightKg は「増減する差分」なので、開始時体重から絶対値に変換する。
const getTargetWeightKg = (plan: DashboardCurrentPlan): number => {
  if (plan.course === 'diet') {
    return Math.max(0, plan.startWeightKg - (plan.targetWeightKg ?? 0));
  }

  if (plan.course === 'bulk') {
    return plan.startWeightKg + (plan.targetWeightKg ?? 0);
  }

  return plan.startWeightKg;
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
    const targetWeightKg = getTargetWeightKg(plan);

    return {
      title: '体重',
      statusLabel:
        plan.course === 'maintenance'
          ? '現状維持中'
          : `目標 ${formatWeightKg(targetWeightKg)}kg`,
      detailLabel:
        plan.course === 'maintenance'
          ? '記録を続けると変化が見えやすくなります'
          : '記録を追加すると残り体重が見えます',
      ctaLabel: '体重を記録',
      ctaHref: '/body-weight-logs',
      tone: 'info',
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

  const targetWeightKg = getTargetWeightKg(plan);
  const remainingKg = Math.abs(latestLog.weightKg - targetWeightKg);

  const achieved =
    plan.course === 'diet'
      ? latestLog.weightKg <= targetWeightKg
      : latestLog.weightKg >= targetWeightKg;

  return {
    title: '体重',
    statusLabel: achieved
      ? '目標達成'
      : `目標 ${formatWeightKg(targetWeightKg)}kg`,
    detailLabel: achieved
      ? `目標 ${formatWeightKg(targetWeightKg)}kg / 最新 ${formatWeightKg(latestLog.weightKg)}kg / ${formatBodyWeightDate(latestLog.measuredOn)}`
      : `残り ${formatWeightKg(remainingKg)}kg / 最新 ${formatWeightKg(latestLog.weightKg)}kg / ${formatBodyWeightDate(latestLog.measuredOn)}`,
    ctaLabel: achieved ? '新しい目標を設定' : '体重記録へ',
    ctaHref: achieved ? '/body-make' : '/body-weight-logs',
    tone: achieved ? 'success' : 'info',
    achieved,
  };
};
