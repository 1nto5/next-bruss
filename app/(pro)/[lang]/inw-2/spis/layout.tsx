import '@/app/globals.css';

import Footer from '@/components/footer';

import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
import Header from './components/header';
import QueryProvider from './lib/query-provider';

export const metadata: Metadata = {
  title: 'Inwentaryzacja - spis (Next BRUSS)',
  // description: 'Company helper applications',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

  // const dictionary = await getDictionary(lang);
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      // disableTransitionOnChange
    >
      <QueryProvider>
        <div className='flex min-h-screen flex-col space-y-1'>
          <Header />
          <main className='mx-auto max-w-7xl flex-1'>
            <div className='flex justify-center'>{children}</div>
          </main>
          <Footer />
        </div>
      </QueryProvider>
    </ThemeProvider>
  );
}
