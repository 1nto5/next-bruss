import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Container from '@/components/ui/container';
import { Toaster } from '@/components/ui/sonner';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { Metadata } from 'next';
import Header from './components/header';
import QueryProvider from './lib/query-provider';

export const metadata: Metadata = {
  title: 'Logowanie (Next BRUSS)',
  // description: 'Company helper applications',
};

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
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
          <QueryProvider>
            <Header />
            <Container>
              <main className='flex justify-center'>
                <>{children}</>
              </main>
            </Container>
          </QueryProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
