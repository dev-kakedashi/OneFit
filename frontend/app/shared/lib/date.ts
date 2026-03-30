const pad = (value: number): string => String(value).padStart(2, '0');

export const formatDateOnly = (value: string | Date = new Date()): string => {
  const date = typeof value === 'string' ? new Date(value) : value;

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getTodayString = (): string => formatDateOnly(new Date());

export const isToday = (dateString: string): boolean =>
  formatDateOnly(dateString) === getTodayString();

export const formatDateTimeInputValue = (
  value: string | Date = new Date(),
): string => {
  const date = typeof value === 'string' ? new Date(value) : value;

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
