import { Locale } from '@/i18n.config';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zamknij zlecenie (BRUSS)',
};

export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { children } = props;
  return <div className='flex justify-center'>{children}</div>;
}
