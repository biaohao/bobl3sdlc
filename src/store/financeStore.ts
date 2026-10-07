import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompanyConfig } from '@/constants/companies';
import type { TimeWindow } from '@/constants/timeWindows';

interface FinanceState {
  companies: CompanyConfig[];
  activeTimeWindow: TimeWindow;
  customSymbols: string[];
  error: string | null;

  // User-selected company (single graph view)
  customCompanySymbol: string | null;
  customCompanyLoading: boolean;
  customCompanyError: string | null;

  setTimeWindow: (window: TimeWindow) => void;
  addCustomCompany: (symbol: string, config: CompanyConfig) => void;
  removeCustomCompany: (symbol: string) => void;
  setError: (error: string | null) => void;
  clearCustomCompanies: () => void;

  // Custom company actions
  setCustomCompany: (symbol: string | null) => void;
  setCustomCompanyLoading: (loading: boolean) => void;
  setCustomCompanyError: (error: string | null) => void;
  clearCustomCompany: () => void;
}

const isValidSymbol = (symbol: string): boolean => /^[A-Z]{1,5}$/.test(symbol);

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      companies: [],
      activeTimeWindow: 'day',
      customSymbols: [],
      error: null,
      customCompanySymbol: null,
      customCompanyLoading: false,
      customCompanyError: null,

      setTimeWindow: (window) => set({ activeTimeWindow: window }),

      addCustomCompany: (symbol, config) => {
        const upperSymbol = symbol.toUpperCase();
        if (!isValidSymbol(upperSymbol)) {
          set({ error: `Invalid symbol: ${symbol}. Use 1-5 uppercase letters.` });
          return;
        }
        set((state) => {
          if (state.companies.some((c) => c.symbol === upperSymbol)) {
            return { error: `${upperSymbol} already added` };
          }
          if (state.customSymbols.includes(upperSymbol)) {
            return { error: `${upperSymbol} already added` };
          }
          return {
            companies: [...state.companies, config],
            customSymbols: [...state.customSymbols, upperSymbol],
            error: null,
          };
        });
      },

      removeCustomCompany: (symbol) => {
        const upperSymbol = symbol.toUpperCase();
        set((state) => ({
          companies: state.companies.filter((c) => c.symbol !== upperSymbol),
          customSymbols: state.customSymbols.filter((s) => s !== upperSymbol),
        }));
      },

      setError: (error) => set({ error }),

      clearCustomCompanies: () =>
        set((state) => ({
          companies: state.companies.filter((c) => !state.customSymbols.includes(c.symbol)),
          customSymbols: [],
        })),

      // Custom company actions
      setCustomCompany: (symbol) => {
        if (symbol === null) {
          set({ customCompanySymbol: null, customCompanyError: null, customCompanyLoading: false });
          return;
        }
        const upperSymbol = symbol.toUpperCase();
        if (!isValidSymbol(upperSymbol)) {
          set({ customCompanyError: `Invalid symbol: ${symbol}. Use 1-5 uppercase letters.`, customCompanySymbol: null });
          return;
        }
        set({ customCompanySymbol: upperSymbol, customCompanyError: null, customCompanyLoading: true });
      },

      setCustomCompanyLoading: (loading) => set({ customCompanyLoading: loading }),
      setCustomCompanyError: (error) => set({ customCompanyError: error, customCompanyLoading: false }),

      clearCustomCompany: () =>
        set({ customCompanySymbol: null, customCompanyError: null, customCompanyLoading: false }),
    }),
    {
      name: 'finance-store',
      partialize: (state) => ({
        customSymbols: state.customSymbols,
        activeTimeWindow: state.activeTimeWindow,
      }),
    }
  )
);