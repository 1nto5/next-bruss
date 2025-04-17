'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface ErrorComponentProps {
  error: Error;
  reset: () => void;
  revalidate?: () => Promise<void>;
}

export default function ErrorComponent({
  error,
  reset,
  revalidate,
}: ErrorComponentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const reload = () => {
    startTransition(() => {
      if (revalidate) {
        void revalidate();
      }
      router.refresh();
      reset();
    });
  };

  return (
    <Alert className='mt-24 w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>Something went wrong!</AlertTitle>
      <AlertDescription className='space-y-4'>
        <div>{error.message}</div>
        <div className='flex justify-end'>
          <Button onClick={reload} disabled={isPending}>
            {isPending ? (
              <span className='flex items-center'>
                <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
                Try again
              </span>
            ) : (
              <span className='flex items-center'>
                <RefreshCcw className='mr-2 h-4 w-4' />
                Try again
              </span>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
