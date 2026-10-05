import { describe, it, expect } from 'vitest';
import { getDateRange, addDays, startOfDay, endOfDay, isToday } from '@/utils/dateUtils';

describe('dateUtils', () => {
  describe('getDateRange', () => {
    it('returns correct range for day window', () => {
      const { period1, period2 } = getDateRange('day');
      expect(period1.getHours()).toBe(0);
      expect(period1.getMinutes()).toBe(0);
      expect(period1.getSeconds()).toBe(0);
      expect(period2).toBeInstanceOf(Date);
    });

    it('returns correct range for 7d window', () => {
      const { period1, period2 } = getDateRange('7d');
      const diffDays = Math.ceil((period2.getTime() - period1.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it('returns correct range for quarter window', () => {
      const { period1, period2 } = getDateRange('quarter');
      const diffMonths = (period2.getFullYear() - period1.getFullYear()) * 12 + period2.getMonth() - period1.getMonth();
      expect(diffMonths).toBe(3);
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDays(date, 5);
      expect(result.getUTCDate()).toBe(20);
    });

    it('subtracts days with negative value', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = addDays(date, -5);
      expect(result.getUTCDate()).toBe(10);
    });
  });

  describe('startOfDay', () => {
    it('sets time to 00:00:00.000', () => {
      const date = new Date('2024-01-15T14:30:45.123');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    it('sets time to 23:59:59.999', () => {
      const date = new Date('2024-01-15T14:30:45.123');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });
});