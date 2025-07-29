'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { ForecastSummary } from '../lib/types';

interface ForecastSummaryCardsProps {
  summary: ForecastSummary;
  hourlyRate: number;
}

export default function ForecastSummaryCards({
  summary,
  hourlyRate,
}: ForecastSummaryCardsProps) {
  return (
    <div className='space-y-4'>
      {/* First Row - Individual Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Hours Worked */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Przepracowane godziny
            </CardTitle>
            <Clock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {summary.totalHistoricalHours.toFixed(1)}h
            </div>
            <p className='text-muted-foreground text-xs'>
              {summary.totalHistoricalCount} zleceń wykonanych
            </p>
          </CardContent>
        </Card>

        {/* Cost of Hours Worked */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Koszt przepracowanych godzin
            </CardTitle>
            <DollarSign className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {(summary.totalHistoricalHours * hourlyRate).toLocaleString(
                'pl-PL',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}{' '}
              PLN
            </div>
            <p className='text-muted-foreground text-xs'>
              {hourlyRate.toFixed(2)} PLN/h
            </p>
          </CardContent>
        </Card>

        {/* Forecast Hours */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Godziny Forecast
            </CardTitle>
            <Clock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-500'>
              {summary.totalForecastHours.toFixed(1)}h
            </div>
            <p className='text-muted-foreground text-xs'>
              {summary.totalForecastCount} zleceń
            </p>
          </CardContent>
        </Card>

        {/* Cost of Forecast Hours */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Koszt godzin Forecast
            </CardTitle>
            <DollarSign className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-500'>
              {(summary.totalForecastHours * hourlyRate).toLocaleString(
                'pl-PL',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}{' '}
              PLN
            </div>
            <p className='text-muted-foreground text-xs'>
              {hourlyRate.toFixed(2)} PLN/h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Period and Total Cost */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Okres</CardTitle>
            <Calendar className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary.filterType === 'week'
                ? `W${summary.startValue}-${summary.endValue}`
                : summary.filterType === 'month'
                  ? `M${summary.startValue}-${summary.endValue}`
                  : `${summary.startValue}-${summary.endValue}`}
            </div>
            <p className='text-muted-foreground text-xs'>
              {summary.filterType === 'week'
                ? `Tygodnie w ${summary.year}`
                : summary.filterType === 'month'
                  ? `Miesiące w ${summary.year}`
                  : 'Lata'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Koszt łączny</CardTitle>
            <DollarSign className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {(
                (summary.totalForecastHours + summary.totalHistoricalHours) *
                hourlyRate
              ).toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              PLN
            </div>
            <p className='text-muted-foreground text-xs'>
              Wszystkie godziny • {hourlyRate.toFixed(2)} PLN/h
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
