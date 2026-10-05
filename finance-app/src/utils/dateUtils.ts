import type { TimeWindow } from '@/constants/timeWindows';

export function getDateRange(window: TimeWindow): { period1: Date; period2: Date } {
  const now = new Date();
  const period2 = new Date(now);
  let period1: Date;

  switch (window) {
    case 'day':
      period1 = new Date(now);
      period1.setHours(0, 0, 0, 0);
      break;
    case '7d':
      period1 = new Date(now);
      period1.setDate(now.getDate() - 7);
      break;
    case 'quarter':
      period1 = new Date(now);
      period1.setMonth(now.getMonth() - 3);
      break;
    default:
      period1 = new Date(now);
      period1.setDate(now.getDate() - 7);
  }

  return { period1, period2 };
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}