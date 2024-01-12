// import { getServerSession } from 'next-auth/next';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'rework (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await auth();
  // console.log('session', session);
  return <>{children}</>;
}
