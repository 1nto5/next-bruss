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

// Generate distinct colors for departments
const DEPARTMENT_COLORS = [
  '#60a5fa', // blue-400
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

const BASE_COLORS = {
  forecast: '#60a5fa', // Light blue for forecast (blue-400)
  historical: '#92b34e', // Custom green for historical hours
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    // Group payload by type (forecast/historical)
    const forecastEntries = payload.filter((entry: any) => 
      entry.dataKey.includes('forecast') && entry.value > 0
    );
    const historicalEntries = payload.filter((entry: any) => 
      entry.dataKey.includes('historical') && entry.value > 0
    );

    return (
      <div className='bg-background rounded-lg border p-3 shadow-lg max-w-xs'>
        <p className='font-medium mb-2'>{`Okres: ${label}`}</p>
        
        {forecastEntries.length > 0 && (
          <div className='mb-2'>
            <p className='text-sm font-medium text-blue-600'>Forecast:</p>
            {forecastEntries.map((entry: any, index: number) => (
              <p key={index} className='text-xs pl-2' style={{ color: entry.color }}>
                {`${entry.dataKey.replace('forecastHours_', '')}: ${entry.value.toFixed(1)}h`}
              </p>
            ))}
          </div>
        )}
        
        {historicalEntries.length > 0 && (
          <div>
            <p className='text-sm font-medium text-green-600'>Wykonane:</p>
            {historicalEntries.map((entry: any, index: number) => (
              <p key={index} className='text-xs pl-2' style={{ color: entry.color }}>
                {`${entry.dataKey.replace('historicalHours_', '')}: ${entry.value.toFixed(1)}h`}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function ForecastChart({ data }: ForecastChartProps) {
  // Get all unique departments from the data
  const allDepartments = new Set<string>();
  data.forEach((period) => {
    period.departmentBreakdown.forecast.forEach(dept => allDepartments.add(dept.departmentId));
    period.departmentBreakdown.historical.forEach(dept => allDepartments.add(dept.departmentId));
  });
  const departments = Array.from(allDepartments);

  // Transform data for stacked chart
  const chartData = data.map((period) => {
    const periodData: any = {
      period: period.period,
    };

    // Add forecast hours by department
    departments.forEach((deptId, index) => {
      const forecastDept = period.departmentBreakdown.forecast.find(d => d.departmentId === deptId);
      const historicalDept = period.departmentBreakdown.historical.find(d => d.departmentId === deptId);
      
      periodData[`forecastHours_${deptId}`] = forecastDept?.hours || 0;
      periodData[`historicalHours_${deptId}`] = historicalDept?.hours || 0;
    });

    return periodData;
  });

  // Create department color mapping
  const departmentColorMap: Record<string, string> = {};
  departments.forEach((deptId, index) => {
    departmentColorMap[deptId] = DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length];
  });

  // Get department names from first period that has data
  const departmentNames: Record<string, string> = {};
  data.forEach((period) => {
    period.departmentBreakdown.forecast.forEach(dept => {
      if (!departmentNames[dept.departmentId]) {
        departmentNames[dept.departmentId] = dept.departmentName;
      }
    });
    period.departmentBreakdown.historical.forEach(dept => {
      if (!departmentNames[dept.departmentId]) {
        departmentNames[dept.departmentId] = dept.departmentName;
      }
    });
  });

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast - godziny według działów</CardTitle>
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
                orientation='left'
                label={{
                  value: 'Godziny',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {departments.map((deptId) => (
                <Bar
                  key={`forecast_${deptId}`}
                  dataKey={`forecastHours_${deptId}`}
                  stackId='forecast'
                  fill={departmentColorMap[deptId]}
                  name={`${departmentNames[deptId] || deptId} (Forecast)`}
                  opacity={0.7}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Historical Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Wykonane - godziny według działów</CardTitle>
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
                orientation='left'
                label={{
                  value: 'Godziny',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {departments.map((deptId) => (
                <Bar
                  key={`historical_${deptId}`}
                  dataKey={`historicalHours_${deptId}`}
                  stackId='historical'
                  fill={departmentColorMap[deptId]}
                  name={`${departmentNames[deptId] || deptId} (Wykonane)`}
                  opacity={0.9}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
