// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HydrationDroplet } from './HydrationDroplet';

describe('HydrationDroplet', () => {
  it('目標値に応じて水位を表示する', () => {
    const { container } = render(
      <HydrationDroplet valueMl={1000} goalMl={2000} />,
    );

    const rect = container.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('y')).not.toBe('104');
  });

  it('目標未設定でも最小限の水位を表示できる', () => {
    const { container } = render(
      <HydrationDroplet valueMl={300} goalMl={null} />,
    );

    const rect = container.querySelector('rect');
    expect(rect).toBeTruthy();
  });

  it('値が 0 の場合は空に近い表示になる', () => {
    const { container } = render(
      <HydrationDroplet valueMl={0} goalMl={2000} />,
    );

    const rect = container.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('y')).toBe('104');
  });
});
