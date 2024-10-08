'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

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
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>Coś poszło nie tak!</AlertTitle>
      <AlertDescription className='mt-8 flex justify-end'>
        <Button onClick={reload} disabled={isPending}>
          {isPending ? (
            <span className='flex items-center'>
              <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
              Ładowanie
            </span>
          ) : (
            <span className='flex items-center'>
              <RefreshCcw className='mr-2 h-4 w-4' />
              Spróbuj ponownie
            </span>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
