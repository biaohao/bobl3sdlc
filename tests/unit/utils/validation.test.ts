import { describe, it, expect } from 'vitest';
import { isValidTicker, normalizeTicker, isValidEmail, sanitizeInput } from '@/utils/validation';

describe('validation', () => {
  describe('isValidTicker', () => {
    it('returns true for valid tickers', () => {
      expect(isValidTicker('IBM')).toBe(true);
      expect(isValidTicker('AAPL')).toBe(true);
      expect(isValidTicker('MSFT')).toBe(true);
      expect(isValidTicker('ibm')).toBe(true); // lowercase is normalized
      expect(isValidTicker('aapl')).toBe(true);
    });

    it('returns false for invalid tickers', () => {
      expect(isValidTicker('')).toBe(false);
      expect(isValidTicker('123')).toBe(false); // numbers only
      expect(isValidTicker('IBM!')).toBe(false); // special chars
      expect(isValidTicker('TOOLONG')).toBe(false); // too long
      expect(isValidTicker('BRK.A')).toBe(false); // dot not allowed
    });
  });

  describe('normalizeTicker', () => {
    it('converts to uppercase and trims', () => {
      expect(normalizeTicker(' ibm ')).toBe('IBM');
      expect(normalizeTicker('aapl')).toBe('AAPL');
      expect(normalizeTicker('Msft')).toBe('MSFT');
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.org')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
      expect(sanitizeInput('<div>hello</div>')).toBe('divhello/div');
    });

    it('trims whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });
});