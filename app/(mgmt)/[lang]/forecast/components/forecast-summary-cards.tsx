'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, DollarSign, Building2 } from 'lucide-react';
import { ForecastSummary } from '../lib/types';

interface ForecastSummaryCardsProps {
  summary: ForecastSummary;
}

export default function ForecastSummaryCards({
  summary,
}: ForecastSummaryCardsProps) {
  const totalCost = summary.totalForecastCost + summary.totalHistoricalCost;
  const totalHours = summary.totalForecastHours + summary.totalHistoricalHours;
  const averageRate = totalHours > 0 ? totalCost / totalHours : 0;

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
              {summary.totalHistoricalCost.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              PLN
            </div>
            <p className='text-muted-foreground text-xs'>
              {summary.totalHistoricalHours > 0
                ? (summary.totalHistoricalCost / summary.totalHistoricalHours).toFixed(2)
                : '0.00'}{' '}
              PLN/h średnio
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
              {summary.totalForecastCost.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              PLN
            </div>
            <p className='text-muted-foreground text-xs'>
              {summary.totalForecastHours > 0
                ? (summary.totalForecastCost / summary.totalForecastHours).toFixed(2)
                : '0.00'}{' '}
              PLN/h średnio
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
              {totalCost.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              PLN
            </div>
            <p className='text-muted-foreground text-xs'>
              Wszystkie godziny • {averageRate.toFixed(2)} PLN/h średnio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Department Breakdown */}
      {summary.departmentTotals.length > 0 && (
        <div>
          <h3 className='mb-4 text-lg font-semibold'>Podział według działów</h3>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {summary.departmentTotals.map((dept) => {
              const deptTotalHours = dept.forecastHours + dept.historicalHours;
              const deptTotalCost = dept.forecastCost + dept.historicalCost;
              
              return (
                <Card key={dept.departmentId}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {dept.departmentName}
                    </CardTitle>
                    <Building2 className='text-muted-foreground h-4 w-4' />
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Godziny:</span>
                        <span className='font-medium'>{deptTotalHours.toFixed(1)}h</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Koszt:</span>
                        <span className='font-medium'>
                          {deptTotalCost.toLocaleString('pl-PL', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          PLN
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Stawka:</span>
                        <span className='font-medium'>{dept.hourlyRate.toFixed(2)} PLN/h</span>
                      </div>
                      <div className='pt-1 text-xs text-muted-foreground'>
                        Forecast: {dept.forecastHours.toFixed(1)}h • Wykonane: {dept.historicalHours.toFixed(1)}h
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
