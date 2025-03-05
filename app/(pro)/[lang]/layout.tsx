import '@/app/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  // title: 'DMCheck (BRUSS)',
  // description: 'Company helper applications',
};

export default async function ProLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <>
      {children}
      <Toaster richColors position='top-center' />
    </>
  );
}
