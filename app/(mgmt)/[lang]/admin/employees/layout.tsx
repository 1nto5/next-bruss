import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employees management (BRUSS)',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
