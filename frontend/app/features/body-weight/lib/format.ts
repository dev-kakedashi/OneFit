export const formatWeightKg = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, '');
};

export const formatBodyWeightDate = (value: string): string =>
  new Date(`${value}T00:00:00`).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
