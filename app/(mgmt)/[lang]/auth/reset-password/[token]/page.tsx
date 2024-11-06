'use server';

import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Reset from '../../components/reset-password';

export default async function Page(
  props: {
    params: Promise<{ lang: Locale; token: string }>;
  }
) {
  const params = await props.params;

  const {
    lang,
    token
  } = params;

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
