import ProLayout from '@/app/(pro)/[lang]/components/pro-layout';
import '@/app/globals.css';
import type { Locale } from '@/i18n.config';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
import Header from './components/header';
import { getDictionary } from './lib/dictionary';
import Providers from './lib/query-provider';

export const metadata: Metadata = {
  title: 'DMCheck 2 (BRUSS)',
};

export default async function DmCheck2Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const { children } = props;
  const dict = await getDictionary(lang);

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <Providers>
        <ProLayout header={<Header lang={lang} dict={dict} />}>
          {children}
        </ProLayout>
      </Providers>
    </ThemeProvider>
  );
}
