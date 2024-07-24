import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Position = {
  article: string;
  status: string;
  workplace: string;
  count: string;
};

type ReworkTableProp = {
  cDict: any;
  data: Position[];
};

export default function ReworkTable({ cDict, data }: ReworkTableProp) {
  const polishStatus = {
    pallet: 'paleta',
    warehouse: 'magazyn',
  };

  const getPolishStatus = (status: string) => {
    if (status in polishStatus) {
      return polishStatus[status as keyof typeof polishStatus];
    } else {
      return status;
    }
  };

  return (
    <Table>
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px]'>Artykuł</TableHead>
          <TableHead>{cDict.statusTableHead}</TableHead>
          <TableHead>{cDict.workplaceTableHead}</TableHead>
          <TableHead className='text-right'>Ilość</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((position) => (
          <TableRow key={position.article}>
            <TableCell className='font-medium'>{position.article}</TableCell>
            <TableCell>{getPolishStatus(position.status)}</TableCell>
            <TableCell className='uppercase'>{position.workplace}</TableCell>
            <TableCell className='text-right'>{position.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        {/* <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className='text-right'>$2,500.00</TableCell>
        </TableRow> */}
      </TableFooter>
    </Table>
  );
}
