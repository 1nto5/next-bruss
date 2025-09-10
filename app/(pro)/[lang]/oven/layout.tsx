import ProLayout from '@/app/(pro)/[lang]/components/pro-layout';
import '@/app/globals.css';
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
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;

  const { lang } = params;
  const locale = lang as Locale;

  const { children } = props;

  const dict = await getDictionary(locale);
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      // disableTransitionOnChange
    >
      <QueryProvider>
        <ProLayout header={<Header dict={dict} lang={locale} />}>
          {children}
        </ProLayout>
      </QueryProvider>
    </ThemeProvider>
  );
}
