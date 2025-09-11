'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ForecastPeriodData } from '../lib/types';

interface ForecastChartProps {
  data: ForecastPeriodData[];
}

const COLORS = {
  forecast: '#60a5fa', // Light blue for forecast (blue-400)
  historical: '#92b34e', // Custom green for historical hours
  forecastLight: '#93c5fd', // Lighter blue for forecast (blue-300)
  historicalLight: '#a8c862', // Lighter version of custom green for historical
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className='bg-background rounded-lg border p-3 shadow-lg'>
        <p className='font-medium'>{`Okres: ${label}`}</p>
        {payload
          .filter(
            (entry: any) =>
              entry.value !== null &&
              entry.value !== undefined &&
              entry.dataKey.includes('Hours'),
          )
          .map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${
                entry.dataKey === 'forecastHours' ? 'Forecast' : 'Godziny'
              }: ${entry.value}h`}
            </p>
          ))}
      </div>
    );
  }
  return null;
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data.map((period) => ({
    ...period,
    // Only show forecast data if there are actual forecast orders
    forecastHours: period.forecastCount > 0 ? period.forecastHours : null,
    forecastCount: period.forecastCount > 0 ? period.forecastCount : null,
    // Only show historical data if there are actual historical orders
    historicalHours: period.historicalCount > 0 ? period.historicalHours : null,
    historicalCount: period.historicalCount > 0 ? period.historicalCount : null,
    forecastPercentage:
      period.totalHours > 0 && period.forecastCount > 0
        ? Math.round((period.forecastHours / period.totalHours) * 100)
        : null,
    historicalPercentage:
      period.totalHours > 0 && period.historicalCount > 0
        ? Math.round((period.historicalHours / period.totalHours) * 100)
        : null,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wykres</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='period'
              angle={-45}
              textAnchor='end'
              height={80}
              fontSize={12}
            />
            <YAxis
              yAxisId='hours'
              orientation='left'
              label={{
                value: 'Godziny',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Bar
              yAxisId='hours'
              dataKey='forecastHours'
              fill={COLORS.forecast}
              name='Forecast'
              opacity={0.8}
            />
            <Bar
              yAxisId='hours'
              dataKey='historicalHours'
              fill={COLORS.historical}
              name='Godziny'
              opacity={0.8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
