import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nowe zlecenie godz. nadliczbowych - produkcja (BRUSS)',
};

export default function Layout(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  return <div className='flex justify-center'>{children}</div>;
}
