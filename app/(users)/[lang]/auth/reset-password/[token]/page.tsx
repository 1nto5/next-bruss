'use server';

import { getDictionary } from '@/lib/dictionary';
import { Locale } from '@/i18n.config';
import Reset from '../../components/Reset';

export default async function Page({
  params: { lang, token },
}: {
  params: { lang: Locale; token: string };
}) {
  const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <Reset cDict={dict.auth} token={token} />
    </main>
  );
}

// export default async function EditUserPage({
//   params: { lang, userId },
// }: {
//   params: { lang: Locale; userId: string };
// }) {
//   // const dict = await getDictionary(lang);
