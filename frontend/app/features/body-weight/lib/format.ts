const roundWeight = (value: number): { rounded: number; formatted: string } => {
  const rounded = Math.round(value * 10) / 10;

  return {
    rounded,
    formatted: rounded.toFixed(1).replace(/\.0$/, ''),
  };
};

export const formatWeightKg = (value: number): string => {
  return roundWeight(value).formatted;
};

export const formatWeightDeltaKg = (value: number): string => {
  const { rounded, formatted } = roundWeight(value);

  return `${rounded > 0 ? '+' : ''}${formatted}kg`;
};

export const formatBodyWeightDate = (value: string): string =>
  new Date(`${value}T00:00:00`).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
