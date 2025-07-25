'use client';

import { Locale } from '@/i18n.config';
import { useState } from 'react';
import { OvenProcessDataType } from '../lib/types';
import { ovenColumns } from '../table/columns';
import { OvenDataTable } from '../table/data-table';
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
      <OvenTemperatureChart
        searchParams={searchParams}
        selectedProcess={selectedProcess}
        lang={lang}
      />
    </div>
  );
}
