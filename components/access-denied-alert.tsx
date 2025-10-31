import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AccessDeniedAlertProps {
  lang: string;
}

const messages = {
  pl: {
    title: 'Dostęp zablokowany',
    description: 'Aplikacja w fazie testów',
  },
  de: {
    title: 'Zugriff gesperrt',
    description: 'Anwendung in der Testphase',
  },
  en: {
    title: 'Access blocked',
    description: 'Application in testing phase',
  },
};

export default function AccessDeniedAlert({ lang }: AccessDeniedAlertProps) {
  const message = messages[lang as keyof typeof messages] || messages.en;

  return (
    <div className='flex items-center justify-center'>
      <Alert variant='destructive' className='w-[550px]'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>{message.title}</AlertTitle>
        <AlertDescription className='space-y-4'>
          {message.description}
        </AlertDescription>
      </Alert>
    </div>
  );
}
