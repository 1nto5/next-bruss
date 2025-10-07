'use client';

import { Locale } from '@/lib/config/i18n';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { OvenProcessDataType } from '../lib/types';
import { ovenColumns } from '../table/columns';
import { OvenDataTable } from '../table/data-table';
import ChartErrorState from './chart-error-state';
import OvenTemperatureChart from './temperature-chart';

interface OvenDataWithChartProps {
  data: OvenProcessDataType[];
  ovens: string[];
  fetchTime: Date;
  fetchTimeLocaleString: string;
  lang: Locale;
  searchParams: { [key: string]: string | undefined };
}

export default function OvenDataWithChart({
  data,
  ovens,
  fetchTime,
  fetchTimeLocaleString,
  lang,
  searchParams,
}: OvenDataWithChartProps) {
  const [selectedProcess, setSelectedProcess] =
    useState<OvenProcessDataType | null>(null);

  return (
    <div>
      <OvenDataTable
        columns={ovenColumns}
        data={data}
        ovens={ovens}
        fetchTime={fetchTime}
        fetchTimeLocaleString={fetchTimeLocaleString}
        lang={lang}
        onProcessSelect={setSelectedProcess}
      />
      {/* ErrorBoundary for graceful error handling */}
      <ErrorBoundary
        FallbackComponent={ChartErrorState}
        onReset={() => setSelectedProcess(null)}
        resetKeys={[selectedProcess?.id]}
      >
        <OvenTemperatureChart
          selectedProcess={selectedProcess}
          lang={lang}
        />
      </ErrorBoundary>
    </div>
  );
}
