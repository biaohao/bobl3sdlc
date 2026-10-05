import { useDefaultQuotes } from '@/hooks';
import { ChartCard, SummaryCard } from '../charts';
import { DEFAULT_COMPANIES } from '@/constants/companies';
import type { Quote } from '@/services/finance/types';

export function CurrentDayView() {
  const { data: quotesResult, isLoading, isError, error, refetch } = useDefaultQuotes();

  const quotes: Quote[] = quotesResult?.ok ? quotesResult.data : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {DEFAULT_COMPANIES.map((company) => (
          <SummaryCard
            key={company.symbol}
            symbol={company.symbol}
            name={company.name}
            price={0}
            change={0}
            changePercent={0}
            color={company.color}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ChartCard
        title="Current Day Summary"
        subtitle="Real-time market data"
        error={error?.message ?? 'Failed to load quotes'}
        onRetry={() => refetch()}
      />
    );
  }

  const primaryQuote = quotes.find((q) => q.symbol === 'IBM');
  const competitorQuotes = quotes.filter((q) => q.symbol !== 'IBM');

  return (
    <div className="space-y-6">
      {primaryQuote && (
        <ChartCard
          title="IBM — Primary"
          subtitle="Current day market summary"
          className="lg:col-span-2"
        >
          <SummaryCard
            symbol={primaryQuote.symbol}
            name={primaryQuote.longName}
            price={primaryQuote.regularMarketPrice}
            change={primaryQuote.regularMarketChange}
            changePercent={primaryQuote.regularMarketChangePercent}
            currency={primaryQuote.currency}
            color="#0066FF"
          />
        </ChartCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {competitorQuotes.map((quote) => {
          const company = DEFAULT_COMPANIES.find((c) => c.symbol === quote.symbol);
          return (
            <SummaryCard
              key={quote.symbol}
              symbol={quote.symbol}
              name={quote.longName}
              price={quote.regularMarketPrice}
              change={quote.regularMarketChange}
              changePercent={quote.regularMarketChangePercent}
              currency={quote.currency}
              color={company?.color}
            />
          );
        })}
      </div>
    </div>
  );
}