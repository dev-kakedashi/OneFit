const pad = (value: number): string => String(value).padStart(2, '0');

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toLocalDate = (value: string | Date): Date => {
  if (value instanceof Date) {
    return value;
  }

  const matched = DATE_ONLY_PATTERN.exec(value);
  if (matched) {
    const [, year, month, day] = matched;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
};

export const formatDateOnly = (value: string | Date = new Date()): string => {
  const date = toLocalDate(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getTodayString = (): string => formatDateOnly(new Date());

export const addDaysToDateOnly = (
  dateString: string,
  days: number,
): string => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDateOnly(date);
};

export const getTomorrowString = (): string =>
  addDaysToDateOnly(getTodayString(), 1);

export const isToday = (dateString: string): boolean =>
  formatDateOnly(dateString) === getTodayString();

export const formatDateTimeInputValue = (
  value: string | Date = new Date(),
): string => {
  const date = toLocalDate(value);
  return `${formatDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// datetime-local はタイムゾーン情報を持たないため、UTC 変換はせず秒だけ補って API に渡す。
export const formatDateTimeForApi = (value: string): string =>
  value.length === 16 ? `${value}:00` : value;

// 選択日を維持したまま、時刻だけ現在時刻を初期値として入れる。
export const buildDefaultDateTime = (dateString: string): string => {
  const now = new Date();
  return `${dateString}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};
