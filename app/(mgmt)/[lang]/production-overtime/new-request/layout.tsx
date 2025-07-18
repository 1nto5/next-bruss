import { Locale } from '@/i18n.config';

export const metadata = {
  title:
    'Zlecenia wykonania pracy w godzinach nadliczbowych - produkcja (BRUSS)',
};

export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { children } = props;
  return <div className='flex justify-center'>{children}</div>;
}
