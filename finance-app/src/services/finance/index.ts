import type { Quote, HistoryPoint, Result } from './types';
import { fetchQuote, fetchHistory, fetchQuotes } from './yahooFinance';
import { normalizeQuote, normalizeHistory, alignHistoryByDate } from './transformers';
import { getCached, setCache } from './cache';
import { getAllSymbols } from '@/constants/companies';

const QUOTE_CACHE_PREFIX = 'quote';
const HISTORY_CACHE_PREFIX = 'history';
const USE_PROXY = import.meta.env.VITE_USE_PROXY === 'true';
const PROXY_BASE = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

async function fetchWithProxy<T>(endpoint: string, params: Record<string, string>): Promise<Result<T>> {
  try {
    const url = new URL(`${PROXY_BASE}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { ok: false, error: { code: 'NETWORK', message: `Proxy error: ${response.status}` } };
    }
    return await response.json();
  } catch (error) {
    return { ok: false, error: { code: 'NETWORK', message: 'Proxy unavailable', originalError: error as Error } };
  }
}

// Proxy-based implementations
async function fetchQuoteViaProxy(symbol: string): Promise<Result<Quote>> {
  return fetchWithProxy<Quote>('/api/quote', { symbols: symbol });
}

async function fetchHistoryViaProxy(symbol: string, period1: Date, period2: Date): Promise<Result<HistoryPoint[]>> {
  return fetchWithProxy<HistoryPoint[]>('/api/history', {
    symbol,
    period1: period1.toISOString().split('T')[0],
    period2: period2.toISOString().split('T')[0],
  });
}

async function fetchQuotesViaProxy(symbols: string[]): Promise<Result<Quote[]>> {
  return fetchWithProxy<Quote[]>('/api/quote', { symbols: symbols.join(',') });
}

// Use proxy or mock based on env
const getQuoteImpl = USE_PROXY ? fetchQuoteViaProxy : fetchQuote;
const getHistoryImpl = USE_PROXY ? fetchHistoryViaProxy : fetchHistory;
const getQuotesImpl = USE_PROXY ? fetchQuotesViaProxy : fetchQuotes;

export async function getQuote(symbol: string): Promise<Result<Quote>> {
  const cached = getCached<Quote>(QUOTE_CACHE_PREFIX, symbol);
  if (cached) return { ok: true, data: cached };

  const result = await getQuoteImpl(symbol);
  if (result.ok) {
    const normalized = normalizeQuote(result.data);
    setCache(QUOTE_CACHE_PREFIX, normalized, symbol);
    return { ok: true, data: normalized };
  }
  return result;
}

export async function getHistory(
  symbol: string,
  period1: Date,
  period2: Date
): Promise<Result<HistoryPoint[]>> {
  const cacheKey = `${symbol}:${period1.toISOString()}:${period2.toISOString()}`;
  const cached = getCached<HistoryPoint[]>(HISTORY_CACHE_PREFIX, cacheKey);
  if (cached) return { ok: true, data: cached };

  const result = await getHistoryImpl(symbol, period1, period2);
  if (result.ok) {
    const normalized = normalizeHistory(result.data);
    setCache(HISTORY_CACHE_PREFIX, normalized, cacheKey);
    return { ok: true, data: normalized };
  }
  return result;
}

export async function getQuotes(symbols: string[]): Promise<Result<Quote[]>> {
  const cacheKey = symbols.sort().join(',');
  const cached = getCached<Quote[]>(QUOTE_CACHE_PREFIX, cacheKey);
  if (cached) return { ok: true, data: cached };

  const result = await getQuotesImpl(symbols);
  if (result.ok) {
    const normalized = result.data.map(normalizeQuote);
    setCache(QUOTE_CACHE_PREFIX, normalized, cacheKey);
    return { ok: true, data: normalized };
  }
  return result;
}

export async function getDefaultQuotes(): Promise<Result<Quote[]>> {
  return getQuotes(getAllSymbols());
}

export async function getDefaultHistory(
  window: 'day' | '7d' | 'quarter'
): Promise<Result<Map<string, HistoryPoint[]>>> {
  const { period1, period2 } = getDateRangeForWindow(window);
  const symbols = getAllSymbols();

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const result = await getHistory(symbol, period1, period2);
      return { symbol, result };
    })
  );

  const historyMap = new Map<string, HistoryPoint[]>();

  for (const { symbol, result } of results) {
    if (result.ok) {
      historyMap.set(symbol, result.data);
    } else {
      console.warn(`Failed to fetch history for ${symbol}:`, result.error.message);
    }
  }

  if (historyMap.size === 0) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'No historical data available for any symbol',
      },
    };
  }

  return { ok: true, data: historyMap };
}

export async function getAlignedHistory(
  window: 'day' | '7d' | 'quarter'
): Promise<Result<{ date: string; values: Record<string, number> }[]>> {
  const historyResult = await getDefaultHistory(window);
  if (!historyResult.ok) return historyResult;

  const aligned = alignHistoryByDate(historyResult.data);
  return { ok: true, data: aligned };
}

function getDateRangeForWindow(window: 'day' | '7d' | 'quarter'): {
  period1: Date;
  period2: Date;
} {
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

export { DEFAULT_COMPANIES, getAllSymbols } from '@/constants/companies';
export type { CompanyConfig } from '@/constants/companies';