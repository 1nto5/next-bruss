import { Locale } from '@/i18n.config';

export const metadata = {
  title: 'Edycja zgłoszenia nadgodzin (BRUSS)',
};

export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { children } = props;
  return <div className='flex justify-center'>{children}</div>;
}
