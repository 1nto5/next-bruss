import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Home() {
  const emailSubject = 'Next BRUSS: zgłoszenie błędu';
  return (
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>Cześć!</AlertTitle>
      <AlertDescription>
        Strona oraz aplikacje są w trakcie budowy. Proszę o zgłaszanie
        napotkanych błędów na{' '}
        <a
          href={`mailto:support@bruss-group.com?subject=${emailSubject}`}
          className='text-blue-600 hover:text-blue-800'
        >
          support@bruss-group.com
        </a>
        .
      </AlertDescription>
    </Alert>
  );
}
