import '@/app/globals.css';
import Container from '@/components/ui/container';
import Footer from '@/components/ui/footer';
import FormContainer from '@/components/ui/form-container';
import { Toaster } from '@/components/ui/sonner';
import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { ThemeProvider } from '@/lib/theme-provider';
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
  // const dictionary = await getDictionary(lang);
  return (
    <html lang={lang} suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          // disableTransitionOnChange
        >
          <QueryProvider>
            <Container>
              <div className='flex min-h-screen flex-col'>
                <Header />
                <main className='flex-1'>
                  <FormContainer>{children}</FormContainer>
                </main>
                <Footer />
              </div>
            </Container>
          </QueryProvider>
          <Toaster richColors position='top-center' />
        </ThemeProvider>
      </body>
    </html>
  );
}
