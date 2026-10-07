import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuote, useQuotes, useHistory, useDefaultHistory, useAlignedHistory, useDefaultQuotes, useCustomCompanyQuote, useCustomCompanyHistory } from '@/hooks/useFinanceData';
import { getQuote, getHistory, getQuotes, getDefaultHistory, getAlignedHistory } from '@/services/finance';

vi.mock('@/services/finance', async () => {
  const actual = await vi.importActual('@/services/finance');
  return {
    ...actual,
    getQuote: vi.fn(),
    getHistory: vi.fn(),
    getQuotes: vi.fn(),
    getDefaultHistory: vi.fn(),
    getAlignedHistory: vi.fn(),
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

const mockQuote = (symbol: string, price: number) => ({
  ok: true,
  data: {
    symbol,
    regularMarketPrice: price,
    regularMarketChange: 1.5,
    regularMarketChangePercent: 1.0,
    regularMarketTime: Date.now(),
    longName: `${symbol} Corporation`,
    shortName: symbol,
    currency: 'USD',
    marketState: 'REGULAR',
  },
});

const mockHistory = (days: number) => ({
  ok: true,
  data: Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
    close: 150 + i,
    high: 152 + i,
    low: 148 + i,
    open: 149 + i,
    volume: 1000000,
    adjustedClose: 150 + i,
  })),
});

describe('useFinanceData hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useQuote', () => {
    it('returns quote data when enabled', async () => {
      vi.mocked(getQuote).mockResolvedValue(mockQuote('IBM', 150));

      const { result } = renderHook(() => useQuote('IBM'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data.regularMarketPrice).toBe(150);
    });

    it('does not fetch when symbol is null', () => {
      const { result } = renderHook(() => useQuote(null), { wrapper: createWrapper() });
      // In TanStack Query v5, disabled queries have fetchStatus 'idle'
      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(getQuote).not.toHaveBeenCalled();
    });

    it('returns error result on failure', async () => {
      vi.mocked(getQuote).mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'Failed' } });

      const { result } = renderHook(() => useQuote('INVALID'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(false);
      expect(result.current.data?.error).toEqual({ code: 'NETWORK', message: 'Failed' });
    });
  });

  describe('useQuotes', () => {
    it('fetches multiple quotes', async () => {
      vi.mocked(getQuotes).mockResolvedValue({
        ok: true,
        data: [mockQuote('IBM', 150).data, mockQuote('MSFT', 400).data],
      });

      const { result } = renderHook(() => useQuotes(['IBM', 'MSFT']), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data).toHaveLength(2);
    });

    it('does not fetch when empty array', () => {
      const { result } = renderHook(() => useQuotes([]), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useHistory', () => {
    it('fetches history for symbol and window', async () => {
      vi.mocked(getHistory).mockResolvedValue(mockHistory(7));

      const { result } = renderHook(() => useHistory('IBM', '7d'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data).toHaveLength(7);
      expect(getHistory).toHaveBeenCalledWith('IBM', expect.any(Date), expect.any(Date));
    });

    it('does not fetch when symbol is null', () => {
      const { result } = renderHook(() => useHistory(null, '7d'), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useDefaultHistory', () => {
    it('fetches default history for window', async () => {
      const mockMap = new Map([
        ['IBM', mockHistory(7).data],
        ['MSFT', mockHistory(7).data],
      ]);
      vi.mocked(getDefaultHistory).mockResolvedValue({ ok: true, data: mockMap });

      const { result } = renderHook(() => useDefaultHistory('7d'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data).toBeInstanceOf(Map);
    });
  });

  describe('useAlignedHistory', () => {
    it('fetches aligned history for window', async () => {
      vi.mocked(getAlignedHistory).mockResolvedValue({
        ok: true,
        data: [
          { date: '2024-01-01', values: { IBM: 150, MSFT: 400 } },
          { date: '2024-01-02', values: { IBM: 151, MSFT: 405 } },
        ],
      });

      const { result } = renderHook(() => useAlignedHistory('7d'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data).toHaveLength(2);
    });
  });

  describe('useDefaultQuotes', () => {
    it('fetches default quotes', async () => {
      vi.mocked(getQuotes).mockResolvedValue({
        ok: true,
        data: [mockQuote('IBM', 150).data, mockQuote('MSFT', 400).data],
      });

      const { result } = renderHook(() => useDefaultQuotes(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data).toHaveLength(2);
    });
  });

  describe('useCustomCompanyQuote', () => {
    it('returns quote data when enabled', async () => {
      vi.mocked(getQuote).mockResolvedValue(mockQuote('AAPL', 180));

      const { result } = renderHook(() => useCustomCompanyQuote('AAPL'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data.regularMarketPrice).toBe(180);
    });

    it('does not fetch when symbol is null', () => {
      const { result } = renderHook(() => useCustomCompanyQuote(null), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(getQuote).not.toHaveBeenCalled();
    });

    it('returns error result on failure', async () => {
      vi.mocked(getQuote).mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'Failed' } });

      const { result } = renderHook(() => useCustomCompanyQuote('INVALID'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(false);
      expect(result.current.data?.error).toEqual({ code: 'NETWORK', message: 'Failed' });
    });
  });

  describe('useCustomCompanyHistory', () => {
    it('fetches history for symbol and window', async () => {
      vi.mocked(getHistory).mockResolvedValue(mockHistory(7));

      const { result } = renderHook(() => useCustomCompanyHistory('AAPL', '7d'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.ok).toBe(true);
      expect(result.current.data?.data).toHaveLength(7);
      expect(getHistory).toHaveBeenCalledWith('AAPL', expect.any(Date), expect.any(Date));
    });

    it('does not fetch when symbol is null', () => {
      const { result } = renderHook(() => useCustomCompanyHistory(null, '7d'), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });
});