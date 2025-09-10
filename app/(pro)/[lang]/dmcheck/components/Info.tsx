import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type InfoProps = {
  title: string;
  description?: React.ReactNode;
};

export function Info({ title, description }: InfoProps) {
  return (
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
