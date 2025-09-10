// import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { Metadata } from 'next';
// import { getDictionary } from '@/lib/dictionary';
// import { redirect } from 'next/navigation';
// import Info from '../../../../components/Info';

export const metadata: Metadata = {
  title: 'Add article config (Next BRUSS)',
};

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;

  return <div className='flex justify-center'>{children}</div>;
}
