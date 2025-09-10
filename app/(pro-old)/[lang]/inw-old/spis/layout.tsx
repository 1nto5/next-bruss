import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory (Next BRUSS)',
  //   description: 'Company helper applications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
