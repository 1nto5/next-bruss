import { Metadata } from 'next';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
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

      <body className='min-h-screen bg-background font-sans antialiased '>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          // disableTransitionOnChange
        >
          <Header session={session} dict={dictionary} lang={lang} />
          {children}
          <Toaster richColors position='top-right' />

          {/* <Footer /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
