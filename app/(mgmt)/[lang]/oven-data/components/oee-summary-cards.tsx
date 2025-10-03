'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, CalendarClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOeeData } from '../hooks/use-oee-data';

type OeeParams =
  | { mode: 'day'; date: string }
  | { mode: 'week'; year: number; week: number }
  | { mode: 'month'; year: number; month: number }
  | {
      mode: 'range';
      from: string;
      to: string;
      granularity?: 'hour' | 'day';
    };

interface OeeSummaryCardsProps {
  params: OeeParams;
}

export default function OeeSummaryCards({ params }: OeeSummaryCardsProps) {
  const { data, isLoading, error } = useOeeData(params);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="mt-2 h-3 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load OEE summary data
      </div>
    );
  }

  // Check if there's no data for the selected period
  // Consider "no data" when either: no data points exist OR all running minutes are zero
  const hasNoData =
    !data.dataPoints ||
    data.dataPoints.length === 0 ||
    data.summary.totalRunningHours === 0;

  if (hasNoData) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardContent className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground">
              No oven processes found for the selected period.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Overall Utilization */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Overall Utilization
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.overallUtilization}%
          </div>
          <p className="text-xs text-muted-foreground">
            Average across all ovens
          </p>
        </CardContent>
      </Card>

      {/* Total Running Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Running Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.totalRunningHours.toLocaleString()}h
          </div>
          <p className="text-xs text-muted-foreground">
            Actual production time
          </p>
        </CardContent>
      </Card>

      {/* Available Capacity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Available Capacity
          </CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.totalAvailableHours.toLocaleString()}h
          </div>
          <p className="text-xs text-muted-foreground">
            Total oven capacity for period
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
