import { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '../common';
import { LoadingSpinner } from '../common';
import { ErrorMessage } from '../common';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  onRetry,
  className = '',
  action,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="md" message="Loading chart..." />
          </div>
        )}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={onRetry}
            retryLabel="Retry"
          />
        )}
        {!loading && !error && children}
      </CardContent>
    </Card>
  );
}

interface SummaryCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  color?: string;
  className?: string;
}

export function SummaryCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  currency = 'USD',
  color,
  className = '',
}: SummaryCardProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBg = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#57606a] uppercase tracking-wide">{symbol}</p>
          <h3 className="text-lg font-semibold text-[#1f2328] mt-0.5">{name}</h3>
        </div>
        {color && (
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
            style={{ backgroundColor: color }}
            aria-hidden="true"
            data-testid="color-indicator"
          />
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-[#1f2328] tabular-nums">
          {formatCurrency(price, currency)}
        </p>
        <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${changeColor} ${changeBg} mt-2`}>
          <span className="mr-1">{isPositive ? '+' : ''}{change.toFixed(2)}</span>
          <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    </Card>
  );
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}