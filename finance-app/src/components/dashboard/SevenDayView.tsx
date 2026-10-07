import { useFinanceStore } from '@/store';
import { useMultipleHistories } from '@/hooks';
import { ChartCard, LineChart } from '../charts';
import { DEFAULT_COMPANIES, type CompanyConfig } from '@/constants/companies';
import type { HistoryPoint } from '@/services/finance/types';

export function SevenDayView() {
  const activeTimeWindow = useFinanceStore((state) => state.activeTimeWindow);
  const companies = useFinanceStore((state) => state.companies) || [];
  const customSymbols = useFinanceStore((state) => state.customSymbols) || [];

  const displayCompanies: CompanyConfig[] = [
    ...DEFAULT_COMPANIES,
    ...companies.filter((c) => customSymbols.includes(c.symbol) && !DEFAULT_COMPANIES.some((dc) => dc.symbol === c.symbol)),
  ];

  const symbols = displayCompanies.map((c) => c.symbol);
  const historyQueries = useMultipleHistories(symbols, '7d');

  if (activeTimeWindow !== '7d') {
    return null;
  }

  const isLoading = historyQueries.some((q) => q.isLoading);
  const isError = historyQueries.every((q) => q.isError || (q.data && !q.data.ok));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCompanies.map((company) => (
          <ChartCard key={company.symbol} title={company.name} loading>
            <div className="h-64" />
          </ChartCard>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ChartCard
        title="Last 7 Days Trend"
        subtitle="Weekly price comparison"
        error="Failed to load historical data"
        onRetry={() => historyQueries.forEach((q) => q.refetch())}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCompanies.map((company, index) => {
        const query = historyQueries[index];
        const history = (query?.data?.ok && query.data.data) as HistoryPoint[] | undefined;
        return (
          <ChartCard key={company.symbol} title={company.name} subtitle="7-day trend">
            {history && history.length > 0 ? (
              <LineChart data={history} color={company.color} height={280} />
            ) : (
              <div className="h-64 flex items-center justify-center text-[#57606a]">
                No data
              </div>
            )}
          </ChartCard>
        );
      })}
    </div>
  );
}