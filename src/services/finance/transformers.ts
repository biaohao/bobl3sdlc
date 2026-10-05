import type { Quote, HistoryPoint, AlignedHistoryPoint } from './types';

export function normalizeQuote(raw: unknown): Quote {
  const r = raw as Record<string, unknown>;
  return {
    symbol: (r.symbol as string) ?? '',
    regularMarketPrice: Number(r.regularMarketPrice) || 0,
    regularMarketChange: Number(r.regularMarketChange) || 0,
    regularMarketChangePercent: Number(r.regularMarketChangePercent) || 0,
    regularMarketTime: Number(r.regularMarketTime) || Date.now(),
    longName: (r.longName as string) ?? (r.symbol as string) ?? '',
    shortName: (r.shortName as string) ?? (r.symbol as string) ?? '',
    currency: (r.currency as string) ?? 'USD',
    marketState: (r.marketState as string) ?? 'UNKNOWN',
  };
}

export function normalizeHistory(raw: unknown[]): HistoryPoint[] {
  return raw
    .filter((item): item is Record<string, unknown> => item != null)
    .map((item) => ({
      date: (item.date as string) ?? new Date().toISOString().split('T')[0],
      close: Number(item.close) || 0,
      high: Number(item.high) || 0,
      low: Number(item.low) || 0,
      open: Number(item.open) || 0,
      volume: Number(item.volume) || 0,
      adjustedClose: Number(item.adjustedClose) || Number(item.close) || 0,
    }))
    .filter((p) => p.close > 0);
}

export function alignHistoryByDate(
  histories: Map<string, HistoryPoint[]>
): AlignedHistoryPoint[] {
  const allDates = new Set<string>();
  histories.forEach((points) => {
    points.forEach((p) => allDates.add(p.date));
  });

  const sortedDates = Array.from(allDates).sort();

  return sortedDates.map((date) => {
    const values: Record<string, number> = {};
    histories.forEach((points, symbol) => {
      const point = points.find((p) => p.date === date);
      if (point) {
        values[symbol] = point.close;
      }
    });
    return { date, values };
  });
}

export function calculateDailyChange(
  current: number,
  previous: number
): { change: number; changePercent: number } {
  if (previous === 0) return { change: 0, changePercent: 0 };
  const change = current - previous;
  const changePercent = (change / previous) * 100;
  return { change, changePercent };
}

export function getLatestQuote(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null;
  return quotes.reduce((latest, current) =>
    current.regularMarketTime > latest.regularMarketTime ? current : latest
  );
}