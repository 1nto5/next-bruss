import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

type StatusBarProps = {
  cDict: any;
  operator: string;
  article: string;
  boxIsFull: boolean;
  boxStatus: string;
  pallet: boolean;
  palletIsFull?: boolean;
  palletStatus?: string;
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

      <Card className='w-2/12 flex-grow'>
        <CardHeader className='text-center font-extralight'>
          {cDict.inBox}:
        </CardHeader>
        <CardContent className={boxStatusClass}>{boxStatus}</CardContent>
      </Card>

      {pallet && (
        <Card className='w-2/12 flex-grow'>
          <CardHeader className='text-center font-extralight'>
            {cDict.onPallet}:
          </CardHeader>
          <CardContent className={palletStatusClass}>
            {palletStatus}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
