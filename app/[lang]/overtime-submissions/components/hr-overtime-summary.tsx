'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Dictionary } from '../lib/dict';
import { OvertimeSubmissionType } from '../lib/types';

interface HROvertimeSummaryProps {
  submissions: OvertimeSubmissionType[];
  dict: Dictionary;
}

export default function HROvertimeSummaryDisplay({
  submissions = [],
  dict,
}: HROvertimeSummaryProps) {
  // Calculate totals from filtered submissions
  const totalHours = submissions.reduce((sum, s) => sum + (s.hours || 0), 0);
  const totalCount = submissions.length;

  // Calculate approved hours (status: approved)
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const approvedHours = approvedSubmissions.reduce((sum, s) => sum + (s.hours || 0), 0);
  const approvedCount = approvedSubmissions.length;

  // Calculate pending hours (status: pending or pending-plant-manager)
  const pendingSubmissions = submissions.filter(
    s => s.status === 'pending' || s.status === 'pending-plant-manager'
  );
  const pendingHours = pendingSubmissions.reduce((sum, s) => sum + (s.hours || 0), 0);

  return (
    <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Clock className='h-4 w-4' />
            {dict.summary.filteredResults}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {totalHours}h
            {pendingHours !== 0 && (
              <span className='text-base font-normal'>
                {' '}
                ({pendingHours}h {dict.summary.pending})
              </span>
            )}
          </div>
          <div className='text-sm text-muted-foreground'>
            {totalCount} {dict.submissions}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Clock className='h-4 w-4' />
            {dict.summary.approvedToSettle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              approvedHours > 0
                ? 'text-green-600 dark:text-green-400'
                : ''
            }`}
          >
            {approvedHours}h
          </div>
          <div className='text-sm text-muted-foreground'>
            {approvedCount} {dict.submissions}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
