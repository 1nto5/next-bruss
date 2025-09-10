'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { OvertimeSummary } from '../lib/calculate-overtime';

interface OvertimeSummaryProps {
  overtimeSummary: OvertimeSummary;
}

export default function OvertimeSummaryDisplay({
  overtimeSummary,
}: OvertimeSummaryProps) {
  return (
    <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Clock className='h-4 w-4' />
            Twoje godziny nadliczbowe w {overtimeSummary.monthLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              overtimeSummary.currentMonthHours < 0
                ? 'animate-pulse text-red-600 dark:text-red-400'
                : ''
            }`}
          >
            {overtimeSummary.currentMonthHours}h
            {overtimeSummary.pendingMonthHours !== 0 && (
              <span className='text-base font-normal'>
                {' '}
                ({overtimeSummary.pendingMonthHours}h oczekuje)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Calendar className='h-4 w-4' />
            Twoje godziny nadliczbowe łącznie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              overtimeSummary.totalHours < 0 ||
              overtimeSummary.totalHours > overtimeSummary.currentMonthHours
                ? 'animate-pulse text-red-600 dark:text-red-400'
                : ''
            }`}
          >
            {overtimeSummary.totalHours}h
            {overtimeSummary.pendingTotalHours !== 0 && (
              <span className='text-base font-normal'>
                {' '}
                ({overtimeSummary.pendingTotalHours}h oczekuje)
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
