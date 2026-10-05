import { describe, it, expect } from 'vitest';
import { normalizeQuote, normalizeHistory, alignHistoryByDate } from '@/services/finance/transformers';
import type { Quote, HistoryPoint } from '@/services/finance/types';

describe('finance transformers', () => {
  describe('normalizeQuote', () => {
    it('maps raw quote to domain Quote', () => {
      const raw = {
        symbol: 'IBM',
        regularMarketPrice: 150.25,
        regularMarketChange: 1.5,
        regularMarketChangePercent: 1.01,
        regularMarketTime: Date.now(),
        longName: 'International Business Machines',
        shortName: 'IBM',
        currency: 'USD',
        marketState: 'REGULAR',
      };

      const result = normalizeQuote(raw);

      expect(result.symbol).toBe('IBM');
      expect(result.regularMarketPrice).toBe(150.25);
      expect(result.regularMarketChange).toBe(1.5);
      expect(result.regularMarketChangePercent).toBe(1.01);
      expect(result.longName).toBe('International Business Machines');
      expect(result.currency).toBe('USD');
    });

    it('handles missing optional fields with defaults', () => {
      const raw = { symbol: 'IBM' };

      const result = normalizeQuote(raw);

      expect(result.symbol).toBe('IBM');
      expect(result.regularMarketPrice).toBe(0);
      expect(result.regularMarketChange).toBe(0);
      expect(result.regularMarketChangePercent).toBe(0);
      expect(result.longName).toBe('IBM');
      expect(result.shortName).toBe('IBM');
      expect(result.currency).toBe('USD');
      expect(result.marketState).toBe('UNKNOWN');
    });

    it('handles null values gracefully', () => {
      const raw = {
        symbol: 'IBM',
        regularMarketPrice: null,
        regularMarketChange: null,
        regularMarketChangePercent: null,
      };

      const result = normalizeQuote(raw);

      expect(result.regularMarketPrice).toBe(0);
      expect(result.regularMarketChange).toBe(0);
      expect(result.regularMarketChangePercent).toBe(0);
    });
  });

  describe('normalizeHistory', () => {
    it('maps raw history points to domain HistoryPoint', () => {
      const raw = [
        {
          date: '2024-01-15',
          close: 150.25,
          high: 152.0,
          low: 149.0,
          open: 150.0,
          volume: 1000000,
          adjustedClose: 150.25,
        },
        {
          date: '2024-01-16',
          close: 151.5,
          high: 153.0,
          low: 150.0,
          open: 151.0,
          volume: 1200000,
          adjustedClose: 151.5,
        },
      ];

      const result = normalizeHistory(raw);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].close).toBe(150.25);
      expect(result[1].date).toBe('2024-01-16');
      expect(result[1].close).toBe(151.5);
    });

    it('filters out points with zero or negative close', () => {
      const raw = [
        { date: '2024-01-15', close: 150.25 },
        { date: '2024-01-16', close: null },
        { date: null, close: 151.0 },
        { close: 152.0 },
        { date: '2024-01-17', close: 0 },
        { date: '2024-01-18', close: -5 },
      ];

      const result = normalizeHistory(raw);

      // null/zero/negative close values are filtered out
      // items with valid close but missing date get a default date
      expect(result).toHaveLength(3);
      expect(result[0].close).toBe(150.25);
      expect(result[1].close).toBe(151.0);
      expect(result[2].close).toBe(152.0);
    });

    it('handles missing optional fields', () => {
      const raw = [{ date: '2024-01-15', close: 150 }];

      const result = normalizeHistory(raw);

      expect(result[0].high).toBe(0);
      expect(result[0].low).toBe(0);
      expect(result[0].open).toBe(0);
      expect(result[0].volume).toBe(0);
      expect(result[0].adjustedClose).toBe(150);
    });
  });

  describe('alignHistoryByDate', () => {
    it('aligns multiple histories by date', () => {
      const histories = new Map<string, HistoryPoint[]>([
        ['IBM', [{ date: '2024-01-15', close: 150 }, { date: '2024-01-16', close: 151 }]],
        ['MSFT', [{ date: '2024-01-15', close: 400 }, { date: '2024-01-16', close: 405 }]],
      ]);

      const result = alignHistoryByDate(histories);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].values.IBM).toBe(150);
      expect(result[0].values.MSFT).toBe(400);
      expect(result[1].date).toBe('2024-01-16');
      expect(result[1].values.IBM).toBe(151);
      expect(result[1].values.MSFT).toBe(405);
    });

    it('handles missing dates in some histories', () => {
      const histories = new Map<string, HistoryPoint[]>([
        ['IBM', [{ date: '2024-01-15', close: 150 }, { date: '2024-01-16', close: 151 }]],
        ['MSFT', [{ date: '2024-01-16', close: 405 }]],
      ]);

      const result = alignHistoryByDate(histories);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].values.IBM).toBe(150);
      expect(result[0].values.MSFT).toBeUndefined();
      expect(result[1].date).toBe('2024-01-16');
      expect(result[1].values.IBM).toBe(151);
      expect(result[1].values.MSFT).toBe(405);
    });
  });
});