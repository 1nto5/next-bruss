import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Logowanie / rejestracja (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await auth();

  // if (session) {
  //   redirect('/');
  // }

  return <FormContainer>{children}</FormContainer>;
}
