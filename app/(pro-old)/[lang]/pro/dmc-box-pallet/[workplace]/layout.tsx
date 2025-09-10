import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'dmc-box-pallet (Next BRUSS)',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
