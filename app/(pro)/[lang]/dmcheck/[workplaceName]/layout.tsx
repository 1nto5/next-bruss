import '@/app/globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
// import QueryProvider from '@/lib/query-provider';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Header from '../components/header';

export const metadata: Metadata = {
  title: 'DMCheck (BRUSS)',
  // description: 'Company helper applications',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string; workplaceName: string }>;
}) {
  const params = await props.params;

  const { lang, workplaceName } = params;
  const locale = lang as Locale;

  const { children } = props;

  const dictionary = await getDictionary(locale);
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      {/* <QueryProvider> */}
      <div className='mx-4'>
        <Header
          workplaceName={workplaceName}
          workplaceHref={`/${lang}/dmcheck/${workplaceName}`}
        />{' '}
        <main>{children}</main>
      </div>
      {/* <main className='m-2 flex flex-col items-center space-y-8'>
            {children}
          </main> */}
      {/* </QueryProvider> */}
    </ThemeProvider>
  );
}
