import Container from '@/components/ui/container';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Edycja pozycji (Next BRUSS)',
};

export default async function Layout({
  children,
  params: { emp },
}: {
  children: React.ReactNode;
  params: { emp: string };
}) {
  return <>{children}</>;
}
