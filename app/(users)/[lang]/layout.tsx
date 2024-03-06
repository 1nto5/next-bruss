import { Metadata } from 'next';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
// import QueryProvider from '@/lib/query-provider';
import { Locale } from '@/i18n.config';
import Header from './components/Header';
import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/auth';
import { getDictionary } from '@/lib/dictionary';

export const metadata: Metadata = {
  title: 'Next BRUSS',
  description: 'Company helper applications',
};

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const session = await auth();
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
          <Header session={session} dict={dictionary} lang={lang} />
          {children}
          <Toaster richColors position='top-right' />
          {/* </QueryProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
