// import { redirect } from 'next/navigation';
// import { auth } from '@/auth';

// import Container from '@/components/ui/container';

export const metadata = {
  title: 'Inwentaryzacja (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
