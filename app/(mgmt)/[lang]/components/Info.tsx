import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

type InfoProps = {
  title: string;
  description?: React.ReactNode; // Change the type to React.ReactNode
};

export default function Info({ title, description }: InfoProps) {
  return (
    <Alert className='w-[450px]'>
      <Terminal className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
