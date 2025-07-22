'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { OvenProcessDataType, OvenTemperatureLogType } from '../lib/types';

interface OvenTemperatureChartProps {
  searchParams: { [key: string]: string | undefined };
  selectedProcess?: OvenProcessDataType | null;
}

const chartConfig = {
  z0: {
    label: 'Top Left',
    color: '#3b82f6', // Blue
  },
  z1: {
    label: 'Top Right',
    color: '#ef4444', // Red
  },
  z2: {
    label: 'Bottom Left',
    color: '#10b981', // Green
  },
  z3: {
    label: 'Bottom Right',
    color: '#f59e0b', // Orange
  },
  avgTemp: {
    label: 'Average Temperature',
    color: '#8b5cf6', // Purple
  },
  targetTemp: {
    label: 'Target Temperature',
    color: '#6b7280', // Gray (dashed line)
  },
} satisfies ChartConfig;

export default function OvenTemperatureChart({
  searchParams,
  selectedProcess,
}: OvenTemperatureChartProps) {
  const [temperatureData, setTemperatureData] = useState<
    OvenTemperatureLogType[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if a process is selected
    if (!selectedProcess) {
      setTemperatureData([]);
      return;
    }

    const fetchTemperatureData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Prepare search parameters with process-specific filters
        const processSearchParams = {
          ...searchParams,
          process_id: selectedProcess.id,
          from: selectedProcess.startTime.toISOString(),
          to: selectedProcess.endTime?.toISOString() || undefined,
          oven: selectedProcess.oven,
        };

        const filteredSearchParams = Object.fromEntries(
          Object.entries(processSearchParams).filter(
            ([_, value]) => value !== undefined,
          ) as [string, string][],
        );

        const queryParams = new URLSearchParams(
          filteredSearchParams,
        ).toString();
        const url = `/api/oven-data/temperature?${queryParams}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch temperature data');
        }

        const data = await response.json();
        setTemperatureData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatureData();
  }, [searchParams, selectedProcess]);

  // Process data for chart
  const chartData = temperatureData.map((log) => ({
    timestamp: new Date(log.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    z0: log.sensorData?.z0 || null,
    z1: log.sensorData?.z1 || null,
    z2: log.sensorData?.z2 || null,
    z3: log.sensorData?.z3 || null,
    avgTemp: log.avgTemp,
    targetTemp: selectedProcess?.config?.temp || 180, // Use process target temp or default
  }));

  // Show placeholder when no process is selected
  if (!selectedProcess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend</CardTitle>
          <CardDescription>
            Select a process from the table above to view its temperature data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[300px] items-center justify-center text-gray-500'>
            No process selected
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend</CardTitle>
          <CardDescription>
            Loading temperature data for process {selectedProcess.id}...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[300px] items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend</CardTitle>
          <CardDescription>Error loading temperature data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[300px] items-center justify-center text-red-500'>
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend</CardTitle>
          <CardDescription>
            No temperature data available for process {selectedProcess.id}(
            {selectedProcess.article} on {selectedProcess.oven.toUpperCase()})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[300px] items-center justify-center text-gray-500'>
            No temperature data found for this process
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Trend</CardTitle>
        <CardDescription>
          Process {selectedProcess.id} - {selectedProcess.article} on{' '}
          {selectedProcess.oven.toUpperCase()}
          {selectedProcess.config && (
            <span className='ml-2'>
              (Target: {selectedProcess.config.temp}°C ±
              {selectedProcess.config.tempTolerance}°C)
            </span>
          )}
          <br />
          {selectedProcess.startTimeLocaleString} -{' '}
          {selectedProcess.endTimeLocaleString || 'In progress'}(
          {chartData.length} readings)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='timestamp'
              className='text-xs'
              tick={{ fontSize: 10 }}
              interval='preserveStartEnd'
            />
            <YAxis
              className='text-xs'
              tick={{ fontSize: 10 }}
              label={{
                value: 'Temperature (°C)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value, name) => {
                    const labels: { [key: string]: string } = {
                      z0: 'Top Left',
                      z1: 'Top Right',
                      z2: 'Bottom Left',
                      z3: 'Bottom Right',
                      avgTemp: 'Average Temperature',
                      targetTemp: 'Target Temperature',
                    };
                    return [`${value}°C`, labels[name] || name];
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />

            {/* Individual sensor readings */}
            <Line
              type='monotone'
              dataKey='z0'
              stroke={chartConfig.z0.color}
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 3 }}
              connectNulls={false}
            />
            <Line
              type='monotone'
              dataKey='z1'
              stroke={chartConfig.z1.color}
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 3 }}
              connectNulls={false}
            />
            <Line
              type='monotone'
              dataKey='z2'
              stroke={chartConfig.z2.color}
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 3 }}
              connectNulls={false}
            />
            <Line
              type='monotone'
              dataKey='z3'
              stroke={chartConfig.z3.color}
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 3 }}
              connectNulls={false}
            />

            {/* Average temperature - thicker line */}
            <Line
              type='monotone'
              dataKey='avgTemp'
              stroke={chartConfig.avgTemp.color}
              strokeWidth={3}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />

            {/* Target temperature - dashed reference line */}
            <Line
              type='monotone'
              dataKey='targetTemp'
              stroke={chartConfig.targetTemp.color}
              strokeWidth={2}
              strokeDasharray='5 5'
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
