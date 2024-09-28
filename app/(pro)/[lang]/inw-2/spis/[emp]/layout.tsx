import Container from '@/components/ui/container';
import { redirect } from 'next/navigation';
import Header from '../components/header';

export const metadata = {
  title: 'Wybór karty (Next BRUSS)',
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
