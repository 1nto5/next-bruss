import { auth } from '@/auth';
import Container from '@/components/ui/container';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Employees management (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  if (!session?.user.roles?.includes('admin')) {
    redirect('/');
  }
  return (
    <Container>
      <main>{children}</main>
    </Container>
  );
}
