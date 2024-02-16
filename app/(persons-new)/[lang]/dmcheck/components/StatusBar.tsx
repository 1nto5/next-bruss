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

export function StatusBar({
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
  const boxStatusClass = clsx('text-center text-2xl', boxStatusBlinkClass);
  const palletStatusBlinkClass = twMerge(
    palletIsFull ? 'animate-ping text-bruss' : '',
  );
  const palletStatusClass = clsx(
    'text-center text-2xl',
    palletStatusBlinkClass,
  );
  return (
    <div className='flex w-full justify-center space-x-2'>
      <Card className='flex-grow'>
        <CardHeader className='text-center font-extralight'>
          {cDict.operator}:
        </CardHeader>
        <CardContent className='text-center text-2xl'>{operator}</CardContent>
      </Card>

      <Card className='flex-grow'>
        <CardHeader className='text-center font-extralight'>
          {cDict.article}:
        </CardHeader>
        <CardContent className='text-center text-2xl'>{article}</CardContent>
      </Card>

      <Card className='flex-grow'>
        <CardHeader className='text-center font-extralight'>
          {cDict.inBox}:
        </CardHeader>
        <CardContent className={boxStatusClass}>{boxStatus}</CardContent>
      </Card>

      {pallet && (
        <Card className='flex-grow'>
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
