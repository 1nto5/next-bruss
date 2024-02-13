import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { getArticlesConfigForWorkplace } from '../actions';
import { ArticleButton } from '../components/ArticleButton';
import { Info } from '../components/Info';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ArticleSelectionPage({
  params: { lang, workplaceName },
}: {
  params: { lang: Locale; workplaceName: string };
}) {
  const dict = await getDictionary(lang);
  const cDict = dict.dmcheck.articleSelection;

  const articlesConfigForWorkplace =
    await getArticlesConfigForWorkplace(workplaceName);

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
