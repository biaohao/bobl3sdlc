import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HistoryPoint } from '@/services/finance/types';
import { formatCurrency, formatShortDate, formatCurrencyForAxis, formatShortDateForAxis } from '@/utils/numberUtils';

interface LineChartProps {
  data: HistoryPoint[];
  color: string;
  title?: string;
  height?: number;
  showLegend?: boolean;
  animate?: boolean;
}

export function LineChart({
  data,
  color,
  title,
  height = 300,
  showLegend = false,
  animate = true,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-[#f7f8fa] rounded-lg">
        <p className="text-[#57606a]">No data available</p>
      </div>
    );
  }

  const formattedData = data.map((point) => ({
    ...point,
    date: point.date,
  }));

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-[#1f2328] mb-2">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDateForAxis}
            stroke="#57606a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#57606a"
            fontSize={11}
            tickFormatter={formatCurrencyForAxis}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), '']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={formatShortDate}
          />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2 }}
            isAnimationActive={animate}
            animationDuration={500}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MultiLineChartProps {
  data: { date: string; values: Record<string, number> }[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  height?: number;
  animate?: boolean;
}

export function MultiLineChart({
  data,
  colors,
  labels,
  height = 350,
  animate = true,
}: MultiLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-[#f7f8fa] rounded-lg">
        <p className="text-[#57606a]">No data available</p>
      </div>
    );
  }

  const symbols = Object.keys(colors);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDateForAxis}
            stroke="#57606a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#57606a"
            fontSize={11}
            tickFormatter={formatCurrencyForAxis}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              labels[name] || name,
            ]}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={formatShortDate}
          />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            iconType="line"
            wrapperStyle={{ paddingTop: '10px' }}
          />
          {symbols.map((symbol) => (
            <Line
              key={symbol}
              type="monotone"
              dataKey={`values.${symbol}`}
              stroke={colors[symbol]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name={labels[symbol] || symbol}
              isAnimationActive={animate}
              animationDuration={500}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}