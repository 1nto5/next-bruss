'use client';

import { ForecastPeriodData, ForecastSummary } from '../lib/types';
import ForecastChart from './forecast-chart';
import ForecastSummaryCards from './forecast-summary-cards';

interface ForecastChartsProps {
  data: ForecastPeriodData[];
  summary: ForecastSummary;
  hourlyRate: number;
}

export default function ForecastCharts({
  data,
  summary,
  hourlyRate,
}: ForecastChartsProps) {
  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <ForecastSummaryCards summary={summary} hourlyRate={hourlyRate} />

      {/* Main Charts */}
      <div className='grid gap-6'>
        <ForecastChart data={data} />
      </div>
    </div>
  );
}
