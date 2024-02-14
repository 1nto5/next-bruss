import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';

type StatusBarProps = {
  cDict: any;
  operator: string;
  article: string;
  pallet: boolean;
};

export function StatusBar({
  cDict,
  operator,
  article,
  pallet,
}: StatusBarProps) {
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
        <CardContent className='text-center text-2xl'>0/0</CardContent>
      </Card>

      {pallet && (
        <Card className='flex-grow'>
          <CardHeader className='text-center font-extralight'>
            {cDict.onPallet}:
          </CardHeader>
          <CardContent className='text-center text-2xl'>0/0</CardContent>
        </Card>
      )}
    </div>
  );
}
