import type { Quote, HistoryPoint, Result } from './types';

/**
 * Mock finance service for demo/workshop purposes.
 * In production, this would be replaced with a real Yahoo Finance integration
 * via a backend proxy to avoid CORS and Node.js dependency issues.
 */

const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockPrice(basePrice: number, volatility = 0.02): number {
  const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
  return Math.max(0.01, basePrice + change);
}

function generateMockHistory(
  _symbol: string,
  days: number,
  basePrice: number
): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    price = generateMockPrice(price, 0.015);
    points.push({
      date: date.toISOString().split('T')[0],
      close: price,
      high: price * (1 + Math.random() * 0.01),
      low: price * (1 - Math.random() * 0.01),
      open: price * (1 + (Math.random() - 0.5) * 0.01),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      adjustedClose: price,
    });
  }
  return points;
}

const BASE_PRICES: Record<string, number> = {
  IBM: 165.5,
  MSFT: 415.2,
  ORCL: 125.8,
  SAP: 185.3,
  CRM: 265.7,
};

export async function fetchQuote(symbol: string): Promise<Result<Quote>> {
  await delay(MOCK_DELAY_MS);

  const basePrice = BASE_PRICES[symbol] ?? 100;
  const price = generateMockPrice(basePrice);
  const change = (Math.random() - 0.5) * 5;
  const changePercent = (change / basePrice) * 100;

  return {
    ok: true,
    data: {
      symbol,
      regularMarketPrice: price,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketTime: Date.now(),
      longName: symbol,
      shortName: symbol,
      currency: 'USD',
      marketState: 'REGULAR',
    },
  };
}

export async function fetchHistory(
  symbol: string,
  period1: Date,
  period2: Date
): Promise<Result<HistoryPoint[]>> {
  await delay(MOCK_DELAY_MS);

  const days = Math.ceil((period2.getTime() - period1.getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = BASE_PRICES[symbol] ?? 100;
  const points = generateMockHistory(symbol, days, basePrice);

  return { ok: true, data: points };
}

export async function fetchQuotes(symbols: string[]): Promise<Result<Quote[]>> {
  await delay(MOCK_DELAY_MS);

  const results = await Promise.all(symbols.map((s) => fetchQuote(s)));
  const allOk = results.every((r) => r.ok);

  if (!allOk) {
    return {
      ok: false,
      error: {
        code: 'NETWORK',
        message: `Failed to fetch quotes for ${symbols.join(', ')}`,
      },
    };
  }

  return { ok: true, data: results.map((r) => r.data) };
}