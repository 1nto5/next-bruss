import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, Terminal } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  description: string;
  refetch?: () => void;
  isFetching?: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  title, 
  description, 
  refetch, 
  isFetching 
}) => {
  return (
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className='mt-4'>
        {description}
        {refetch && (
          <div className='mt-4 flex justify-end'>
            <Button onClick={refetch} disabled={isFetching}>
              {isFetching ? <Loader2 className='animate-spin' /> : <RefreshCcw />}
              Spróbuj ponownie
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;