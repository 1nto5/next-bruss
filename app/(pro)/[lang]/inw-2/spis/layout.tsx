import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Metadata } from 'next';
// import QueryProvider from '@/lib/query-provider';
import Container from '@/components/ui/container';
import { Toaster } from '@/components/ui/sonner';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Header from './components/Header';

export const metadata: Metadata = {
  title: 'Logowanie (Next BRUSS)',
  // description: 'Company helper applications',
};

export default async function RootLayout({
  children,
  params: { lang, workplaceName },
}: {
  children: React.ReactNode;
  params: { lang: Locale; workplaceName: string };
}) {
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
          <Header emp='emp' />
          <Container>
            <main className='flex justify-center'>
              <>{children}</>
            </main>
          </Container>
          {/* <main className='m-2 flex flex-col items-center space-y-8'>
            {children}
          </main> */}
          <Toaster richColors />
          {/* </QueryProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
