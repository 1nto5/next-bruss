import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { getArticlesConfigForWorkplace, revalidateTest } from '../actions';
// import { revalidatePath } from 'next/cache';
import { ArticleButton } from '../components/ArticleButton';
import { Info } from '../components/Info';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// export const revalidate = 3600;

export default async function Page({
  params: { lang, workplaceName },
}: {
  params: { lang: Locale; workplaceName: string };
}) {
  const dict = await getDictionary(lang);
  const cDict = dict.dmcheck.articleSelection;

  const articlesConfigForWorkplace =
    await getArticlesConfigForWorkplace(workplaceName);

  // TODO: show proper error message
  if (articlesConfigForWorkplace.length === 0) {
    return (
      <Info
        title={cDict.noArticleConfigForWorkplaceTitle}
        description={`${cDict.noArticleConfigForWorkplaceDescription} ${workplaceName.toUpperCase()}`}
      />
    );
  }

  console.log('articlesConfigForWorkplace', articlesConfigForWorkplace);

  return (
    <Card className='w-max-7xl'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap justify-center'>
        {articlesConfigForWorkplace.map((a, index) => (
          <ArticleButton
            key={index}
            workplaceName={workplaceName}
            articleConfigId={a._id.toString()}
            articleName={a.articleName}
            articleNumber={a.articleNumber}
          />
        ))}
      </CardContent>
    </Card>
  );
}
