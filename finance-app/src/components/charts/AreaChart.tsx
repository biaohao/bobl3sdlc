import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatShortDate, formatCurrencyForAxis, formatShortDateForAxis } from '@/utils/numberUtils';

interface AreaChartProps {
  data: { date: string; values: Record<string, number> }[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  height?: number;
  stacked?: boolean;
  animate?: boolean;
}

export function AreaChart({
  data,
  colors,
  labels,
  height = 350,
  stacked = false,
  animate = true,
}: AreaChartProps) {
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
        <RechartsAreaChart
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
            iconType="square"
            wrapperStyle={{ paddingTop: '10px' }}
          />
          {symbols.map((symbol) => (
            <Area
              key={symbol}
              type="monotone"
              dataKey={`values.${symbol}`}
              stroke={colors[symbol]}
              fill={colors[symbol]}
              fillOpacity={stacked ? 0.3 : 0.15}
              strokeWidth={2}
              name={labels[symbol] || symbol}
              stackId={stacked ? 'stack' : undefined}
              isAnimationActive={animate}
              animationDuration={500}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}