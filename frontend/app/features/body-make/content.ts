import type { GoalCourse } from './types';

export const COURSE_META: Record<
  GoalCourse,
  {
    label: string;
    description: string;
    selectedClass: string;
    badgeClass: string;
    iconClass: string;
  }
> = {
  maintenance: {
    label: '維持',
    description: '現在の体重を維持',
    selectedClass: 'border-blue-500 bg-blue-50',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    iconClass: 'text-blue-500',
  },
  diet: {
    label: 'ダイエット',
    description: '体重を減らす',
    selectedClass: 'border-emerald-500 bg-emerald-50',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    iconClass: 'text-emerald-500',
  },
  bulk: {
    label: '増量',
    description: '筋肉を増やす',
    selectedClass: 'border-orange-500 bg-orange-50',
    badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
    iconClass: 'text-orange-500',
  },
};

export const BODY_MAKE_NOTES = [
  '体重1kgの増減には約7,200kcalが必要です',
  '急激な体重変化は健康を害する可能性があります',
  'ダイエットの場合、週0.5〜0.7kg程度までが無理のない目安です',
  '増量の場合、週0.2〜0.25kg程度が筋肉中心で進めやすい目安です',
  '目標カロリーはあくまで目安です。体調に合わせて調整してください',
];

export const BULK_GUIDE_NOTES = [
  'おすすめの増量は、少しずつ体重を増やしながら筋トレを継続する方法です',
  '食べすぎは筋肉ではなく脂肪増加につながる場合があります',
  'たんぱく質とトレーニングの両方が重要です',
];

export const formatPlanDate = (value: string): string =>
  new Date(`${value}T00:00:00`).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
