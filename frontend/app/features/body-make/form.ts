import type {
  BodyMakePlan,
  BodyMakePlanSaveInput,
  GoalCourse,
} from './types';

export type BodyMakeForm = {
  course: GoalCourse;
  targetWeightKg: string;
  durationDays: string;
  memo: string;
};

export type BodyMakeFieldErrors = {
  targetWeightKg?: string;
  durationDays?: string;
};

export const EMPTY_BODY_MAKE_FORM: BodyMakeForm = {
  course: 'maintenance',
  targetWeightKg: '0',
  durationDays: '0',
  memo: '',
};

export const toBodyMakeForm = (plan: BodyMakePlan): BodyMakeForm => ({
  course: plan.course,
  targetWeightKg: String(plan.targetWeightKg),
  durationDays: String(plan.durationDays),
  memo: plan.memo ?? '',
});

export const parseBodyMakeFormNumbers = (
  formData: BodyMakeForm,
): {
  targetWeightKg: number;
  durationDays: number;
} => ({
  targetWeightKg: Number(formData.targetWeightKg) || 0,
  durationDays: Number(formData.durationDays) || 0,
});

export const getNextBodyMakeFormForCourse = (
  current: BodyMakeForm,
  course: GoalCourse,
): BodyMakeForm => {
  if (course === 'maintenance') {
    return {
      ...current,
      course,
      targetWeightKg: '0',
      durationDays: '0',
    };
  }

  return {
    ...current,
    course,
    targetWeightKg:
      Number(current.targetWeightKg) > 0 ? current.targetWeightKg : '5',
    durationDays:
      Number(current.durationDays) > 0 ? current.durationDays : '90',
  };
};

export const validateBodyMakeForm = (
  formData: BodyMakeForm,
): BodyMakeFieldErrors => {
  if (formData.course === 'maintenance') {
    return {};
  }

  const errors: BodyMakeFieldErrors = {};
  const { targetWeightKg, durationDays } = parseBodyMakeFormNumbers(formData);

  if (!targetWeightKg || targetWeightKg <= 0) {
    errors.targetWeightKg = '目標増減数を入力してください。';
  }

  if (!durationDays || durationDays <= 0) {
    errors.durationDays = '達成期間を入力してください。';
  }

  return errors;
};

export const toBodyMakeSaveInput = (
  formData: BodyMakeForm,
  effectiveFrom: string,
): BodyMakePlanSaveInput => ({
  course: formData.course,
  effectiveFrom,
  targetWeightKg:
    formData.course === 'maintenance'
      ? 0
      : Number(formData.targetWeightKg) || 0,
  durationDays:
    formData.course === 'maintenance'
      ? 0
      : Number(formData.durationDays) || 0,
  memo: formData.memo.trim() || null,
});
