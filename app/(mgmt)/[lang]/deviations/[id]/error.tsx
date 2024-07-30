'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
// import { revalidateReasons as revalidate } from './actions';

export default function Error({
  // error,
  reset,
}: {
  // error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const reload = () => {
    startTransition(() => {
      // revalidate();
      router.refresh();
      reset();
    });
  };

  return (
    <main className='mt-24 flex justify-center'>
      <Alert className='w-[450px]'>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription className='mt-8 flex justify-end'>
          <Button onClick={reload} disabled={isPending}>
            {isPending ? (
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
