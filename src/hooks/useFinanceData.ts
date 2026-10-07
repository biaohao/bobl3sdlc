import { useQuery, useQueries } from '@tanstack/react-query';
import {
  getQuote,
  getHistory,
  getQuotes,
  getDefaultHistory,
  getAlignedHistory,
} from '@/services/finance';
import type { TimeWindow } from '@/constants/timeWindows';

const QUERY_STALE_TIME = 5 * 60 * 1000;

export function useQuote(symbol: string | null) {
  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => getQuote(symbol!),
    enabled: !!symbol,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ['quotes', symbols],
    queryFn: () => getQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useHistory(symbol: string | null, window: TimeWindow) {
  const { period1, period2 } = getDateRange(window);
  return useQuery({
    queryKey: ['history', symbol, window],
    queryFn: () => getHistory(symbol!, period1, period2),
    enabled: !!symbol,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useMultipleHistories(symbols: string[], window: TimeWindow) {
  const { period1, period2 } = getDateRange(window);
  return useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ['history', symbol, window],
      queryFn: () => getHistory(symbol, period1, period2),
      enabled: true,
      staleTime: QUERY_STALE_TIME,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  });
}

export function useDefaultHistory(window: TimeWindow) {
  return useQuery({
    queryKey: ['defaultHistory', window],
    queryFn: () => getDefaultHistory(window),
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useAlignedHistory(window: TimeWindow) {
  return useQuery({
    queryKey: ['alignedHistory', window],
    queryFn: () => getAlignedHistory(window),
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

function getDateRange(window: TimeWindow): { period1: Date; period2: Date } {
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

export function useDefaultQuotes() {
  return useQuery({
    queryKey: ['defaultQuotes'],
    queryFn: () => getQuotes(['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM']),
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCustomCompanyQuote(symbol: string | null) {
  return useQuery({
    queryKey: ['customQuote', symbol],
    queryFn: () => getQuote(symbol!),
    enabled: !!symbol,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCustomCompanyHistory(symbol: string | null, window: TimeWindow) {
  const { period1, period2 } = getDateRange(window);
  return useQuery({
    queryKey: ['customHistory', symbol, window],
    queryFn: () => getHistory(symbol!, period1, period2),
    enabled: !!symbol,
    staleTime: QUERY_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}