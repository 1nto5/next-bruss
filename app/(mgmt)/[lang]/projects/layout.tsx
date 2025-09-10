import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Time Sheet - Adrian's Projects (BRUSS)",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
