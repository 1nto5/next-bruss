import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function AccessDeniedAlert() {
  return (
    <div className='flex items-center justify-center'>
      <Alert variant='destructive' className='w-[550px]'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Dostęp zablokowany</AlertTitle>
        <AlertDescription className='space-y-4'>
          Tylko pracownicy z rolą tester mają dostęp do tej aplikacji.
        </AlertDescription>
      </Alert>
    </div>
  );
}
