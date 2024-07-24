'use client';

import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { revalidateDeviations } from './actions';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const reload = () => {
    setIsLoading(true);
    startTransition(() => {
      revalidateDeviations();
      router.refresh();
      reset();
      setIsLoading(false);
    });
  };

  return (
    <main className='mt-24 flex justify-center'>
      <Alert className='w-[450px]'>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription className='mt-8 flex justify-end'>
          <Button onClick={reload} disabled={isLoading}>
            {isLoading ? (
              <span className='flex items-center'>
                <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
                Loading
              </span>
            ) : (
              <span className='flex items-center'>
                <RefreshCcw className='mr-2 h-4 w-4' />
                Try again
              </span>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}
