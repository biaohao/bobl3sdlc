import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrentDayView, SevenDayView, QuarterView, DashboardLayout, CompanySelector } from '@/components/dashboard';
import { useFinanceStore } from '@/store';

// Mock hooks with factory functions defined inside vi.mock (hoisted)
vi.mock('@/hooks', () => {
  const mockUseDefaultQuotes = vi.fn(() => ({
    data: { ok: true, data: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }));

  const mockUseDefaultHistory = vi.fn(() => ({
    data: { ok: true, data: new Map() },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }));

  const mockUseAlignedHistory = vi.fn(() => ({
    data: { ok: true, data: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }));

  return {
    useDefaultQuotes: mockUseDefaultQuotes,
    useDefaultHistory: mockUseDefaultHistory,
    useAlignedHistory: mockUseAlignedHistory,
  };
});

// Import the mock functions (they are vi.fn() from the factory above)
import { useDefaultQuotes, useDefaultHistory, useAlignedHistory } from '@/hooks';

vi.mock('@/store', async () => {
  const actual = await vi.importActual('@/store');
  return {
    ...actual,
    useFinanceStore: vi.fn(),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockQuoteData = [
  { symbol: 'IBM', regularMarketPrice: 150.25, regularMarketChange: 1.5, regularMarketChangePercent: 1.01, regularMarketTime: Date.now(), longName: 'International Business Machines', shortName: 'IBM', currency: 'USD', marketState: 'REGULAR' },
  { symbol: 'MSFT', regularMarketPrice: 400.50, regularMarketChange: -2.5, regularMarketChangePercent: -0.62, regularMarketTime: Date.now(), longName: 'Microsoft Corporation', shortName: 'MSFT', currency: 'USD', marketState: 'REGULAR' },
  { symbol: 'ORCL', regularMarketPrice: 120.75, regularMarketChange: 0.5, regularMarketChangePercent: 0.42, regularMarketTime: Date.now(), longName: 'Oracle Corporation', shortName: 'ORCL', currency: 'USD', marketState: 'REGULAR' },
  { symbol: 'SAP', regularMarketPrice: 180.00, regularMarketChange: 1.0, regularMarketChangePercent: 0.56, regularMarketTime: Date.now(), longName: 'SAP SE', shortName: 'SAP', currency: 'USD', marketState: 'REGULAR' },
  { symbol: 'CRM', regularMarketPrice: 250.00, regularMarketChange: -1.0, regularMarketChangePercent: -0.40, regularMarketTime: Date.now(), longName: 'Salesforce Inc.', shortName: 'CRM', currency: 'USD', marketState: 'REGULAR' },
];

const mockHistoryData = new Map([
  ['IBM', [{ date: '2024-01-01', close: 150, high: 152, low: 148, open: 149, volume: 1000000, adjustedClose: 150 }]],
  ['MSFT', [{ date: '2024-01-01', close: 400, high: 402, low: 398, open: 399, volume: 2000000, adjustedClose: 400 }]],
  ['ORCL', [{ date: '2024-01-01', close: 120, high: 122, low: 118, open: 119, volume: 1500000, adjustedClose: 120 }]],
  ['SAP', [{ date: '2024-01-01', close: 180, high: 182, low: 178, open: 179, volume: 1200000, adjustedClose: 180 }]],
  ['CRM', [{ date: '2024-01-01', close: 250, high: 252, low: 248, open: 249, volume: 1800000, adjustedClose: 250 }]],
]);

const mockAlignedData = [
  { date: '2024-01-01', values: { IBM: 150, MSFT: 400, ORCL: 120, SAP: 180, CRM: 250 } },
];

const defaultStoreState = {
  companies: [
    { symbol: 'IBM', name: 'International Business Machines', color: '#0066FF', isPrimary: true },
    { symbol: 'MSFT', name: 'Microsoft Corporation', color: '#00A4EF', isPrimary: false },
    { symbol: 'ORCL', name: 'Oracle Corporation', color: '#F80000', isPrimary: false },
    { symbol: 'SAP', name: 'SAP SE', color: '#0099D5', isPrimary: false },
    { symbol: 'CRM', name: 'Salesforce Inc.', color: '#00A1E0', isPrimary: false },
  ],
  activeTimeWindow: 'day' as const,
  customSymbols: [],
  error: null,
  setTimeWindow: vi.fn(),
  addCustomCompany: vi.fn(),
  removeCustomCompany: vi.fn(),
  setError: vi.fn(),
  clearCustomCompanies: vi.fn(),
};

describe('Dashboard components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset hook mocks to defaults
    useDefaultQuotes.mockImplementation(() => ({
      data: { ok: true, data: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }));
    
    useDefaultHistory.mockImplementation(() => ({
      data: { ok: true, data: new Map() },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }));
    
    useAlignedHistory.mockImplementation(() => ({
      data: { ok: true, data: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }));

    // Reset store mock
    vi.mocked(useFinanceStore).mockImplementation((selector) => selector(defaultStoreState));
  });

  describe('CurrentDayView', () => {
    it('renders summary cards for all companies', () => {
      useDefaultQuotes.mockImplementation(() => ({
        data: { ok: true, data: mockQuoteData },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      }));

      render(<CurrentDayView />, { wrapper: createWrapper() });
      expect(screen.getByText('IBM')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.getByText('ORCL')).toBeInTheDocument();
      expect(screen.getByText('SAP')).toBeInTheDocument();
      expect(screen.getByText('CRM')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      useDefaultQuotes.mockImplementation(() => ({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      }));

      render(<CurrentDayView />, { wrapper: createWrapper() });
      expect(screen.getByText('IBM')).toBeInTheDocument();
    });

    it('shows error state with retry button', () => {
      useDefaultQuotes.mockImplementation(() => ({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: vi.fn(),
      }));

      render(<CurrentDayView />, { wrapper: createWrapper() });
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  describe('SevenDayView', () => {
    it('renders line charts when 7d window is active', () => {
      useDefaultHistory.mockImplementation(() => ({
        data: { ok: true, data: mockHistoryData },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      }));

      vi.mocked(useFinanceStore).mockImplementation((selector) => {
        const state = {
          ...defaultStoreState,
          activeTimeWindow: '7d' as const,
        };
        return selector(state);
      });

      render(<SevenDayView />, { wrapper: createWrapper() });
      // Each company card shows "7-day trend" - check at least one exists
      expect(screen.getAllByText('7-day trend').length).toBeGreaterThan(0);
    });

    it('returns null when not 7d window', () => {
      vi.mocked(useFinanceStore).mockImplementation((selector) => {
        const state = {
          ...defaultStoreState,
          activeTimeWindow: 'day' as const,
        };
        return selector(state);
      });

      const { container } = render(<SevenDayView />, { wrapper: createWrapper() });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('QuarterView', () => {
    it('renders area chart when quarter window is active', () => {
      useAlignedHistory.mockImplementation(() => ({
        data: { ok: true, data: mockAlignedData },
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      }));

      vi.mocked(useFinanceStore).mockImplementation((selector) => {
        const state = {
          ...defaultStoreState,
          activeTimeWindow: 'quarter' as const,
        };
        return selector(state);
      });

      render(<QuarterView />, { wrapper: createWrapper() });
      expect(screen.getByText('Last Quarter Comparison')).toBeInTheDocument();
    });

    it('returns null when not quarter window', () => {
      vi.mocked(useFinanceStore).mockImplementation((selector) => {
        const state = { activeTimeWindow: 'day' as const };
        return selector(state);
      });

      const { container } = render(<QuarterView />, { wrapper: createWrapper() });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('DashboardLayout', () => {
    it('renders header with title', () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
        { wrapper: createWrapper() }
      );
      expect(screen.getByText('Market Dashboard')).toBeInTheDocument();
      // Text is "IBM & Competitors — Real-time Finance Analytics"
      expect(screen.getByText(/IBM & Competitors/)).toBeInTheDocument();
    });

    it('renders time window selector', () => {
      render(
        <DashboardLayout><div /></DashboardLayout>,
        { wrapper: createWrapper() }
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders company selector', () => {
      render(
        <DashboardLayout><div /></DashboardLayout>,
        { wrapper: createWrapper() }
      );
      expect(screen.getByPlaceholderText('Add ticker (e.g., AAPL)...')).toBeInTheDocument();
    });

    it('shows error banner when store has error', () => {
      vi.mocked(useFinanceStore).mockImplementation((selector) => {
        const state = {
          ...defaultStoreState,
          activeTimeWindow: 'day' as const,
          error: 'Test error',
          setError: vi.fn(),
        };
        return selector(state);
      });

      render(
        <DashboardLayout><div /></DashboardLayout>,
        { wrapper: createWrapper() }
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('CompanySelector', () => {
    it('renders input with placeholder', () => {
      render(<CompanySelector />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('Add ticker (e.g., AAPL)...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Add ticker (e.g., AAPL)...');
    });

    it('has autocomplete attributes', () => {
      render(<CompanySelector />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('Add ticker (e.g., AAPL)...');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-controls', 'ticker-suggestions');
    });

    it('shows no suggestions initially', () => {
      render(<CompanySelector />, { wrapper: createWrapper() });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});