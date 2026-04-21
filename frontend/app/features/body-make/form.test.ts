import { describe, expect, it } from 'vitest';
import {
  getNextBodyMakeFormForCourse,
  toBodyMakeSaveInput,
  validateBodyMakeForm,
} from './form';

describe('body make form helpers', () => {
  it('maintenance へ切り替えると目標値を 0 に戻す', () => {
    expect(
      getNextBodyMakeFormForCourse(
        {
          course: 'diet',
          targetWeightKg: '5',
          durationDays: '90',
          memo: 'test',
        },
        'maintenance',
      ),
    ).toEqual({
      course: 'maintenance',
      targetWeightKg: '0',
      durationDays: '0',
      memo: 'test',
    });
  });

  it('非 maintenance へ切り替えると未入力値に初期値を入れる', () => {
    expect(
      getNextBodyMakeFormForCourse(
        {
          course: 'maintenance',
          targetWeightKg: '0',
          durationDays: '0',
          memo: '',
        },
        'bulk',
      ),
    ).toEqual({
      course: 'bulk',
      targetWeightKg: '5',
      durationDays: '90',
      memo: '',
    });
  });

  it('保存用 input へ変換すると memo を trim する', () => {
    expect(
      toBodyMakeSaveInput(
        {
          course: 'diet',
          targetWeightKg: '5',
          durationDays: '90',
          memo: '  夏までに絞る  ',
        },
        '2026-04-08',
      ),
    ).toEqual({
      course: 'diet',
      effectiveFrom: '2026-04-08',
      targetWeightKg: 5,
      durationDays: 90,
      memo: '夏までに絞る',
    });
  });

  it('不正な diet form を検証できる', () => {
    expect(
      validateBodyMakeForm({
        course: 'diet',
        targetWeightKg: '0',
        durationDays: '0',
        memo: '',
      }),
    ).toEqual({
      targetWeightKg: '目標増減数を入力してください。',
      durationDays: '達成期間を入力してください。',
    });
  });
});
