import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, Terminal } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  description: string;
  refetch?: () => void;
  isFetching?: boolean;
  buttonText?: string;
}

/**
 * Error alert component for production floor applications
 * Displays an error message with optional retry functionality
 * Automatically centers itself on the screen
 */
export default function ErrorAlert({
  title,
  description,
  refetch,
  isFetching,
  buttonText = 'Try again',
}: ErrorAlertProps) {
  return (
    <div className='flex items-center justify-center'>
      <Alert className='w-[550px]'>
        <Terminal className='h-4 w-4' />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className='space-y-4'>
          <div>{description}</div>
          {refetch && (
            <div className='flex justify-end'>
              <Button onClick={refetch} disabled={isFetching}>
                {isFetching ? <Loader2 className='animate-spin' /> : <RefreshCcw />}
                {buttonText}
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}