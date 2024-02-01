import { Metadata } from 'next';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
// import QueryProvider from '@/lib/query-provider';
import Header from '../components/Header';
import { Toaster } from '@/components/ui/sonner';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';

export const metadata: Metadata = {
  title: 'Next BRUSS',
  description: 'Company helper applications',
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
          <Header dict={dictionary} workplaceName={workplaceName} />
          <main className='m-2 flex justify-center'>{children}</main>
          <Toaster />
          {/* </QueryProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
