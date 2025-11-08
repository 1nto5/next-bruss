'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server action errors to help with debugging
    if (error.message.includes('Failed to find Server Action')) {
      console.warn('Server Action mismatch detected. This may be due to a deployment or hot reload. Page refresh recommended.');
    }
  }, [error]);

  // Check if this is a server action mismatch error
  const isServerActionError = error.message.includes('Failed to find Server Action');

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>

      {isServerActionError ? (
        <>
          <p className="text-center text-muted-foreground max-w-md">
            The application was recently updated. Please refresh the page to load the latest version.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </>
      ) : (
        <>
          <p className="text-center text-muted-foreground max-w-md">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
