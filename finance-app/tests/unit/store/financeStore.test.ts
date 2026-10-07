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

  describe('custom company actions', () => {
    beforeEach(() => {
      // Reset custom company state
      useFinanceStore.setState({
        customCompanySymbol: null,
        customCompanyLoading: false,
        customCompanyError: null,
      });
    });

    describe('setCustomCompany', () => {
      it('sets valid custom company symbol', () => {
        useFinanceStore.getState().setCustomCompany('AAPL');
        const state = useFinanceStore.getState();
        expect(state.customCompanySymbol).toBe('AAPL');
        expect(state.customCompanyLoading).toBe(true);
        expect(state.customCompanyError).toBeNull();
      });

      it('normalizes symbol to uppercase', () => {
        useFinanceStore.getState().setCustomCompany('aapl');
        expect(useFinanceStore.getState().customCompanySymbol).toBe('AAPL');
      });

      it('rejects invalid symbol format', () => {
        useFinanceStore.getState().setCustomCompany('invalid!');
        const state = useFinanceStore.getState();
        expect(state.customCompanySymbol).toBeNull();
        expect(state.customCompanyError).toBe('Invalid symbol: invalid!. Use 1-5 uppercase letters.');
        expect(state.customCompanyLoading).toBe(false);
      });

      it('clears custom company when null is passed', () => {
        useFinanceStore.getState().setCustomCompany('AAPL');
        expect(useFinanceStore.getState().customCompanySymbol).toBe('AAPL');

        useFinanceStore.getState().setCustomCompany(null);
        const state = useFinanceStore.getState();
        expect(state.customCompanySymbol).toBeNull();
        expect(state.customCompanyError).toBeNull();
        expect(state.customCompanyLoading).toBe(false);
      });
    });

    describe('setCustomCompanyLoading', () => {
      it('sets loading state', () => {
        useFinanceStore.getState().setCustomCompanyLoading(true);
        expect(useFinanceStore.getState().customCompanyLoading).toBe(true);

        useFinanceStore.getState().setCustomCompanyLoading(false);
        expect(useFinanceStore.getState().customCompanyLoading).toBe(false);
      });
    });

    describe('setCustomCompanyError', () => {
      it('sets error and clears loading', () => {
        useFinanceStore.getState().setCustomCompanyLoading(true);
        useFinanceStore.getState().setCustomCompanyError('Test error');
        const state = useFinanceStore.getState();
        expect(state.customCompanyError).toBe('Test error');
        expect(state.customCompanyLoading).toBe(false);
      });

      it('clears error when null is passed', () => {
        useFinanceStore.getState().setCustomCompanyError('Test error');
        useFinanceStore.getState().setCustomCompanyError(null);
        expect(useFinanceStore.getState().customCompanyError).toBeNull();
      });
    });

    describe('clearCustomCompany', () => {
      it('resets all custom company state', () => {
        useFinanceStore.getState().setCustomCompany('AAPL');
        useFinanceStore.getState().setCustomCompanyError('Test error');
        useFinanceStore.getState().setCustomCompanyLoading(true);

        useFinanceStore.getState().clearCustomCompany();

        const state = useFinanceStore.getState();
        expect(state.customCompanySymbol).toBeNull();
        expect(state.customCompanyError).toBeNull();
        expect(state.customCompanyLoading).toBe(false);
      });
    });
  });
});