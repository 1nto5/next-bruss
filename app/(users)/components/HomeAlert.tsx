import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Container from '@/components/ui/container';

export default function Home() {
  const emailSubject = 'Next BRUSS: zgłoszenie błędu';
  return (
    <Container>
      <Alert>
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
        </AlertDescription>
      </Alert>
    </Container>
  );
}
