import ProLayout from '@/app/(shop-floor)/[lang]/components/pro-layout';
import '@/app/globals.css';
import type { Locale } from '@/lib/config/i18n';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { Metadata } from 'next';
import Header from './components/header';
import { getDictionary } from './lib/dict';
import Providers from './lib/query-provider';

export const metadata: Metadata = {
  title: 'EOL136153 (BRUSS)',
};

export default async function EOL136153Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const locale = lang as Locale;
  const { children } = props;
  const dict = await getDictionary(locale);

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <Providers>
        <ProLayout header={<Header lang={locale} dict={dict} />}>
          {children}
        </ProLayout>
      </Providers>
    </ThemeProvider>
  );
}
