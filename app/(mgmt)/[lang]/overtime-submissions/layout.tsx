import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zgłoszenia nadgodzin (BRUSS)',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
