import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import { Scan } from '../../../components/Scan';
import { StatusBar } from '../../../components/StatusBar';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getArticleConfigById,
  getOperatorById,
  getPalletQr,
} from '../../../actions';

import { columns } from './table/columns';

import { PrintPalletLabel } from '../../../components/PrintPalletLabel';
import { LastScansDataTable } from './table/data-table';

export default async function ScanPage({
  params: { lang, workplaceName, articleConfigId, operatorId },
  searchParams,
}: {
  params: {
    lang: Locale;
    workplaceName: string;
    articleConfigId: string;
    operatorId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
      redirect(
        `?operatorName=${operator.name}&operatorPersonalNumber=${operator.personalNumber}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}&boxesPerPallet=${article?.boxesPerPallet}&volume=0.75`,
      );
    }
    redirect(
      `?operatorName=${operator.name}&operatorPersonalNumber=${operator.personalNumber}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}&volume=0.75`,
    );
  }

  let boxStatus;
  let palletStatus;

  if (articleConfigId.length !== 24) {
    redirect(`/${lang}/dmcheck/${workplaceName}`);
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

  return (
    <>
      <StatusBar
        cDict={dict.dmcheck.scan.statusBar}
        operator={
          lang === 'pl'
            ? `${operatorInitials} (${searchParams.operatorPersonalNumber})`
            : `${operatorInitials}`
        }
        article={`${searchParams.articleNumber} - ${searchParams.articleName}`}
        boxIsFull={boxStatus?.boxIsFull ? true : false}
        // boxIsFull={false}
        boxStatus={`${boxStatus?.piecesInBox.toString()} / ${searchParams.piecesPerBox}`}
        pallet={searchParams.pallet === 'true' ? true : false}
        palletIsFull={palletStatus?.palletIsFull}
        palletStatus={`${palletStatus?.boxesOnPallet.toString()} / ${searchParams.boxesPerPallet}`}
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
        </CardHeader>
        <CardContent>
          <LastScansDataTable
            columns={columns}
            lang={lang}
            data={[{ dmc: '123456789', time: '2021-09-01T12:00:00Z' }]}
          />
        </CardContent>
      </Card>
    </>
  );
}
