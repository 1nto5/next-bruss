import { Locale } from '@/i18n.config';
import { Metadata } from 'next';
// import { getDictionary } from '@/lib/dictionary';
// import Info from '../../components/Info';

export const metadata: Metadata = {
  title: 'Nowa akcja korygująca (BRUSS)',
};

export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { children } = props;
  return <div className='flex justify-center'>{children}</div>;
}
