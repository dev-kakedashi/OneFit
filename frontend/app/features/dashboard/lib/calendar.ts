import { formatDateOnly } from '../../../shared/lib/date';

export const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

export type CalendarDay = {
  dateString: string;
  dayNumber: number;
  monthNumber: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
};

export const toDateAtMidnight = (value: string | Date): Date => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  return new Date(`${value}T00:00:00`);
};

export const getWeekRange = (
  value: string | Date,
): { startDate: Date; endDate: Date } => {
  const startDate = toDateAtMidnight(value);
  const weekday = startDate.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;

  startDate.setDate(startDate.getDate() + offset);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return { startDate, endDate };
};

export const getMonthStart = (value: string | Date): Date => {
  const date = toDateAtMidnight(value);
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const addMonths = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const buildCalendarDays = (
  month: Date,
  selectedDate: string,
  todayString: string,
): CalendarDay[] => {
  const monthStart = getMonthStart(month);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);
    const dateString = formatDateOnly(cellDate);

    return {
      dateString,
      dayNumber: cellDate.getDate(),
      monthNumber: cellDate.getMonth() + 1,
      isCurrentMonth: cellDate.getMonth() === monthStart.getMonth(),
      isSelected: dateString === selectedDate,
      isToday: dateString === todayString,
    };
  });
};
