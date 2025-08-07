import '@/app/globals.css';
import Footer from '@/components/footer';
import type { Locale } from '@/i18n.config';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
import Header from './components/header';
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

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <Providers>
        <div className='flex min-h-screen flex-col'>
          <Header lang={lang} />
          <main className='w-full flex-1 px-2 py-2'>
            <div className='w-full'>{children}</div>
          </main>
          <Footer />
        </div>
      </Providers>
    </ThemeProvider>
  );
}
