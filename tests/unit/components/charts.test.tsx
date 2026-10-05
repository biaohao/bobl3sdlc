import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineChart, AreaChart, ChartCard, SummaryCard } from '@/components/charts';
import type { HistoryPoint } from '@/services/finance/types';

const mockHistory: HistoryPoint[] = [
  { date: '2024-01-01', close: 150, high: 152, low: 148, open: 149, volume: 1000000, adjustedClose: 150 },
  { date: '2024-01-02', close: 151, high: 153, low: 149, open: 150, volume: 1100000, adjustedClose: 151 },
  { date: '2024-01-03', close: 152, high: 154, low: 150, open: 151, volume: 1200000, adjustedClose: 152 },
];

const mockAlignedData = [
  { date: '2024-01-01', values: { IBM: 150, MSFT: 400 } },
  { date: '2024-01-02', values: { IBM: 151, MSFT: 405 } },
  { date: '2024-01-03', values: { IBM: 152, MSFT: 410 } },
];

describe('Chart components', () => {
  describe('LineChart', () => {
    it('renders with data', () => {
      render(<LineChart data={mockHistory} color="#0066FF" title="IBM" height={200} animate={false} />);
      expect(screen.getByText('IBM')).toBeInTheDocument();
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });

    it('shows "No data available" when empty', () => {
      render(<LineChart data={[]} color="#0066FF" height={200} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders without title when not provided', () => {
      render(<LineChart data={mockHistory} color="#0066FF" height={200} />);
      expect(screen.queryByText('IBM')).not.toBeInTheDocument();
    });
  });

  describe('AreaChart', () => {
    it('renders with aligned data', () => {
      render(
        <AreaChart
          data={mockAlignedData}
          colors={{ IBM: '#0066FF', MSFT: '#00A4EF' }}
          labels={{ IBM: 'IBM', MSFT: 'Microsoft' }}
          height={200}
          animate={false}
        />
      );
      // Should not show "No data available"
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });

    it('shows "No data available" when empty', () => {
      render(
        <AreaChart
          data={[]}
          colors={{ IBM: '#0066FF' }}
          labels={{ IBM: 'IBM' }}
          height={200}
        />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('ChartCard', () => {
    it('renders title and subtitle', () => {
      render(
        <ChartCard title="Test Chart" subtitle="Subtitle">
          <div data-testid="content">Content</div>
        </ChartCard>
      );
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
      render(<ChartCard title="Loading" loading><div /></ChartCard>);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    });

    it('shows error message when error', () => {
      render(<ChartCard title="Error" error="Failed to load" onRetry={vi.fn()}><div /></ChartCard>);
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('renders children when not loading or error', () => {
      render(
        <ChartCard title="Test">
          <div data-testid="child-content">Child</div>
        </ChartCard>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(<ChartCard title="Error" error="Failed" onRetry={onRetry}><div /></ChartCard>);
      screen.getByRole('button', { name: 'Retry' }).click();
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('SummaryCard', () => {
    it('renders symbol, name, price, and change', () => {
      render(
        <SummaryCard
          symbol="IBM"
          name="International Business Machines"
          price={150.25}
          change={1.5}
          changePercent={1.01}
          color="#0066FF"
        />
      );
      expect(screen.getByText('IBM')).toBeInTheDocument();
      expect(screen.getByText('International Business Machines')).toBeInTheDocument();
      expect(screen.getByText('$150.25')).toBeInTheDocument();
      expect(screen.getByText('+1.50')).toBeInTheDocument();
      expect(screen.getByText('(+1.01%)')).toBeInTheDocument();
      // Color indicator is a div with aria-hidden, no label
      expect(screen.queryByLabelText('IBM')).not.toBeInTheDocument();
    });

    it('shows negative change in red', () => {
      render(
        <SummaryCard
          symbol="IBM"
          name="IBM"
          price={150.25}
          change={-1.5}
          changePercent={-1.01}
        />
      );
      expect(screen.getByText('-1.50')).toBeInTheDocument();
      expect(screen.getByText('(-1.01%)')).toBeInTheDocument();
    });

    it('shows zero change correctly', () => {
      render(
        <SummaryCard
          symbol="IBM"
          name="IBM"
          price={150}
          change={0}
          changePercent={0}
        />
      );
      expect(screen.getByText('+0.00')).toBeInTheDocument();
      expect(screen.getByText('(+0.00%)')).toBeInTheDocument();
    });

    it('renders color indicator when color provided', () => {
      render(
        <SummaryCard
          symbol="IBM"
          name="IBM"
          price={150}
          change={0}
          changePercent={0}
          color="#0066FF"
        />
      );
      // The color indicator is a div with backgroundColor style
      const indicator = screen.getByTestId('color-indicator');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveStyle({ backgroundColor: '#0066ff' });
    });

    it('does not render color indicator when not provided', () => {
      render(
        <SummaryCard
          symbol="IBM"
          name="IBM"
          price={150}
          change={0}
          changePercent={0}
        />
      );
      // Should not have the color div
      expect(screen.queryByTestId('color-indicator')).not.toBeInTheDocument();
    });
  });
});