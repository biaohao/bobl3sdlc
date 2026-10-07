import { useMemo } from 'react';
import { useFinanceStore } from '@/store';
import { useMultipleHistories } from '@/hooks';
import { ChartCard, AreaChart } from '../charts';
import { DEFAULT_COMPANIES, type CompanyConfig } from '@/constants/companies';
import { alignHistoryByDate } from '@/services/finance/transformers';
import type { HistoryPoint } from '@/services/finance/types';

export function QuarterView() {
  const activeTimeWindow = useFinanceStore((state) => state.activeTimeWindow);
  const rawCompanies = useFinanceStore((state) => state.companies);
  const rawCustomSymbols = useFinanceStore((state) => state.customSymbols);

  const displayCompanies: CompanyConfig[] = useMemo(() => {
    const companies = rawCompanies || [];
    const customSymbols = rawCustomSymbols || [];
    return [
      ...DEFAULT_COMPANIES,
      ...companies.filter((c) => customSymbols.includes(c.symbol) && !DEFAULT_COMPANIES.some((dc) => dc.symbol === c.symbol)),
    ];
  }, [rawCompanies, rawCustomSymbols]);

  const symbols = displayCompanies.map((c) => c.symbol);
  const historyQueries = useMultipleHistories(symbols, 'quarter');

  const { alignedData, colors, labels } = useMemo(() => {
    const historyMap = new Map<string, HistoryPoint[]>();
    const colorsMap: Record<string, string> = {};
    const labelsMap: Record<string, string> = {};

    displayCompanies.forEach((company, index) => {
      colorsMap[company.symbol] = company.color;
      labelsMap[company.symbol] = company.name;
      const query = historyQueries[index];
      if (query?.data?.ok && Array.isArray(query.data.data)) {
        historyMap.set(company.symbol, query.data.data);
      }
    });

    return {
      alignedData: alignHistoryByDate(historyMap),
      colors: colorsMap,
      labels: labelsMap,
    };
  }, [displayCompanies, historyQueries]);

  if (activeTimeWindow !== 'quarter') {
    return null;
  }

  const isLoading = historyQueries.some((q) => q.isLoading);
  const isError = historyQueries.every((q) => q.isError || (q.data && !q.data.ok));

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
        error="Failed to load quarterly data"
        onRetry={() => historyQueries.forEach((q) => q.refetch())}
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