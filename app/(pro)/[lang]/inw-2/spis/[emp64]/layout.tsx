import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Wybór karty (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
