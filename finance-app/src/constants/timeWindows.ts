export type TimeWindow = 'day' | '7d' | 'quarter';

export const TIME_WINDOWS: { value: TimeWindow; label: string; description: string }[] = [
  { value: 'day', label: 'Current Day', description: 'Today\'s market summary' },
  { value: '7d', label: 'Last 7 Days', description: 'Weekly trend comparison' },
  { value: 'quarter', label: 'Last Quarter', description: 'Quarterly trend comparison' },
];

export function getTimeWindowLabel(window: TimeWindow): string {
  return TIME_WINDOWS.find((w) => w.value === window)?.label ?? window;
}

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

export function formatWindowDate(date: Date, window: TimeWindow): string {
  switch (window) {
    case 'day':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '7d':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case 'quarter':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
}