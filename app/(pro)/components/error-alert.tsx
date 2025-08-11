import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProButton } from '@/app/(pro)/components/ui/pro-button';
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
  buttonText = 'Spróbuj ponownie'
}: ErrorAlertProps) {
  return (
    <div className='flex items-center justify-center'>
      <Alert className='w-[600px] p-8 border-2'>
        <Terminal className='h-6 w-6' />
        <AlertTitle className='text-xl'>{title}</AlertTitle>
        <AlertDescription className='mt-6 text-base'>
          {description}
          {refetch && (
            <div className='mt-6 flex justify-end'>
              <ProButton onClick={refetch} disabled={isFetching} proSize='lg'>
                {isFetching ? <Loader2 className='animate-spin' /> : <RefreshCcw />}
                {buttonText}
              </ProButton>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}