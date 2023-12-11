import '../globals.css';
import { AuthProvider } from '../auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '../(users)/components/Header';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'Next BRUSS',
  description: 'Company helper applications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className='flex justify-center'>{children}</main>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
