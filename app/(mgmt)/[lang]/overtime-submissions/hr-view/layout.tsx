import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zgłoszenia nadgodzin - HR (BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
