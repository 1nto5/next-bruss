import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { StatusBar } from '../../../components/StatusBar';
import { redirect } from 'next/navigation';
import { Scan } from '../../../components/Scan';

export const revalidate = 0;

import {
  getArticleConfigById,
  getOperatorById,
  getPalletQr,
} from '../../../actions';
import { PrintPalletLabel } from '../../../components/PrintPalletLabel';

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
        `?operatorName=${operator.name}&operatorPersonalNumber=${operator.personalNumber}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}&boxesPerPallet=${article?.boxesPerPallet}`,
      );
    }
    redirect(
      `?operatorName=${operator.name}&operatorPersonalNumber=${operator.personalNumber}&articleNumber=${article?.articleNumber}&articleName=${article?.articleName}&piecesPerBox=${article?.piecesPerBox}&pallet=${article?.pallet}`,
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
          next: { tags: ['box'] },
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
          next: { tags: ['pallet'] },
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
      <div className='w-full'>
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
      </div>

      <div className='w-1/2'>
        {/* {!boxStatus?.boxIsFull && !palletStatus?.palletIsFull && (
          <ScanDmc
            cDict={dict.dmcheck.scan}
            articleConfigId={articleConfigId}
            operatorPersonalNumber={searchParams.operatorPersonalNumber.toString()}
          />
        )}
        {boxStatus?.boxIsFull && !palletStatus?.palletIsFull && (
          <ScanHydra
            cDict={dict.dmcheck.scan}
            articleConfigId={articleConfigId}
            operatorPersonalNumber={searchParams.operatorPersonalNumber.toString()}
          />
        )}
        {palletStatus?.palletIsFull && (
          <>
            <ScanPallet
              cDict={dict.dmcheck.scan}
              articleConfigId={articleConfigId}
              operatorPersonalNumber={searchParams.operatorPersonalNumber.toString()}
            />
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
          </>
        )} */}
        {/* It has to be as one component, otherwise toasts are not shown in case of change of box or pallet status - old component with useEffect is not rendered */}
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
      </div>
    </>
  );
}
