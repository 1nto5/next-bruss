'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Alert className='max-w-md'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Coś poszło nie tak!</AlertTitle>
        <AlertDescription className='mt-4'>
          <p className='mb-4 text-sm'>
            {error.message || 'Wystąpił nieoczekiwany błąd.'}
          </p>
          <div className='flex justify-end'>
            <Button onClick={reset} variant='outline'>
              <RefreshCcw className='mr-2 h-4 w-4' />
              Spróbuj ponownie
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}