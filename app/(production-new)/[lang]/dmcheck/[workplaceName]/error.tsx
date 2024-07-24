'use client';

import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className='flex h-screen items-center justify-center'>
          <Alert className='w-[450px]'>
            <Terminal className='h-4 w-4' />
            <AlertTitle>Something went wrong!</AlertTitle>
            <AlertDescription className='flex justify-end'>
              <Button className='ml-auto' onClick={() => reset()}>
                <RefreshCcw className='mr-2 h-4 w-4' /> Try again
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </body>
    </html>
  );
}
