import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFinanceStore } from '@/store/financeStore';
import { DEFAULT_COMPANIES } from '@/constants/companies';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage.store[key]; }),
  clear: vi.fn(() => { mockLocalStorage.store = {}; }),
};

vi.stubGlobal('localStorage', mockLocalStorage);

describe('financeStore (Zustand)', () => {
  beforeEach(() => {
    mockLocalStorage.store = {};
    vi.clearAllMocks();
    // Reset store to initial state
    useFinanceStore.setState({
      companies: DEFAULT_COMPANIES,
      activeTimeWindow: 'day',
      customSymbols: [],
      error: null,
    });
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('has correct initial state', () => {
    const state = useFinanceStore.getState();
    expect(state.companies).toEqual(DEFAULT_COMPANIES);
    expect(state.activeTimeWindow).toBe('day');
    expect(state.customSymbols).toEqual([]);
    expect(state.error).toBeNull();
  });

  describe('setTimeWindow', () => {
    it('updates activeTimeWindow', () => {
      useFinanceStore.getState().setTimeWindow('7d');
      expect(useFinanceStore.getState().activeTimeWindow).toBe('7d');

      useFinanceStore.getState().setTimeWindow('quarter');
      expect(useFinanceStore.getState().activeTimeWindow).toBe('quarter');
    });
  });

  describe('addCustomCompany', () => {
    it('adds valid custom company', () => {
      useFinanceStore.getState().addCustomCompany('AAPL', {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        color: '#FF0000',
        isPrimary: false,
      });

      const state = useFinanceStore.getState();
      expect(state.companies).toHaveLength(6); // 5 defaults + 1 custom
      expect(state.customSymbols).toContain('AAPL');
      expect(state.error).toBeNull();
    });

    it('rejects invalid symbol format', () => {
      useFinanceStore.getState().addCustomCompany('invalid!', {
        symbol: 'INVALID!',
        name: 'Invalid',
        color: '#000000',
        isPrimary: false,
      });

      const state = useFinanceStore.getState();
      expect(state.companies).toHaveLength(5);
      expect(state.customSymbols).toHaveLength(0);
      expect(state.error).toBe('Invalid symbol: invalid!. Use 1-5 uppercase letters.');
    });

    it('rejects duplicate symbol', () => {
      useFinanceStore.getState().addCustomCompany('AAPL', {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        color: '#FF0000',
        isPrimary: false,
      });

      useFinanceStore.getState().addCustomCompany('AAPL', {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        color: '#000000',
        isPrimary: false,
      });

      const state = useFinanceStore.getState();
      expect(state.companies).toHaveLength(6);
      expect(state.error).toBe('AAPL already added');
    });

    it('normalizes symbol to uppercase', () => {
      useFinanceStore.getState().addCustomCompany('aapl', {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        color: '#FF0000',
        isPrimary: false,
      });

      const state = useFinanceStore.getState();
      expect(state.customSymbols).toContain('AAPL');
    });
  });

  describe('removeCustomCompany', () => {
    it('removes custom company', () => {
      useFinanceStore.getState().addCustomCompany('AAPL', {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        color: '#FF0000',
        isPrimary: false,
      });
      expect(useFinanceStore.getState().companies).toHaveLength(6);

      useFinanceStore.getState().removeCustomCompany('AAPL');
      const state = useFinanceStore.getState();
      expect(state.companies).toHaveLength(5);
      expect(state.customSymbols).not.toContain('AAPL');
    });

    it('does nothing for non-existent symbol', () => {
      useFinanceStore.getState().removeCustomCompany('NONEXISTENT');
      expect(useFinanceStore.getState().companies).toHaveLength(5);
    });
  });

  describe('setError', () => {
    it('sets and clears error', () => {
      useFinanceStore.getState().setError('Test error');
      expect(useFinanceStore.getState().error).toBe('Test error');

      useFinanceStore.getState().setError(null);
      expect(useFinanceStore.getState().error).toBeNull();
    });
  });

  describe('clearCustomCompanies', () => {
    it('removes all custom companies', () => {
      useFinanceStore.getState().addCustomCompany('AAPL', { symbol: 'AAPL', name: 'Apple', color: '#F00', isPrimary: false });
      useFinanceStore.getState().addCustomCompany('GOOGL', { symbol: 'GOOGL', name: 'Google', color: '#0F0', isPrimary: false });
      expect(useFinanceStore.getState().companies).toHaveLength(7);

      useFinanceStore.getState().clearCustomCompanies();
      const state = useFinanceStore.getState();
      expect(state.companies).toHaveLength(5);
      expect(state.customSymbols).toEqual([]);
    });
  });
});