'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { HROvertimeSummary } from '../lib/calculate-overtime';
import { Dictionary } from '../lib/dict';

interface HROvertimeSummaryProps {
  hrOvertimeSummary: HROvertimeSummary;
  dict: Dictionary;
}

export default function HROvertimeSummaryDisplay({
  hrOvertimeSummary,
  dict,
}: HROvertimeSummaryProps) {
  return (
    <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Clock className='h-4 w-4' />
            {dict.summary.organizationOvertimeIn} {hrOvertimeSummary.monthLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {hrOvertimeSummary.currentMonthHours}h
            {hrOvertimeSummary.pendingCurrentMonthHours !== 0 && (
              <span className='text-base font-normal'>
                {' '}
                ({hrOvertimeSummary.pendingCurrentMonthHours}h {dict.summary.pending})
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <AlertTriangle className='h-4 w-4' />
            {dict.summary.overdueOvertimeToSettle}
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
                ({hrOvertimeSummary.pendingOverdueHours}h {dict.summary.pending})
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
