import '../globals.css';
import Footer from './components/Footer';
import DarkLightProvider from '../theme-provider';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Next BRUSS',
//   description: 'Company helper applications',
// };

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
        <DarkLightProvider>
          {children}
          <Footer />
        </DarkLightProvider>
      </body>
    </html>
  );
}
