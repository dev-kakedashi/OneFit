import { useEffect, useMemo, useState } from 'react';
import { getBodySettings } from '../../profile/api';
import { calculateBMR, calculateTDEE } from '../../profile/lib/calculations';
import { getErrorMessage } from '../../../shared/api/client';
import { getTodayString, getTomorrowString } from '../../../shared/lib/date';
import { deleteBodyMakePlan, getBodyMakePlans, saveBodyMakePlan } from '../api';
import {
  EMPTY_BODY_MAKE_FORM,
  getNextBodyMakeFormForCourse,
  parseBodyMakeFormNumbers,
  toBodyMakeForm,
  toBodyMakeSaveInput,
  validateBodyMakeForm,
  type BodyMakeFieldErrors,
  type BodyMakeForm,
} from '../form';
import {
  calculateTargetCaloriesForPlan,
  getPlanSafetyAssessment,
} from '../lib/calculations';
import {
  getBodyMakePlanTimeline,
  getDefaultApplyStartOption,
  getEditableBodyMakePlan,
  upsertBodyMakePlanInList,
} from '../timeline';
import type {
  BodyMakeApplyStartOption,
  BodyMakePlan,
  BodyMakePlanPreview,
  GoalCourse,
} from '../types';

export function useBodyMakePage() {
  const todayString = getTodayString();
  const tomorrowString = getTomorrowString();

  const [profileExists, setProfileExists] = useState(false);
  const [maintenanceCalories, setMaintenanceCalories] = useState<number | null>(
    null,
  );
  const [basalMetabolism, setBasalMetabolism] = useState<number | null>(null);
  const [plans, setPlans] = useState<BodyMakePlan[]>([]);
  const [formData, setFormData] = useState<BodyMakeForm>(EMPTY_BODY_MAKE_FORM);
  const [fieldErrors, setFieldErrors] = useState<BodyMakeFieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [applyStartOption, setApplyStartOption] =
    useState<BodyMakeApplyStartOption>('today');

  const timeline = useMemo(
    () => getBodyMakePlanTimeline(plans, todayString),
    [plans, todayString],
  );
  const currentPlan = timeline.currentPlan;
  const upcomingPlan = timeline.upcomingPlan;
  const hasAnyPlan = currentPlan !== null || upcomingPlan !== null;

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        setLoading(true);
        setError('');

        const [profile, loadedPlans] = await Promise.all([
          getBodySettings(),
          getBodyMakePlans(),
        ]);

        if (!active) {
          return;
        }

        const nextTimeline = getBodyMakePlanTimeline(loadedPlans, todayString);
        const editablePlan = getEditableBodyMakePlan(nextTimeline);

        setProfileExists(Boolean(profile));
        setBasalMetabolism(profile ? calculateBMR(profile) : null);
        setMaintenanceCalories(profile ? calculateTDEE(profile) : null);
        setPlans(loadedPlans);
        setFormData(editablePlan ? toBodyMakeForm(editablePlan) : EMPTY_BODY_MAKE_FORM);
        setApplyStartOption(getDefaultApplyStartOption(nextTimeline));
      } catch (err) {
        if (!active) {
          return;
        }

        setError(getErrorMessage(err, 'ボディメイク設定の取得に失敗しました。'));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      active = false;
    };
  }, [todayString]);

  useEffect(() => {
    setRiskAcknowledged(false);
  }, [
    formData.course,
    formData.targetWeightKg,
    formData.durationDays,
    applyStartOption,
  ]);

  const effectiveFrom =
    applyStartOption === 'today' ? todayString : tomorrowString;

  const parsedForm = useMemo(
    () => parseBodyMakeFormNumbers(formData),
    [formData],
  );

  const preview = useMemo<BodyMakePlanPreview | null>(() => {
    if (maintenanceCalories === null) {
      return null;
    }

    const { dailyCalorieAdjustment, targetCalories } =
      calculateTargetCaloriesForPlan({
        maintenanceCalories,
        course: formData.course,
        targetWeightKg: parsedForm.targetWeightKg,
        durationDays: parsedForm.durationDays,
      });

    return {
      maintenanceCalories,
      targetWeightKg: parsedForm.targetWeightKg,
      durationDays: parsedForm.durationDays,
      dailyCalorieAdjustment,
      targetCalories,
    };
  }, [formData.course, maintenanceCalories, parsedForm]);

  const planSafety = useMemo(() => {
    if (preview === null || basalMetabolism === null) {
      return null;
    }

    return getPlanSafetyAssessment({
      course: formData.course,
      targetWeightKg: preview.targetWeightKg,
      durationDays: preview.durationDays,
      maintenanceCalories: preview.maintenanceCalories,
      basalMetabolism,
    });
  }, [formData.course, preview, basalMetabolism]);

  const resetFormFromTimeline = (nextPlans: BodyMakePlan[]) => {
    const nextTimeline = getBodyMakePlanTimeline(nextPlans, todayString);
    const editablePlan = getEditableBodyMakePlan(nextTimeline);

    setFormData(editablePlan ? toBodyMakeForm(editablePlan) : EMPTY_BODY_MAKE_FORM);
    setApplyStartOption(getDefaultApplyStartOption(nextTimeline));
  };

  const openForm = () => {
    setSaved(false);
    setError('');
    setFieldErrors({});
    resetFormFromTimeline(plans);
    setShowForm(true);
  };

  const cancelForm = () => {
    setSaved(false);
    setError('');
    setFieldErrors({});
    setShowForm(false);
    setRiskAcknowledged(false);
    resetFormFromTimeline(plans);
  };

  const changeCourse = (course: GoalCourse) => {
    setSaved(false);
    setFieldErrors({});
    setFormData((current) => getNextBodyMakeFormForCourse(current, course));
  };

  const changeTargetWeightKg = (value: string) => {
    setFormData((current) => ({ ...current, targetWeightKg: value }));
    setFieldErrors((current) => ({ ...current, targetWeightKg: undefined }));
  };

  const changeDurationDays = (value: string) => {
    setFormData((current) => ({ ...current, durationDays: value }));
    setFieldErrors((current) => ({ ...current, durationDays: undefined }));
  };

  const changeMemo = (value: string) => {
    setFormData((current) => ({ ...current, memo: value }));
  };

  const submitPlan = async () => {
    if (!profileExists) {
      return;
    }

    const nextErrors = validateBodyMakeForm(formData);
    setFieldErrors(nextErrors);
    setSaved(false);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (planSafety?.level === 'blocked') {
      return;
    }

    if (planSafety?.requiresAcknowledgement && !riskAcknowledged) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const savedPlan = await saveBodyMakePlan(
        toBodyMakeSaveInput(formData, effectiveFrom),
      );

      const nextPlans = upsertBodyMakePlanInList(plans, savedPlan);

      setPlans(nextPlans);
      setShowForm(false);
      setRiskAcknowledged(false);
      resetFormFromTimeline(nextPlans);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'ボディメイク設定の保存に失敗しました。'));
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (bodyMakePlanId: number): Promise<boolean> => {
    try {
      setDeletingPlanId(bodyMakePlanId);
      setSaved(false);
      setError('');

      await deleteBodyMakePlan(bodyMakePlanId);

      const nextPlans = plans.filter((plan) => plan.id !== bodyMakePlanId);
      setPlans(nextPlans);
      resetFormFromTimeline(nextPlans);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'ボディメイク設定の削除に失敗しました。'));
      return false;
    } finally {
      setDeletingPlanId(null);
    }
  };

  return {
    profileExists,
    currentPlan,
    upcomingPlan,
    deletingPlanId,
    hasAnyPlan,
    formData,
    fieldErrors,
    loading,
    saving,
    showForm,
    saved,
    error,
    riskAcknowledged,
    applyStartOption,
    effectiveFrom,
    preview,
    planSafety,
    openForm,
    cancelForm,
    changeCourse,
    changeTargetWeightKg,
    changeDurationDays,
    changeMemo,
    setRiskAcknowledged,
    setApplyStartOption,
    submitPlan,
    deletePlan,
  };
}
