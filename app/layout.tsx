import '@/app/globals.css';
import { Locale } from '@/i18n.config';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next BRUSS',
  // description: 'Company helper applications',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head />

      <body className='min-h-screen bg-background font-sans antialiased'>
        {children}
      </body>
    </html>
  );
}
