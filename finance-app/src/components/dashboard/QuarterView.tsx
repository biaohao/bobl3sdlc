import { useFinanceStore } from '@/store';
import { useAlignedHistory } from '@/hooks';
import { ChartCard, AreaChart } from '../charts';
import { DEFAULT_COMPANIES } from '@/constants/companies';

export function QuarterView() {
  const activeTimeWindow = useFinanceStore((state) => state.activeTimeWindow);
  const { data: alignedResult, isLoading, isError, error, refetch } = useAlignedHistory('quarter');

  if (activeTimeWindow !== 'quarter') {
    return null;
  }

  const alignedData = alignedResult?.ok ? alignedResult.data : [];
  const colors: Record<string, string> = {};
  const labels: Record<string, string> = {};

  DEFAULT_COMPANIES.forEach((company) => {
    colors[company.symbol] = company.color;
    labels[company.symbol] = company.name;
  });

  if (isLoading) {
    return (
      <ChartCard title="Last Quarter Comparison" subtitle="Quarterly trend for all companies" loading>
        <div className="h-80" />
      </ChartCard>
    );
  }

  if (isError) {
    return (
      <ChartCard
        title="Last Quarter Comparison"
        subtitle="Quarterly trend for all companies"
        error={error?.message ?? 'Failed to load quarterly data'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ChartCard title="Last Quarter Comparison" subtitle="Quarterly trend for all companies">
      {alignedData.length > 0 ? (
        <AreaChart
          data={alignedData}
          colors={colors}
          labels={labels}
          height={400}
          stacked={false}
        />
      ) : (
        <div className="h-80 flex items-center justify-center text-[#57606a]">
          No data available
        </div>
      )}
    </ChartCard>
  );
}