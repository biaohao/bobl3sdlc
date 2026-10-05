import { useFinanceStore } from '@/store';
import { useDefaultHistory } from '@/hooks';
import { ChartCard, LineChart } from '../charts';
import { DEFAULT_COMPANIES } from '@/constants/companies';
import type { HistoryPoint } from '@/services/finance/types';

export function SevenDayView() {
  const activeTimeWindow = useFinanceStore((state) => state.activeTimeWindow);
  const { data: historyResult, isLoading, isError, error, refetch } = useDefaultHistory('7d');

  if (activeTimeWindow !== '7d') {
    return null;
  }

  const historyMap = historyResult?.ok ? historyResult.data : new Map();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEFAULT_COMPANIES.map((company) => (
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
        error={error?.message ?? 'Failed to load historical data'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DEFAULT_COMPANIES.map((company) => {
        const history = historyMap.get(company.symbol) as HistoryPoint[] | undefined;
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