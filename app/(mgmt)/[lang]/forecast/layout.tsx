import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forecast nadgodzin - produkcja (BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
