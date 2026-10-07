import { useEffect } from 'react';
import { useFinanceStore } from '@/store';
import { useCustomCompanyQuote, useCustomCompanyHistory } from '@/hooks';
import { ChartCard, LineChart } from '../charts';
import { LoadingSpinner } from '../common';

export function CustomCompanyView() {
  const { activeTimeWindow, customCompanySymbol, customCompanyLoading, customCompanyError, setCustomCompanyLoading, setCustomCompanyError, clearCustomCompany } = useFinanceStore();

  const quoteQuery = useCustomCompanyQuote(customCompanySymbol);
  const historyQuery = useCustomCompanyHistory(customCompanySymbol, activeTimeWindow);

  // Sync loading/error states with store
  useEffect(() => {
    if (customCompanySymbol) {
      setCustomCompanyLoading(quoteQuery.isLoading || historyQuery.isLoading);
    }
  }, [customCompanySymbol, quoteQuery.isLoading, historyQuery.isLoading, setCustomCompanyLoading]);

  useEffect(() => {
    if (customCompanySymbol) {
      const quoteError = quoteQuery.data && !quoteQuery.data.ok ? quoteQuery.data.error?.message : null;
      const historyError = historyQuery.data && !historyQuery.data.ok ? historyQuery.data.error?.message : null;
      if (quoteQuery.isError || historyQuery.isError || quoteError || historyError) {
        setCustomCompanyError(quoteError || historyError || 'Failed to load data for the selected company.');
      } else if (quoteQuery.isSuccess && historyQuery.isSuccess) {
        setCustomCompanyError(null);
      }
    }
  }, [customCompanySymbol, quoteQuery, historyQuery, setCustomCompanyError]);

  if (!customCompanySymbol) {
    return null;
  }

  // Show loading state
  if (customCompanyLoading || quoteQuery.isLoading || historyQuery.isLoading) {
    return (
      <ChartCard title={`Custom Company: ${customCompanySymbol}`} loading>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="md" message="Loading chart..." />
        </div>
      </ChartCard>
    );
  }

  // Show error state
  if (customCompanyError) {
    return (
      <ChartCard title={`Custom Company: ${customCompanySymbol}`} error={customCompanyError} onRetry={() => clearCustomCompany()}>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#57606a]">Click Retry to try again or clear to remove.</p>
        </div>
      </ChartCard>
    );
  }

  // Show chart with data
  const historyData = (historyQuery.data && historyQuery.data.ok && historyQuery.data.data) || [];
  const quoteData = quoteQuery.data && quoteQuery.data.ok ? quoteQuery.data.data : null;

  return (
    <ChartCard title={`Custom Company: ${customCompanySymbol}`}>
      {historyData.length > 0 && (
        <LineChart
          data={historyData}
          color="#7c5cd8"
          height={280}
          animate={false}
        />
      )}
      {historyData.length === 0 && (
        <div className="flex items-center justify-center h-64 bg-[#f7f8fa] rounded-lg">
          <p className="text-[#57606a]">No historical data available</p>
        </div>
      )}
      {quoteData && (
        <div className="mt-4 p-3 bg-[#f7f8fa] rounded-lg text-sm">
          <p className="font-medium text-[#1f2328]">Current Quote</p>
          <p className="text-[#57606a]">
            Price: ${quoteData.regularMarketPrice.toFixed(2)} | Change: {quoteData.regularMarketChange >= 0 ? '+' : ''}{quoteData.regularMarketChange.toFixed(2)} ({quoteData.regularMarketChangePercent >= 0 ? '+' : ''}{quoteData.regularMarketChangePercent.toFixed(2)}%)
          </p>
        </div>
      )}
    </ChartCard>
  );
}