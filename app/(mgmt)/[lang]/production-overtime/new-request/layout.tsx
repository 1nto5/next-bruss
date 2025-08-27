import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Zlecenia wykonania pracy w godzinach nadliczbowych - produkcja (BRUSS)',
};

export default function Layout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  return <div className='flex justify-center'>{children}</div>;
}
