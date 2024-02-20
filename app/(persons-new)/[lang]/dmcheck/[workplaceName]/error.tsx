'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <Alert className='w-[450px]'>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription className='text-right'>
          <Button
            variant='destructive'
            className='mt-4'
            onClick={() => reset()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </>
  );
}
