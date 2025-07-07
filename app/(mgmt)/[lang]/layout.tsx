import '@/app/globals.css';
import Footer from '@/components/footer';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { Metadata } from 'next';
import Header from './components/header';

export const metadata: Metadata = {
  title: 'BRUSS',
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
        {/* <main className='mx-auto max-w-7xl flex-1'>
          <div className='max-w-[100vw]'>{children}</div>
        </main> */}
        <main className='mx-auto w-full max-w-7xl flex-1'>
          <div className='w-full'>{children}</div>
        </main>
        <Footer />
      </div>
    </>
  );
}
