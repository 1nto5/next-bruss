import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NoDict() {
  return (
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>Function not available!</AlertTitle>
      <AlertDescription>
        Function not available for your language.
      </AlertDescription>
    </Alert>
  );
}
