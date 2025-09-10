import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Awarie LV (BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
