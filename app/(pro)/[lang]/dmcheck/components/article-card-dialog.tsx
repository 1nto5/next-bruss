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
import { ChartColumn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getArticleStatistics } from '../actions';

export function ArticleCardDialog({
  article,
  cDict,
  lang,
  articleConfigId,
}: {
  article: string;
  cDict: any;
  lang: Locale;
  articleConfigId: string;
}) {
  const [data, setData] = useState<{
    currentShift: number;
    minus1Shift: number;
    minus2Shift: number;
  }>();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function fetchData() {
    try {
      setIsPending(true);
      const result = await getArticleStatistics(articleConfigId, lang);
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
        <CardContent className='text-center text-xl'>{article}</CardContent>
        <Button
          size={'icon'}
          variant={'secondary'}
          className='absolute right-2 top-2'
        >
          <ChartColumn className='animate-spin' />
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
        {article}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size={'icon'}
              variant={'outline'}
              className='absolute right-2 top-2'
            >
              <ChartColumn />
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
                  <TableHead>{cDict.shiftTableHead}</TableHead>
                  <TableHead>{cDict.amountTableHead}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{cDict.currentShiftTableCell}</TableCell>
                  <TableCell>{data?.currentShift}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>-1</TableCell>
                  <TableCell>{data?.minus1Shift}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>-2</TableCell>
                  <TableCell>{data?.minus2Shift}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
