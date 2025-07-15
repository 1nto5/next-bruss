import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { getArticlesForWorkplace } from '../actions';
import { Info } from '../components/info';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function ArticleSelectionPage(props: {
  params: Promise<{ lang: Locale; workplaceName: string }>;
}) {
  const params = await props.params;

  const { lang, workplaceName } = params;

  const dict = await getDictionary(lang);
  const cDict = dict.dmcheck.articleSelection;
  const workplaceArticles = await getArticlesForWorkplace(workplaceName);

  if (workplaceArticles.length === 0) {
    return (
      <main className='mt-24 flex justify-center'>
        <Info
          title={cDict.noArticleConfigForWorkplaceTitle}
          description={`${cDict.noArticleConfigForWorkplaceDescription} ${workplaceName.toUpperCase()}`}
        />
      </main>
    );
  }

  workplaceArticles.sort((a, b) => a.articleNumber - b.articleNumber);
  const showPalletColumn = workplaceArticles.some((a) => a.pallet);

  return (
    <Card className='w-max-7xl'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap justify-center'>
        {/* {articlesConfigForWorkplace.map((a, index) => (
          <Link
            key={index}
            href={{
              pathname: `${workplaceName}/${a._id.toString()}`,
            }}
          >
            <Button className='m-4 flex flex-col' variant='outline'>
              <div className='mb-2 text-xl'>
                {a.articleNumber} - {a.articleName}
              </div>
              <div className='font-extralight'>
                {a.piecesPerBox} {cDict.piecesPerBox}
              </div>
              {a.pallet && (
                <>
                  <div className='font-extralight'>
                    {a.boxesPerPallet} {cDict.boxesPerPallet}
                  </div>
                </>
              )}
              <div className='mt-2'>
                {a.articleNote} lorem ipsumrem ipsumlorem ipsumlorem ipsumlorem
                ipsumlorem ipsumlorem ipsum
              </div>
            </Button>
          </Link>
        ))} */}
        <Table>
          {/* <TableCaption>A list of instruments.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>{cDict.articleNumber}</TableHead>
              <TableHead>{cDict.articleName}</TableHead>
              <TableHead>{cDict.piecesPerBox}</TableHead>
              {showPalletColumn && (
                <TableHead>{cDict.boxesPerPallet}</TableHead>
              )}
              <TableHead>{cDict.articleNote}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workplaceArticles.map((a) => (
              <Link
                key={a.articleNumber}
                href={`${workplaceName}/${a._id.toString()}`}
                className='contents'
              >
                <TableRow className='hover:bg-muted/50 cursor-pointer'>
                  <TableCell className='font-bold'>{a.articleNumber}</TableCell>
                  <TableCell>{a.articleName}</TableCell>
                  <TableCell>{a.piecesPerBox}</TableCell>
                  {showPalletColumn && (
                    <TableCell>{a.pallet ? a.boxesPerPallet : '-'}</TableCell>
                  )}
                  <TableCell className='font-extralight'>
                    {a.articleNote ? a.articleNote : '-'}
                  </TableCell>
                </TableRow>
              </Link>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
