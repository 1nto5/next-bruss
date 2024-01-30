import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NoAvailable() {
  return (
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>Function not available!</AlertTitle>
      <AlertDescription>
        Function not available yet or not available in your language.
      </AlertDescription>
    </Alert>
  );
}
