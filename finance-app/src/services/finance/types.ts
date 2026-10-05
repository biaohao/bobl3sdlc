export interface Quote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
  longName: string;
  shortName: string;
  currency: string;
  marketState: string;
}

export interface HistoryPoint {
  date: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  adjustedClose?: number;
}

export interface AlignedHistoryPoint {
  date: string;
  values: Record<string, number>;
}

export interface CompanyConfig {
  symbol: string;
  name: string;
  color: string;
  isPrimary: boolean;
}

export interface FinanceError {
  code: 'NETWORK' | 'NOT_FOUND' | 'RATE_LIMIT' | 'PARSE' | 'UNKNOWN';
  message: string;
  symbol?: string;
  originalError?: Error;
}

export type Result<T, E = FinanceError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}