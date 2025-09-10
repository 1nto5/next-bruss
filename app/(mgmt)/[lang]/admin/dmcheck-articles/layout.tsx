import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCheck article configs management (Next BRUSS)',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
