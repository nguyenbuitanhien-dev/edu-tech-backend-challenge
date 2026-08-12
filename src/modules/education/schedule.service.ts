import dayjs from 'dayjs';
import { isValidDateFormat, getConventionWeekday, isInDateRange, TIMEZONE } from '../../utils/date';

export interface ScheduleInput {
  startDate: string;
  totalClasses: number;
  classWeekdays: number[];
  holidays?: string[];
  holidayRanges?: Array<[string, string]>;
}

export interface ScheduleOutput {
  endDate: string;
  fullSchedule: string[];
}

export function generateSchedule(input: ScheduleInput): ScheduleOutput {
  const { startDate, totalClasses, classWeekdays, holidays = [], holidayRanges = [] } = input;

  if (!Number.isInteger(totalClasses) || totalClasses < 1) {
    throw new Error('totalClasses phải là một số nguyên dương >= 1');
  }

  if (!isValidDateFormat(startDate)) {
    throw new Error(`startDate không đúng định dạng YYYY-MM-DD hoặc không hợp lệ: "${startDate}"`);
  }

  if (!Array.isArray(classWeekdays) || classWeekdays.length === 0) {
    throw new Error('classWeekdays phải là mảng các số từ 0 đến 6 (0=Mon ... 6=Sun)');
  }

  const validWeekdays = Array.from(new Set(classWeekdays))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);

  if (validWeekdays.length === 0) {
    throw new Error('classWeekdays không chứa ngày hợp lệ nào từ 0 đến 6');
  }

  const holidaySet = new Set<string>();
  for (const h of holidays) {
    if (!isValidDateFormat(h)) {
      throw new Error(`Ngày lễ (holiday) không đúng định dạng YYYY-MM-DD: "${h}"`);
    }
    holidaySet.add(h);
  }

  const parsedHolidayRanges: Array<[string, string]> = [];
  for (const range of holidayRanges) {
    if (!Array.isArray(range) || range.length !== 2) {
      throw new Error('Mỗi phần tử trong holidayRanges phải là mảng 2 ngày [start, end]');
    }
    const [rStart, rEnd] = range;
    if (!isValidDateFormat(rStart)) {
      throw new Error(`Kỳ nghỉ có startDate không hợp lệ: "${rStart}"`);
    }
    if (!isValidDateFormat(rEnd)) {
      throw new Error(`Kỳ nghỉ có endDate không hợp lệ: "${rEnd}"`);
    }

    const startObj = dayjs.tz(rStart, TIMEZONE).startOf('day');
    const endObj = dayjs.tz(rEnd, TIMEZONE).startOf('day');

    if (startObj.isAfter(endObj)) {
      throw new Error(`Kỳ nghỉ có ngày bắt đầu ${rStart} lớn hơn ngày kết thúc ${rEnd}`);
    }
    parsedHolidayRanges.push([rStart, rEnd]);
  }

  const fullSchedule: string[] = [];
  let currentDate = dayjs.tz(startDate, TIMEZONE).startOf('day');

  while (fullSchedule.length < totalClasses) {
    const formattedDate = currentDate.format('YYYY-MM-DD');
    const conventionDay = getConventionWeekday(currentDate);

    const isClassDay = validWeekdays.includes(conventionDay);
    const isHoliday = holidaySet.has(formattedDate);
    const isInHolidayRange = parsedHolidayRanges.some(([rStart, rEnd]) =>
      isInDateRange(formattedDate, rStart, rEnd)
    );

    if (isClassDay && !isHoliday && !isInHolidayRange) {
      fullSchedule.push(formattedDate);
    }

    currentDate = currentDate.add(1, 'day');
  }

  return {
    endDate: fullSchedule[fullSchedule.length - 1],
    fullSchedule,
  };
}
