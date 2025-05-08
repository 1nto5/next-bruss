export const metadata = {
  title: 'QR Code Generator (BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='flex justify-center'>{children}</div>;
}
