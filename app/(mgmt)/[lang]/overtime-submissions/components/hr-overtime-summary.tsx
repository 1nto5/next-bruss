'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { HROvertimeSummary } from '../lib/calculate-overtime';

interface HROvertimeSummaryProps {
  hrOvertimeSummary: HROvertimeSummary;
}

export default function HROvertimeSummaryDisplay({
  hrOvertimeSummary,
}: HROvertimeSummaryProps) {
  return (
    <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Clock className='h-4 w-4' />
            Nadgodziny organizacji w {hrOvertimeSummary.monthLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {hrOvertimeSummary.currentMonthHours}h
            {hrOvertimeSummary.pendingCurrentMonthHours !== 0 && (
              <span className='text-base font-normal'>
                {' '}
                ({hrOvertimeSummary.pendingCurrentMonthHours}h oczekuje)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <AlertTriangle className='h-4 w-4' />
            Zaległe nadgodziny do rozliczenia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              hrOvertimeSummary.overdueHours > 0
                ? 'animate-pulse text-red-600 dark:text-red-400'
                : ''
            }`}
          >
            {hrOvertimeSummary.overdueHours}h
            {hrOvertimeSummary.pendingOverdueHours !== 0 && (
              <span className='text-base font-normal'>
                {' '}
                ({hrOvertimeSummary.pendingOverdueHours}h oczekuje)
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
