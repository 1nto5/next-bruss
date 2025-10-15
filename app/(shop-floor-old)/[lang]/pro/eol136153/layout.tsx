import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EOL136153 (Next BRUSS)',
  // description: 'Company helper applications',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
