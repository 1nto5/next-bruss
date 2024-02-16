import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { StatusBar } from '../../../components/StatusBar';
import { redirect } from 'next/navigation';
import { ScanDmc } from '../../../components/ScanDmc';

export const revalidate = 3600;

import {
  getArticleConfigById,
  getOperatorById,
  getBoxStatus,
  getPalletStatus,
} from '../../../actions';

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

  // boxStatus = await getBoxStatus(
  //   articleConfigId,
  //   // workplaceName,
  //   // searchParams.articleNumber.toString(),
  // );

  return (
    <>
      <div className='w-full'>
        <StatusBar
          cDict={dict.dmcheck.scan.statusBar}
          operator={`${searchParams.operatorName} (${searchParams.operatorPersonalNumber})`}
          article={`${searchParams.articleNumber} (${searchParams.articleName})`}
          boxIsFull={boxStatus?.boxIsFull ? true : false}
          // boxIsFull={true}
          boxStatus={`${boxStatus?.piecesInBox.toString()} / ${searchParams.piecesPerBox}`}
          pallet={searchParams.pallet === 'true' ? true : false}
          palletIsFull={palletStatus?.palletIsFull}
          palletStatus={`${palletStatus?.boxesOnPallet.toString()} / ${searchParams.boxesPerPallet}`}
        />
      </div>
      {!boxStatus?.boxIsFull && !palletStatus?.palletIsFull && (
        <ScanDmc cDict={dict.dmcheck.scan} articleConfigId={articleConfigId} />
      )}
    </>
  );
}
