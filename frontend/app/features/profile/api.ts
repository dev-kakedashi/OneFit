import { request } from '../../shared/api/client';
import type { ActivityLevel, BodySettings, Gender } from './types';

type UserResponse = {
  id: number;
  height: number;
  weight: number;
  age: number;
  gender: Gender;
  activity_level: ActivityLevel;
  daily_water_goal_ml: number | null;
};

type UserUpsertRequest = {
  height: number;
  weight: number;
  age: number;
  gender: Gender;
  activity_level: ActivityLevel;
  daily_water_goal_ml: number | null;
};

// backend は snake_case、frontend は camelCase なので API 境界で相互変換する。
const mapUserResponse = (user: UserResponse): BodySettings => ({
  height: user.height,
  weight: user.weight,
  age: user.age,
  gender: user.gender,
  activityLevel: user.activity_level,
  dailyWaterGoalMl: user.daily_water_goal_ml,
});

const mapUserRequest = (settings: BodySettings): UserUpsertRequest => ({
  height: settings.height,
  weight: settings.weight,
  age: settings.age,
  gender: settings.gender,
  activity_level: settings.activityLevel,
  daily_water_goal_ml: settings.dailyWaterGoalMl,
});

export const getBodySettings = async (): Promise<BodySettings | null> => {
  const response = await request<UserResponse | null>('/profile');
  return response ? mapUserResponse(response) : null;
};

export const saveBodySettings = async (
  settings: BodySettings,
): Promise<BodySettings> => {
  const response = await request<UserResponse>('/profile', {
    method: 'PUT',
    body: JSON.stringify(mapUserRequest(settings)),
  });

  return mapUserResponse(response);
};
