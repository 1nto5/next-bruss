// import { auth } from '@/auth';
// import { getDictionary } from '@/lib/dictionary';
// import { redirect } from 'next/navigation';
// import Info from '../../../../components/Info';

export const metadata = {
  title: 'Add many employee (Next BRUSS)',
};

export default async function Layout({
  children,
  // params: { lang },
}: {
  children: React.ReactNode;
  // params: { lang: Locale };
}) {
  // const dict = await getDictionary(lang);
  return <div className='flex justify-center'>{children}</div>;
}
