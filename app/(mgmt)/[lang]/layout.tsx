import '@/app/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { Metadata } from 'next';
import Footer from './components/footer';
import Header from './components/header';

export const metadata: Metadata = {
  title: 'Next BRUSS',
  description: 'Company helper applications',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

  const dictionary = await getDictionary(lang);
  return (
    <>
      <div className='flex min-h-screen flex-col space-y-1'>
        <Header dict={dictionary} lang={lang} />
        <main className='mx-auto max-w-7xl flex-1'>{children}</main>
        <Footer />
      </div>

      <Toaster className='mt-6' position='top-center' richColors />
    </>
  );
}

export function MgmtLayout({ children }: { children: React.ReactNode }) {
  return { children };
}
