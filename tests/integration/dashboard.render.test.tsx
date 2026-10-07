import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '@/pages/DashboardPage';
import { useFinanceStore } from '@/store';

vi.mock('@/hooks', () => ({
  useQuotes: () => ({
    data: { ok: true, data: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDefaultQuotes: () => ({
    data: { ok: true, data: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useDefaultHistory: () => ({
    data: { ok: true, data: new Map() },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAlignedHistory: () => ({
    data: { ok: true, data: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCustomCompanyQuote: () => ({
    data: { ok: true, data: null },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCustomCompanyHistory: () => ({
    data: { ok: true, data: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('DashboardPage integration', () => {
  it('renders without crashing', () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Market Dashboard')).toBeInTheDocument();
  });

  it('shows time window selector', () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows company selector', () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('Add ticker (e.g., AAPL)...')).toBeInTheDocument();
  });
});