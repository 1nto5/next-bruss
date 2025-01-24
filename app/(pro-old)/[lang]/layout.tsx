import '@/app/globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import Footer from './components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Footer />
    </ThemeProvider>
  );
}
