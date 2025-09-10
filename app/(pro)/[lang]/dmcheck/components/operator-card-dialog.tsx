'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// import { Locale } from '@/i18n.config';
// import clsx from 'clsx';
import { Locale } from '@/i18n.config';
import { Medal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getOperatorStatistics } from '../actions';

export function OperatorCardDialog({
  cDict,
  lang,
  operator,
  operatorPersonalNumber,
}: {
  cDict: any;
  lang: Locale;
  operator: string;
  operatorPersonalNumber: string;
}) {
  const [data, setData] = useState<{
    all: number;
    day: number;
    week: number;
    month: number;
    year: number;
  }>();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function fetchData() {
    try {
      setIsPending(true);
      const result = await getOperatorStatistics(operatorPersonalNumber);
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsPending(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (isPending) {
    return (
      <Card className='relative'>
        <CardHeader className='flex items-center justify-between'>
          <div className='font-extralight'>{cDict.cardHeader}:</div>
        </CardHeader>
        <CardContent className='text-center text-xl'>{operator}</CardContent>
        <Button
          size={'icon'}
          variant={'secondary'}
          className='absolute right-2 top-2'
        >
          <Medal className='animate-spin' />
        </Button>
      </Card>
    );
  }

  return (
    <Card className='relative'>
      <CardHeader className='items-center'>
        <div className='font-extralight'>{cDict.cardHeader}:</div>
      </CardHeader>
      <CardContent className='text-center text-xl'>
        {operator}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size={'icon'}
              variant={'outline'}
              className='absolute right-2 top-2'
            >
              <Medal />
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>{cDict.dialogTitle}</DialogTitle>
              {/* <DialogDescription>
                {cDict.noDataDialogDescription}
              </DialogDescription> */}
            </DialogHeader>
            <Table>
              {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>{cDict.amountTableHead}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{cDict.allTableCell}</TableCell>
                  <TableCell>{data?.all}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{cDict.yearTableCell}</TableCell>

                  <TableCell>{data?.year}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{cDict.monthTableCell}</TableCell>

                  <TableCell>{data?.month}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{cDict.weekTableCell}</TableCell>
                  <TableCell>{data?.week}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{cDict.dayTableCell}</TableCell>
                  <TableCell>{data?.day}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
