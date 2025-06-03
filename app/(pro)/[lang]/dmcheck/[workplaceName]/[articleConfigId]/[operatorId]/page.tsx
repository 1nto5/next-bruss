import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import { Scan } from '../../../components/scan';
import { StatusBar } from '../../../components/status-bar';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  getArticleConfigById,
  getOperatorById,
  getPalletQr,
} from '../../../actions';
import { LastFiveTable } from '../../../components/last-five-table';
import { PrintHydraLabel } from '../../../components/print-hydra-label';
import { PrintPalletLabel } from '../../../components/print-pallet-label';

export default async function ScanPage(props: {
  params: Promise<{
    lang: Locale;
    workplaceName: string;
    articleConfigId: string;
    operatorId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { lang, workplaceName, articleConfigId, operatorId } = params;

  const dict = await getDictionary(lang);
  if (
    !searchParams.operatorName ||
    !searchParams.operatorPersonalNumber ||
    !searchParams.articleNumber ||
    !searchParams.articleName ||
    !searchParams.piecesPerBox ||
    !searchParams.pallet
  ) {
    if (articleConfigId.length !== 24 || operatorId.length !== 24) {
      redirect(`/${lang}/dmcheck/${workplaceName}`);
    }
    const [article, operator] = await Promise.all([
      getArticleConfigById(articleConfigId),
      getOperatorById(operatorId),
    ]);
    if (!article || !operator) {
      redirect(`/${lang}/dmcheck/${workplaceName}`);
    }
    if (article?.pallet === true) {
      const redirectUrl = article?.printHydraLabelAipIp
        ? `?operatorName=${operator.firstName + ' ' + operator.lastName}&operatorPersonalNumber=${operator.identifier}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}&boxesPerPallet=${article?.boxesPerPallet}&printHydraLabelAipIp=${article.printHydraLabelAipIp}&printHydraLabelAipWorkplacePosition=${article.printHydraLabelAipWorkplacePosition || 1}&volume=0.75`
        : `?operatorName=${operator.firstName + ' ' + operator.lastName}&operatorPersonalNumber=${operator.identifier}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}&boxesPerPallet=${article?.boxesPerPallet}&volume=0.75`;
      redirect(redirectUrl);
    }
    const redirectUrl = article?.printHydraLabelAipIp
      ? `?operatorName=${operator.firstName + ' ' + operator.lastName}&operatorPersonalNumber=${operator.identifier}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}&printHydraLabelAipIp=${article.printHydraLabelAipIp}&printHydraLabelAipWorkplacePosition=${article.printHydraLabelAipWorkplacePosition || 1}&volume=0.75`
      : `?operatorName=${operator.firstName + ' ' + operator.lastName}&operatorPersonalNumber=${operator.identifier}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}&volume=0.75`;
    redirect(redirectUrl);
  }

  let boxStatus;
  let palletStatus;
  let articleConfig;

  if (articleConfigId.length !== 24) {
    redirect(`/${lang}/dmcheck/${workplaceName}`);
  }

  // Only fetch article config if printHydraLabelAipIp is not in searchParams but might be needed
  if (!searchParams.printHydraLabelAipIp) {
    articleConfig = await getArticleConfigById(articleConfigId);
  }

  async function getBoxStatus(articleConfigId: string) {
    try {
      const boxStatusRes = await fetch(
        `${process.env.API}/dmcheck/box-status?articleConfigId=${articleConfigId}`,
        {
          next: { revalidate: 0, tags: ['box'] },
        },
      );
      const boxStatus = await boxStatusRes.json();
      if (boxStatus.message === 'article not found') {
        redirect(`/${lang}/dmcheck/${workplaceName}`);
      }
      return boxStatus;
    } catch (error) {
      throw new Error('Fetching box status error: ' + error);
    }
  }

  async function getPalletStatus(articleConfigId: string) {
    try {
      const palletStatusRes = await fetch(
        `${process.env.API}/dmcheck/pallet-status?articleConfigId=${articleConfigId}`,
        {
          next: { revalidate: 0, tags: ['pallet'] },
        },
      );

      const palletStatus = await palletStatusRes.json();
      if (palletStatus.message === 'article not found') {
        redirect(`/${lang}/dmcheck/${workplaceName}`);
      }
      return palletStatus;
    } catch (error) {
      throw new Error('Fetching pallet status error: ' + error);
    }
  }

  if (searchParams.pallet === 'true') {
    const [boxStatusPromise, palletStatusPromise] = await Promise.all([
      getBoxStatus(articleConfigId),
      getPalletStatus(articleConfigId),
    ]);
    if (!boxStatusPromise || !palletStatusPromise) {
      redirect(`/${lang}/dmcheck/${workplaceName}`);
    }
    boxStatus = boxStatusPromise;
    palletStatus = palletStatusPromise;
  } else if (searchParams.pallet === 'false') {
    const boxStatusPromise = await getBoxStatus(articleConfigId);
    if (!boxStatusPromise) {
      redirect(`/${lang}/dmcheck/${workplaceName}`);
    }
    boxStatus = boxStatusPromise;
  }

  const operatorName = searchParams.operatorName.toString().split(' ');
  const operatorInitials =
    operatorName[0] + ' ' + operatorName[1].charAt(0) + '.';

  let palletQr = '';
  if (palletStatus?.palletIsFull) {
    const palletQrValue = await getPalletQr(articleConfigId);
    if (!palletQrValue) {
      redirect(`/${lang}/dmcheck/${workplaceName}`);
    }
    palletQr = palletQrValue;
  }

  const lastFivePlainArray = Array.isArray(searchParams.lastFive)
    ? searchParams.lastFive
    : (searchParams.lastFive?.split(',') ?? []);
  const lastFiveArray = [];
  for (let i = 0; i < lastFivePlainArray.length; i += 2) {
    lastFiveArray.push({
      dmc: lastFivePlainArray[i],
      time: lastFivePlainArray[i + 1],
    });
  }

  return (
    <>
      <StatusBar
        cDict={dict.dmcheck.scan.statusBar}
        operator={
          lang === 'pl'
            ? `${operatorInitials} (${searchParams.operatorPersonalNumber})`
            : `${operatorInitials}`
        }
        operatorPersonalNumber={searchParams.operatorPersonalNumber.toString()}
        article={`${searchParams.articleNumber} - ${searchParams.articleName}`}
        boxIsFull={boxStatus?.boxIsFull ? true : false}
        boxStatus={`${boxStatus?.piecesInBox.toString()} / ${searchParams.piecesPerBox}`}
        pallet={searchParams.pallet === 'true' ? true : false}
        palletIsFull={palletStatus?.palletIsFull}
        palletStatus={`${palletStatus?.boxesOnPallet.toString()} / ${searchParams.boxesPerPallet}`}
        lang={lang}
        articleConfigId={articleConfigId}
      />

      <Card className='mt-2'>
        <CardHeader>
          <Scan
            cDict={dict.dmcheck.scan}
            boxIsFull={boxStatus?.boxIsFull}
            palletIsFull={palletStatus?.palletIsFull}
            articleConfigId={articleConfigId}
            operatorPersonalNumber={searchParams.operatorPersonalNumber.toString()}
          />
          {palletStatus?.palletIsFull && (
            <PrintPalletLabel
              cDict={dict.dmcheck.scan}
              articleNumber={searchParams.articleNumber.toString()}
              articleName={searchParams.articleName.toString()}
              piecesPerPallet={
                Number(searchParams.boxesPerPallet) *
                Number(searchParams.piecesPerBox)
              }
              qrCode={palletQr}
            />
          )}
          {boxStatus?.boxIsFull && searchParams.printHydraLabelAipIp && (
            <PrintHydraLabel
              cDict={dict.dmcheck.scan}
              identifier={searchParams.operatorPersonalNumber.toString()}
              quantity={searchParams.piecesPerBox?.toString()}
              printHydraLabelAipIp={searchParams.printHydraLabelAipIp.toString()}
              printHydraLabelAipWorkplacePosition={
                searchParams.printHydraLabelAipWorkplacePosition
                  ? Number(searchParams.printHydraLabelAipWorkplacePosition)
                  : 1
              }
            />
          )}
        </CardHeader>
        <Separator className='mb-2' />
        <CardContent className='flex justify-center'>
          <LastFiveTable
            lang={lang}
            lastFive={lastFiveArray}
            cDict={dict.dmcheck.lastFiveTable}
          />
        </CardContent>
      </Card>
    </>
  );
}
