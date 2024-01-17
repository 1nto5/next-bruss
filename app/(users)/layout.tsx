import { Metadata } from 'next';
import '../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '../(users)/components/Header';
import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Next BRUSS',
  description: 'Company helper applications',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header session={session} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
