import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Terminal } from 'lucide-react';

interface ErrorAlertProps {
  refetch: () => void;
  isFetching: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ refetch, isFetching }) => {
  return (
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>Coś poszło nie tak!</AlertTitle>
      <AlertDescription className='mt-8 flex justify-end'>
        <Button onClick={refetch} disabled={isFetching}>
          {isFetching ? (
            <span className='flex items-center'>
              <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
              Ładowanie danych
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
};

export default ErrorAlert;
