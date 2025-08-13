import '@/app/globals.css';
import ProLayout from '@/app/(pro)/components/pro-layout';
import { Locale } from '@/i18n.config';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
import Header from './components/header';
import { getDictionary } from './lib/dictionary';
import QueryProvider from './lib/query-provider';

export const metadata: Metadata = {
  title: 'Oven (BRUSS)',
  // description: 'Company helper applications',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

  const dict = await getDictionary(lang);
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      // disableTransitionOnChange
    >
      <QueryProvider>
        <ProLayout header={<Header dict={dict} lang={lang} />}>
          {children}
        </ProLayout>
      </QueryProvider>
    </ThemeProvider>
  );
}
