import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { getArticlesConfigForWorkplace, revalidateTest } from '../../actions';
// import { revalidatePath } from 'next/cache';
import { PersonLogin } from '../../components/PersonLogin';
import { Info } from '../../components/Info';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function PersonLoginPage({
  params: { lang, workplaceName, articleConfigId },
}: {
  params: { lang: Locale; workplaceName: string; articleConfigId: string };
}) {
  const dict = await getDictionary(lang);
  const cDict = dict.dmcheck.personLogin;

  return (
    <Card className='w-max-7xl'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap justify-center'>
        <PersonLogin
          cDict={dict.dmcheck.personLogin}
          workplaceName={workplaceName}
          articleConfigId={articleConfigId}
        />
      </CardContent>
    </Card>
  );
}
