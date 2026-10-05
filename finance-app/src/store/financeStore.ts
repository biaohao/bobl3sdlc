import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompanyConfig } from '@/constants/companies';
import type { TimeWindow } from '@/constants/timeWindows';

interface FinanceState {
  companies: CompanyConfig[];
  activeTimeWindow: TimeWindow;
  customSymbols: string[];
  error: string | null;

  setTimeWindow: (window: TimeWindow) => void;
  addCustomCompany: (symbol: string, config: CompanyConfig) => void;
  removeCustomCompany: (symbol: string) => void;
  setError: (error: string | null) => void;
  clearCustomCompanies: () => void;
}

const isValidSymbol = (symbol: string): boolean => /^[A-Z]{1,5}$/.test(symbol);

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      companies: [],
      activeTimeWindow: 'day',
      customSymbols: [],
      error: null,

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