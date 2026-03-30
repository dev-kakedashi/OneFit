import { describe, expect, it } from 'vitest';
import { calculateBMR, calculateTDEE } from './calculations';
import type { BodySettings } from '../types';

describe('profile calculations', () => {
  it('男性の BMR を floor で計算する', () => {
    const settings: BodySettings = {
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
    };

    expect(calculateBMR(settings)).toBe(1701);
  });

  it('女性の BMR を floor で計算する', () => {
    const settings: BodySettings = {
      height: 160,
      weight: 60,
      age: 30,
      gender: 'female',
      activityLevel: 'light',
    };

    expect(calculateBMR(settings)).toBe(1384);
  });

  it('other は男性式と女性式の平均で BMR を計算する', () => {
    const settings: BodySettings = {
      height: 170,
      weight: 60,
      age: 30,
      gender: 'other',
      activityLevel: 'very_active',
    };

    expect(calculateBMR(settings)).toBe(1471);
  });

  it('活動レベルを掛けて TDEE を floor で計算する', () => {
    const settings: BodySettings = {
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
    };

    expect(calculateTDEE(settings)).toBe(2636);
  });
});
