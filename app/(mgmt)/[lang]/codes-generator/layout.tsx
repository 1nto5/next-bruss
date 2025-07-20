import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Generator (BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='flex justify-center'>{children}</div>;
}
