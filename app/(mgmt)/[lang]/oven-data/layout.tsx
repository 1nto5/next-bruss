import { Metadata } from 'next';
import { OvenDataProviders } from './lib/providers';

export const metadata: Metadata = {
  title: 'Oven Data (BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OvenDataProviders>
      {children}
    </OvenDataProviders>
  );
}
