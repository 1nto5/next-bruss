// import { auth } from '@/auth';
import { Metadata } from 'next';
// import { getDictionary } from '@/lib/dictionary';
// import { redirect } from 'next/navigation';
// import Info from '../../../../components/Info';

export const metadata: Metadata = {
  title: 'Add many employee (Next BRUSS)',
};

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;

  return <>{children}</>;
}
