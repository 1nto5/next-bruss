import '../globals.css';
import { AuthProvider } from '../auth-provider';
import { Inter } from 'next/font/google';
import DarkLightProvider from '../theme-provider';

const inter = Inter({ subsets: ['latin'] });

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
      <body
        className={`${inter.className} bg-slate-50 antialiased dark:bg-slate-950`}
      >
        <AuthProvider>
          <DarkLightProvider>{children}</DarkLightProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
