import dayjs from 'dayjs';
import '../config/timezone';

export const TIMEZONE = 'Asia/Ho_Chi_Minh';
export const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!DATE_REGEX.test(dateStr)) return false;
  return dayjs(dateStr, DATE_FORMAT, true).isValid();
}

export function formatDate(date: string | Date | dayjs.Dayjs): string {
  return dayjs(date).tz(TIMEZONE).format(DATE_FORMAT);
}

export function getConventionWeekday(date: string | dayjs.Dayjs): number {
  const jsDay = dayjs(date).tz(TIMEZONE).day();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function isInDateRange(targetDate: string, startDate: string, endDate: string): boolean {
  const target = dayjs.tz(targetDate, TIMEZONE).startOf('day');
  const start = dayjs.tz(startDate, TIMEZONE).startOf('day');
  const end = dayjs.tz(endDate, TIMEZONE).startOf('day');

  return (target.isAfter(start) || target.isSame(start)) && (target.isBefore(end) || target.isSame(end));
}
