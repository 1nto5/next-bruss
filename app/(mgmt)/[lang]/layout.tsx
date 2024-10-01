import '@/app/globals.css';
import { auth } from '@/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { Metadata } from 'next';
import Footer from './components/footer';
import Header from './components/header';

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
          <div className='flex min-h-screen flex-col'>
            <Header session={session} dict={dictionary} lang={lang} />
            <main className='flex-1'>{children}</main>
            <Footer />
          </div>

          {/* <Footer /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
