import '@/app/globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
// import QueryProvider from '@/lib/query-provider';
import Container from '@/components/ui/container';
import { Toaster } from '@/components/ui/sonner';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Header from '../components/header';

export const metadata: Metadata = {
  title: 'DMCheck (Next BRUSS)',
  description: 'Company helper applications',
};

export default async function RootLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ lang: Locale; workplaceName: string }>;
  }
) {
  const params = await props.params;

  const {
    lang,
    workplaceName
  } = params;

  const {
    children
  } = props;

  const dictionary = await getDictionary(lang);
  return (
    <html lang={lang} suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {/* <QueryProvider> */}
          <Header
            dict={dictionary}
            workplaceName={workplaceName}
            workplaceHref={`/${lang}/dmcheck/${workplaceName}`}
          />
          <Container>
            <main>
              <>{children}</>
            </main>
          </Container>
          {/* <main className='m-2 flex flex-col items-center space-y-8'>
            {children}
          </main> */}
          <Toaster richColors position='bottom-center' />
          {/* </QueryProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
