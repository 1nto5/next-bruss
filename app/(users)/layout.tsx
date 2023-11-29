import { AuthProvider } from '../auth-provider';

export const metadata = {
  title: 'Next BRUSS',
  description: 'Company helper applications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
