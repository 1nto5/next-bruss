import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const metadata = {
  title: 'CAPA history (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
