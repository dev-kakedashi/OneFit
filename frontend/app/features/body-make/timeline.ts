import type {
  BodyMakeApplyStartOption,
  BodyMakePlan,
  BodyMakePlanTimeline,
} from './types';

const sortPlansAscending = (plans: BodyMakePlan[]): BodyMakePlan[] =>
  [...plans].sort((left, right) => {
    if (left.effectiveFrom === right.effectiveFrom) {
      return left.id - right.id;
    }

    return left.effectiveFrom.localeCompare(right.effectiveFrom);
  });

const sortPlansDescending = (plans: BodyMakePlan[]): BodyMakePlan[] =>
  [...plans].sort((left, right) => {
    if (left.effectiveFrom === right.effectiveFrom) {
      return right.id - left.id;
    }

    return right.effectiveFrom.localeCompare(left.effectiveFrom);
  });

export const getBodyMakePlanTimeline = (
  plans: BodyMakePlan[],
  today: string,
): BodyMakePlanTimeline => {
  const orderedPlans = sortPlansAscending(plans);

  return {
    currentPlan:
      orderedPlans.filter((plan) => plan.effectiveFrom <= today).at(-1) ?? null,
    upcomingPlan:
      orderedPlans.find((plan) => plan.effectiveFrom > today) ?? null,
  };
};

export const getEditableBodyMakePlan = (
  timeline: BodyMakePlanTimeline,
): BodyMakePlan | null => timeline.upcomingPlan ?? timeline.currentPlan;

export const getDefaultApplyStartOption = (
  timeline: BodyMakePlanTimeline,
): BodyMakeApplyStartOption =>
  timeline.currentPlan !== null || timeline.upcomingPlan !== null
    ? 'tomorrow'
    : 'today';

export const upsertBodyMakePlanInList = (
  plans: BodyMakePlan[],
  nextPlan: BodyMakePlan,
): BodyMakePlan[] =>
  sortPlansDescending(
    [nextPlan, ...plans].filter(
      (plan, index, list) =>
        index ===
        list.findIndex(
          (candidate) =>
            candidate.id === plan.id ||
            candidate.effectiveFrom === plan.effectiveFrom,
        ),
    ),
  );
