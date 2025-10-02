'use client';

import { ForecastPeriodData, ForecastSummary } from '../lib/types';
import ForecastChart from './forecast-chart';
import ForecastSummaryCards from './forecast-summary-cards';

interface ForecastChartsProps {
  data: ForecastPeriodData[];
  summary: ForecastSummary;
}

export default function ForecastCharts({
  data,
  summary,
}: ForecastChartsProps) {
  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <ForecastSummaryCards summary={summary} />

      {/* Main Charts */}
      <div className='grid gap-6'>
        <ForecastChart data={data} />
      </div>
    </div>
  );
}
