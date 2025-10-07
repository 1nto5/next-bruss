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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Locale } from '@/lib/config/i18n';
import {
  CartesianGrid,
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { useOeeData } from '../hooks/use-oee-data';
import { Skeleton } from '@/components/ui/skeleton';
import { OeeParams } from '../lib/types';

interface OeeUtilizationChartProps {
  params: OeeParams;
  lang: Locale;
}

const chartConfig = {
  utilization: {
    label: 'Utilization',
    color: 'hsl(var(--chart-1))', // Primary color from theme
  },
  target: {
    label: 'Target (85%)',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

// Helper function to get color based on utilization percentage
function getUtilizationColor(utilization: number): string {
  // Green for low utilization (0-50%), yellow-orange for medium (50-85%), red for high (85-100%)
  if (utilization <= 50) {
    // Bruss green for low utilization
    return 'hsl(142, 76%, 36%)'; // Green
  } else if (utilization <= 85) {
    // Interpolate between green and orange for medium utilization
    const ratio = (utilization - 50) / 35; // 0 to 1 from 50% to 85%
    return `hsl(${142 - ratio * 87}, 76%, 36%)`; // Transitions from green to orange
  } else {
    // Red for high utilization (above target)
    return 'hsl(0, 84%, 60%)'; // Red
  }
}

export default function OeeUtilizationChart({
  params,
  lang,
}: OeeUtilizationChartProps) {
  const { data, isLoading, error } = useOeeData(params);

  // Show loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Utilization Trend</CardTitle>
          <CardDescription>Failed to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            Unable to fetch OEE data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state when there are no data points OR all running hours are zero
  const hasNoData =
    !data.dataPoints ||
    data.dataPoints.length === 0 ||
    data.summary.totalRunningHours === 0;

  if (hasNoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Utilization Trend</CardTitle>
          <CardDescription>No data available for selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No oven processes found.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine time formatting based on mode
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    switch (params.mode) {
      case 'day':
        // Hourly view: Show time only
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'week':
      case 'month':
        // Daily view: Show date
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case 'range':
      default:
        // Auto-detect based on granularity
        const daysDiff =
          (new Date(params.to).getTime() - new Date(params.from).getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysDiff <= 2) {
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
    }
  };

  // Prepare chart data
  const chartData = data.dataPoints.map((dp) => ({
    timestamp: formatTimestamp(dp.timestamp),
    utilization: dp.utilizationPercent,
    target: 85, // Target utilization line at 85%
    activeOvens: dp.activeOvenCount,
    runningHours: Math.round(dp.runningMinutes / 60),
    availableHours: Math.round(dp.availableMinutes / 60),
    color: getUtilizationColor(dp.utilizationPercent),
  }));

  // Determine title based on mode
  const getTitle = () => {
    switch (params.mode) {
      case 'day':
        return `Utilization Trend - ${new Date(params.date).toLocaleDateString('en-US')}`;
      case 'week':
        return `Utilization Trend - Week ${params.week}, ${params.year}`;
      case 'month':
        return `Utilization Trend - ${new Date(params.year, params.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'range':
        return 'Utilization Trend';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          Percentage of total oven capacity used over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ComposedChart
            data={chartData}
            margin={{ left: 0, right: 20, top: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              interval={Math.ceil(chartData.length / 10)} // Show ~10 evenly distributed labels
            />
            <YAxis
              domain={[0, 100]}
              label={{
                value: 'Utilization (%)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
              }}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  formatter={(value, name, props) => {
                    if (name === 'utilization') {
                      return [
                        <div key="utilization" className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {props.payload.runningHours}h /{' '}
                            {props.payload.availableHours}h available
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {props.payload.activeOvens} ovens active
                          </div>
                        </div>,
                        `${value}%`,
                      ];
                    }
                    if (name === 'target') {
                      return [`${value}%`, 'Target'];
                    }
                    return [value, name];
                  }}
                />
              }
            />

            {/* Target reference line at 85% */}
            <ReferenceLine
              y={85}
              stroke={chartConfig.target.color}
              strokeDasharray="5 5"
              strokeWidth={2}
            />

            {/* Utilization area chart with dynamic colors */}
            <Area
              type="monotone"
              dataKey="utilization"
              stroke={chartConfig.utilization.color}
              fill={chartConfig.utilization.color}
              fillOpacity={0.3}
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload, index } = props;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={payload.color}
                    stroke={payload.color}
                  />
                );
              }}
              activeDot={(props: any) => {
                const { cx, cy, payload, index } = props;
                return (
                  <circle
                    key={`active-dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={payload.color}
                    stroke={payload.color}
                  />
                );
              }}
              name="utilization"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
