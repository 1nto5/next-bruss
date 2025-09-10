import '@/app/globals.css';
import { i18n } from '@/i18n.config';
import { ThemeProvider } from '@/lib/theme-provider';
import { Metadata } from 'next';
// import { Toaster } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'BRUSS',
  // description: 'Company helper applications',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;

  return (
    <html lang={i18n.defaultLocale} suppressHydrationWarning>
      <head />

      <body className='bg-background min-h-screen font-sans antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          // disableTransitionOnChange
        >
          {children}
          <Toaster position='bottom-center' richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
