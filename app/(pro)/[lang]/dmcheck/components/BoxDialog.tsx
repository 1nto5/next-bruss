'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Locale } from '@/i18n.config';
import { Box } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getInBoxTableData } from '../actions';

export function BoxDialog({
  cDict,
  lang,
  articleConfigId,
}: {
  cDict: any;
  lang: Locale;
  articleConfigId: string;
}) {
  const [data, setData] = useState<{ dmc: string; time: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function fetchData() {
    try {
      setIsPending(true);
      const result = await getInBoxTableData(articleConfigId);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='outline'>
          <Box />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{cDict.dialogTitle}</DialogTitle>
          <DialogDescription>{cDict.dialogDescription}</DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div>Loading...</div>
        ) : (
          <ScrollArea className='h-[320px]'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{cDict.timeTableHead}</TableHead>
                  <TableHead>{cDict.dateTableHead}</TableHead>
                  <TableHead>DMC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((dmc) => (
                    <TableRow key={dmc.dmc}>
                      <TableCell>
                        {new Date(dmc.time).toLocaleTimeString(lang)}
                      </TableCell>
                      <TableCell>
                        {new Date(dmc.time).toLocaleDateString(lang)}
                      </TableCell>
                      <TableCell>{dmc.dmc}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>{cDict.noDataTableCell}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        {/* <DialogFooter>
            <Button type='submit'>{cDict.saveButton}</Button>
          </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
