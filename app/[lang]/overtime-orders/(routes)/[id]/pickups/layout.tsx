import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pracownicy odbierający nadgodziny (BRUSS)',
};

export default function Layout(props: { children: React.ReactNode }) {
  const { children } = props;
  return <>{children}</>;
}
