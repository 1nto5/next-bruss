import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArticleCardDialog } from './article-card-dialog';
import { BoxCardDialog } from './box-card-dialog';
import { OperatorCardDialog } from './operator-card-dialog';
import { PalletCardDialog } from './pallet-card-dialog';

type StatusBarProps = {
  cDict: any;
  operator: string;
  operatorPersonalNumber: string;
  article: string;
  boxIsFull: boolean;
  boxStatus: string;
  pallet: boolean;
  palletIsFull?: boolean;
  palletStatus?: string;
  lang: Locale;
  articleConfigId: string;
};

export async function StatusBar({
  cDict,
  operator,
  operatorPersonalNumber,
  article,
  boxIsFull,
  boxStatus,
  pallet,
  palletIsFull,
  palletStatus,
  lang,
  articleConfigId,
}: StatusBarProps) {
  const boxStatusBlinkClass = twMerge(
    boxIsFull ? 'animate-ping text-bruss' : '',
  );
  const boxStatusClass = clsx('text-center text-xl', boxStatusBlinkClass);
  const palletStatusBlinkClass = twMerge(
    palletIsFull ? 'animate-ping text-bruss' : '',
  );
  const palletStatusClass = clsx('text-center text-xl', palletStatusBlinkClass);
  return (
    <div className='flex w-full justify-center space-x-2'>
      <div className='w-3/12 flex-grow'>
        <OperatorCardDialog
          cDict={cDict.operatorCardDialog}
          lang={lang}
          operator={operator}
          operatorPersonalNumber={operatorPersonalNumber}
        />
      </div>

      <div className='w-5/12 flex-grow'>
        <ArticleCardDialog
          article={article}
          cDict={cDict.articleCardDialog}
          lang={lang}
          articleConfigId={articleConfigId}
        />
      </div>

      <div className='w-2/12 flex-grow'>
        <BoxCardDialog
          boxStatus={boxStatus}
          statusDivClass={boxStatusClass}
          cDict={cDict.boxCardDialog}
          lang={lang}
          articleConfigId={articleConfigId}
        />
      </div>

      {pallet && palletStatus && (
        <div className='w-2/12 flex-grow'>
          <PalletCardDialog
            palletStatus={palletStatus}
            statusDivClass={palletStatusClass}
            cDict={cDict.palletCardDialog}
            lang={lang}
            articleConfigId={articleConfigId}
          />
        </div>
      )}
    </div>
  );
}
