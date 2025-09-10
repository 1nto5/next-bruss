import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zgłoszenie nadgodzin (BRUSS)',
};

export default function Layout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  return <div className='flex justify-center'>{children}</div>;
}
