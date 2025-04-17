'use client';

import ErrorComponent from '@/components/error-component';
import { revalidateDeviations as revalidate } from '../actions';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} revalidate={revalidate} />;
}
