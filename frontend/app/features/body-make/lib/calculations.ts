import type { GoalCourse } from '../types';

const KCAL_PER_KG = 7200;

const DIET_SAFE_WEEKLY_LOSS_KG = 0.7;
const DIET_WARNING_WEEKLY_LOSS_KG = 1.0;
const DIET_DANGER_DAILY_DEFICIT_KCAL = 1000;
const DIET_RECOMMENDED_WEEKLY_LOSS_MIN = 0.5;
const DIET_RECOMMENDED_WEEKLY_LOSS_MAX = 0.7;

const BULK_SAFE_WEEKLY_GAIN_KG = 0.25;
const BULK_WARNING_WEEKLY_GAIN_KG = 0.5;
const BULK_SAFE_DAILY_SURPLUS_KCAL = 500;
const BULK_DANGER_DAILY_SURPLUS_KCAL = 700;
const BULK_RECOMMENDED_WEEKLY_GAIN_MIN = 0.2;
const BULK_RECOMMENDED_WEEKLY_GAIN_MAX = 0.25;

export type PlanSafetyLevel = 'safe' | 'warning' | 'danger' | 'blocked';

export type PlanSafetyAssessment = {
  level: PlanSafetyLevel;
  title: string;
  message: string;
  recommendationText: string | null;
  acknowledgementLabel: string | null;
  requiresAcknowledgement: boolean;
  canSave: boolean;
};

export const calculateDailyCalorieAdjustment = (
  targetWeightKg: number,
  durationDays: number,
): number => {
  if (targetWeightKg <= 0 || durationDays <= 0) {
    return 0;
  }

  return Math.ceil((targetWeightKg * KCAL_PER_KG) / durationDays);
};

export const calculateTargetCaloriesForPlan = ({
  maintenanceCalories,
  course,
  targetWeightKg,
  durationDays,
}: {
  maintenanceCalories: number;
  course: GoalCourse;
  targetWeightKg: number;
  durationDays: number;
}): {
  dailyCalorieAdjustment: number;
  targetCalories: number;
} => {
  if (course === 'maintenance') {
    return {
      dailyCalorieAdjustment: 0,
      targetCalories: maintenanceCalories,
    };
  }

  const dailyCalorieAdjustment = calculateDailyCalorieAdjustment(
    targetWeightKg,
    durationDays,
  );

  return {
    dailyCalorieAdjustment,
    targetCalories:
      course === 'diet'
        ? maintenanceCalories - dailyCalorieAdjustment
        : maintenanceCalories + dailyCalorieAdjustment,
  };
};

export const formatDurationSummary = (durationDays: number): string => {
  if (durationDays <= 0) {
    return '本日から開始';
  }

  const weeks = Math.max(1, Math.round(durationDays / 7));
  const months = Math.max(1, Math.round(durationDays / 30));

  return `${weeks}週間 / ${months}ヶ月`;
};

export const calculateWeeklyWeightChangeRate = (
  targetWeightKg: number,
  durationDays: number,
): number => {
  if (targetWeightKg <= 0 || durationDays <= 0) {
    return 0;
  }

  return targetWeightKg / (durationDays / 7);
};

export const calculateRecommendedDurationDays = (
  targetWeightKg: number,
  weeklyChangeKg: number,
): number => {
  if (targetWeightKg <= 0 || weeklyChangeKg <= 0) {
    return 0;
  }

  return Math.ceil((targetWeightKg / weeklyChangeKg) * 7);
};

const getDietPlanSafetyAssessment = ({
  targetWeightKg,
  durationDays,
  maintenanceCalories,
  basalMetabolism,
}: {
  targetWeightKg: number;
  durationDays: number;
  maintenanceCalories: number;
  basalMetabolism: number;
}): PlanSafetyAssessment => {
  const weeklyLossKg = calculateWeeklyWeightChangeRate(
    targetWeightKg,
    durationDays,
  );
  const { dailyCalorieAdjustment, targetCalories } =
    calculateTargetCaloriesForPlan({
      maintenanceCalories,
      course: 'diet',
      targetWeightKg,
      durationDays,
    });

  const recommendedDurationDaysMin = calculateRecommendedDurationDays(
    targetWeightKg,
    DIET_RECOMMENDED_WEEKLY_LOSS_MAX,
  );
  const recommendedDurationDaysMax = calculateRecommendedDurationDays(
    targetWeightKg,
    DIET_RECOMMENDED_WEEKLY_LOSS_MIN,
  );
  const recommendationText = `${targetWeightKg}kg減なら${recommendedDurationDaysMin}〜${recommendedDurationDaysMax}日程度がおすすめです。`;

  if (targetCalories < basalMetabolism) {
    return {
      level: 'blocked',
      title: 'この設定では安全なプランを作成できません',
      message: `目標カロリーが基礎代謝(${basalMetabolism}kcal/日)を下回るため、このままでは保存できません。期間を延ばすか目標減量数を見直してください。`,
      recommendationText,
      acknowledgementLabel: null,
      requiresAcknowledgement: false,
      canSave: false,
    };
  }

  if (
    weeklyLossKg > DIET_WARNING_WEEKLY_LOSS_KG ||
    dailyCalorieAdjustment > DIET_DANGER_DAILY_DEFICIT_KCAL
  ) {
    return {
      level: 'danger',
      title: 'この目標は短期間での減量量が大きく、無理な計画になる可能性があります',
      message:
        '継続困難や体調不良につながる可能性があります。より安全に進めるには、期間を延ばすことをおすすめします。',
      recommendationText,
      acknowledgementLabel: 'リスクを理解した上でこの目標を設定する',
      requiresAcknowledgement: true,
      canSave: true,
    };
  }

  if (weeklyLossKg > DIET_SAFE_WEEKLY_LOSS_KG) {
    return {
      level: 'warning',
      title: 'やや高めの減量ペースです',
      message:
        '体調や継続性を意識して進めましょう。もう少し期間を延ばすと、より継続しやすくなります。',
      recommendationText,
      acknowledgementLabel: null,
      requiresAcknowledgement: false,
      canSave: true,
    };
  }

  return {
    level: 'safe',
    title: 'この目標は無理のないペースです',
    message: '現在の設定なら、比較的現実的なペースで進められます。',
    recommendationText: null,
    acknowledgementLabel: null,
    requiresAcknowledgement: false,
    canSave: true,
  };
};

const getBulkPlanSafetyAssessment = ({
  targetWeightKg,
  durationDays,
  maintenanceCalories,
}: {
  targetWeightKg: number;
  durationDays: number;
  maintenanceCalories: number;
}): PlanSafetyAssessment => {
  const weeklyGainKg = calculateWeeklyWeightChangeRate(
    targetWeightKg,
    durationDays,
  );
  const { dailyCalorieAdjustment } = calculateTargetCaloriesForPlan({
    maintenanceCalories,
    course: 'bulk',
    targetWeightKg,
    durationDays,
  });

  const recommendedDurationDaysMin = calculateRecommendedDurationDays(
    targetWeightKg,
    BULK_RECOMMENDED_WEEKLY_GAIN_MAX,
  );
  const recommendedDurationDaysMax = calculateRecommendedDurationDays(
    targetWeightKg,
    BULK_RECOMMENDED_WEEKLY_GAIN_MIN,
  );
  const recommendationText = `${targetWeightKg}kg増なら${recommendedDurationDaysMin}〜${recommendedDurationDaysMax}日程度がおすすめです。`;

  if (
    weeklyGainKg > BULK_WARNING_WEEKLY_GAIN_KG ||
    dailyCalorieAdjustment > BULK_DANGER_DAILY_SURPLUS_KCAL
  ) {
    return {
      level: 'danger',
      title: 'この目標は増量ペースが高く、脂肪増加が大きくなる可能性があります',
      message:
        '筋肉だけでなく脂肪も増えやすい設定です。より筋肉中心で進めるには、期間を延ばすことをおすすめします。',
      recommendationText,
      acknowledgementLabel: '脂肪増加リスクを理解した上でこの目標を設定する',
      requiresAcknowledgement: true,
      canSave: true,
    };
  }

  if (
    weeklyGainKg > BULK_SAFE_WEEKLY_GAIN_KG ||
    dailyCalorieAdjustment > BULK_SAFE_DAILY_SURPLUS_KCAL
  ) {
    return {
      level: 'warning',
      title: 'やや増量ペースが高めです',
      message:
        '脂肪も増える可能性があります。もう少し期間を延ばすと、よりクリーンに増量しやすくなります。',
      recommendationText,
      acknowledgementLabel: null,
      requiresAcknowledgement: false,
      canSave: true,
    };
  }

  return {
    level: 'safe',
    title: '筋肉中心で増やしやすいペースです',
    message:
      '現在の設定なら、増量しすぎを抑えながら進めやすいペースです。',
    recommendationText: null,
    acknowledgementLabel: null,
    requiresAcknowledgement: false,
    canSave: true,
  };
};

export const getPlanSafetyAssessment = ({
  course,
  targetWeightKg,
  durationDays,
  maintenanceCalories,
  basalMetabolism,
}: {
  course: GoalCourse;
  targetWeightKg: number;
  durationDays: number;
  maintenanceCalories: number;
  basalMetabolism: number;
}): PlanSafetyAssessment | null => {
  if (
    course === 'maintenance' ||
    targetWeightKg <= 0 ||
    durationDays <= 0
  ) {
    return null;
  }

  if (course === 'diet') {
    return getDietPlanSafetyAssessment({
      targetWeightKg,
      durationDays,
      maintenanceCalories,
      basalMetabolism,
    });
  }

  return getBulkPlanSafetyAssessment({
    targetWeightKg,
    durationDays,
    maintenanceCalories,
  });
};
