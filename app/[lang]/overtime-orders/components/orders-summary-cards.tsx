'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign } from 'lucide-react';
import { OrdersSummary } from '../lib/calculate-summary';

interface OrdersSummaryCardsProps {
  summary: OrdersSummary;
  dict: {
    summary: {
      totalHours: string;
      totalCost: string;
    };
  };
}

export default function OrdersSummaryCards({
  summary,
  dict,
}: OrdersSummaryCardsProps) {
  return (
    <div className='mb-4 flex flex-col gap-2 sm:grid sm:grid-cols-2'>
      {/* Total Hours Card */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Clock className='h-4 w-4' />
            {dict.summary.totalHours}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {summary.totalHours.toFixed(1)}h
          </div>
        </CardContent>
      </Card>

      {/* Total Cost Card */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <DollarSign className='h-4 w-4' />
            {dict.summary.totalCost}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {summary.totalCost.toLocaleString('pl-PL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            PLN
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
