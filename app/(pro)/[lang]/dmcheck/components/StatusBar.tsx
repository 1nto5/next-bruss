import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BoxCardDialog } from './BoxCardDialog';
import { PalletCardDialog } from './PalletCardDialog';

type StatusBarProps = {
  cDict: any;
  operator: string;
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
  const boxStatusClass = clsx('text-center text-xl ', boxStatusBlinkClass);
  const palletStatusBlinkClass = twMerge(
    palletIsFull ? 'animate-ping text-bruss' : '',
  );
  const palletStatusClass = clsx('text-center text-xl', palletStatusBlinkClass);
  return (
    <div className='flex w-full justify-center space-x-2'>
      <Card className='w-3/12 flex-grow'>
        <CardHeader className='text-center font-extralight'>
          {cDict.operator}:
        </CardHeader>
        <CardContent className='text-center text-xl'>{operator}</CardContent>
      </Card>

      <Card className='w-5/12 flex-grow'>
        <CardHeader className='text-center font-extralight'>
          {cDict.article}:
        </CardHeader>
        <CardContent className='text-center text-xl'>{article}</CardContent>
      </Card>

      <BoxCardDialog
        boxStatus={boxStatus}
        cardContentClass={boxStatusClass}
        cDict={cDict.boxCardDialog}
        lang={lang}
        articleConfigId={articleConfigId}
      />

      {pallet && palletStatus && (
        <PalletCardDialog
          palletStatus={palletStatus}
          cardContentClass={palletStatusClass}
          cDict={cDict.palletCardDialog}
          lang={lang}
          articleConfigId={articleConfigId}
        />

        // <Card className='w-2/12 flex-grow'>
        //   <CardHeader className='text-center font-extralight'>
        //     {cDict.onPallet}:
        //   </CardHeader>
        //   <CardContent className={palletStatusClass}>
        //     {palletStatus}
        //   </CardContent>
        // </Card>
      )}
    </div>
  );
}
