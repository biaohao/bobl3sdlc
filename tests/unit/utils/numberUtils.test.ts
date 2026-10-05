import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent, formatCompactNumber, formatShortDate, formatDateTime } from '@/utils/numberUtils';

describe('numberUtils', () => {
  describe('formatCurrency', () => {
    it('formats USD with 2 decimal places', () => {
      expect(formatCurrency(150.25)).toBe('$150.25');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('handles negative values', () => {
      expect(formatCurrency(-150.25)).toBe('-$150.25');
    });
  });

  describe('formatPercent', () => {
    it('formats positive percent with + sign', () => {
      expect(formatPercent(1.5)).toBe('+1.50%');
      expect(formatPercent(0)).toBe('+0.00%');
    });

    it('formats negative percent with - sign', () => {
      expect(formatPercent(-1.5)).toBe('-1.50%');
    });

    it('respects decimals parameter', () => {
      expect(formatPercent(1.5, 1)).toBe('+1.5%');
      expect(formatPercent(1.5, 0)).toBe('+2%');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats numbers in compact notation', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(1500000)).toBe('1.5M');
      expect(formatCompactNumber(1500000000)).toBe('1.5B');
    });
  });

  describe('formatShortDate', () => {
    it('formats date as MMM d', () => {
      expect(formatShortDate('2024-01-15T12:00:00Z')).toMatch(/Jan 15/);
      expect(formatShortDate('2024-12-25T12:00:00Z')).toMatch(/Dec 25/);
    });
  });

  describe('formatDateTime', () => {
    it('formats date with time', () => {
      const result = formatDateTime('2024-01-15T14:30:00');
      expect(result).toMatch(/Jan 15/);
      expect(result).toMatch(/2:30/);
    });
  });
});