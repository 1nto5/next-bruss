import '@/app/globals.css';
import ProLayout from '@/app/(pro)/components/pro-layout';
import type { Locale } from '@/i18n.config';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
import Header from './components/header';
import { getDictionary } from './lib/dictionary';

export const metadata: Metadata = {
  title: 'EOL136153 | DMC System',
};

export default async function EOL136153Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const { children } = props;
  const dict = await getDictionary(lang);

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <ProLayout header={<Header lang={lang} dict={dict} />}>
        {children}
      </ProLayout>
    </ThemeProvider>
  );
}