import { Toaster } from '@/components/ui/sonner';
import Providers from './lib/query-provider';

export default function DmCheck2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className='container mx-auto flex min-h-screen flex-col items-center justify-center p-4'>
        {children}
      </main>
      <Toaster position='top-center' />
    </Providers>
  );
}