'use client';

import ErrorComponent from '@/components/error-component';
import { revalidateOvertimeOrders as revalidate } from '../overtime-orders/actions';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} revalidate={revalidate} />;
}
