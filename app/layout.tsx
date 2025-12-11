import '@/app/globals.css';
import { i18n } from '@/lib/config/i18n';
import { isChristmasMode } from '@/lib/config/christmas';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { ChristmasProvider } from '@/components/christmas';
import { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { Inter, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

// Industrial Premium Typography
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BRUSS',
  description: 'Industrial Management System',
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html
      lang={i18n.defaultLocale}
      suppressHydrationWarning
      className={`${inter.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable}${isChristmasMode ? ' christmas' : ''}`}
    >
      <head />

      <body className='bg-background min-h-screen font-sans antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          // disableTransitionOnChange
        >
          {isChristmasMode && <ChristmasProvider />}
          {children}
          <Toaster position='bottom-center' richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
