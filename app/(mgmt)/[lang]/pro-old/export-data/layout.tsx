import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'export data (BRUSS)',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return { children };
}
