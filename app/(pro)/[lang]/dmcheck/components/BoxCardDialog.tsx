'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Input } from '@/components/ui/input';
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
import clsx from 'clsx';
import { Box, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { deleteDmcFromBox, getInBoxTableData } from '../actions';

export function BoxCardDialog({
  boxStatus,
  cardContentClass,
  cDict,
  lang,
  articleConfigId,
}: {
  boxStatus: string;
  cardContentClass: string;
  cDict: any;
  lang: Locale;
  articleConfigId: string;
}) {
  const [data, setData] = useState<{ dmc: string; time: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [searchText, setSearchText] = useState('');

  // async function fetchData() {
  //   try {
  //     setIsPending(true);
  //     setSearchText('');
  //     const result = await new Promise<{ dmc: string; time: string }[]>(
  //       (resolve) => {
  //         setTimeout(() => {
  //           resolve(getInBoxTableData(articleConfigId));
  //         }, 2000); // 2 seconds timeout
  //       },
  //     );
  //     setData(result);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   } finally {
  //     setIsPending(false);
  //   }
  // }

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
      setSearchText('');
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (isPending) {
    return (
      <Card className='w-2/12 flex-grow'>
        <CardHeader className='animate-pulse text-center font-extralight'>
          {cDict.cardHeaderPending}
        </CardHeader>
        <CardContent className={clsx('', cardContentClass)}>
          {boxStatus}
        </CardContent>
      </Card>
    );
  }

  const filteredData = data.filter((dmc) =>
    dmc.dmc.toLowerCase().includes(searchText.toLowerCase()),
  );

  // const handleDeleteDmc = async (dmc: string) => {
  //   const res = await deleteDmcFromBox(dmc);
  //   if (res.message === 'deleted') {
  //     setData(data.filter((item) => item.dmc !== dmc));
  //     toast.success(cDict.dmcDeletedToast);
  //   }
  // };

  const handleDeleteDmc = async (dmc: string) => {
    const rowElement = document.getElementById(`row-${dmc}`);
    if (rowElement) {
      rowElement.classList.add('animate-fade-out');
      setTimeout(async () => {
        const res = await deleteDmcFromBox(dmc);
        if (res.message === 'deleted') {
          setData(data.filter((item) => item.dmc !== dmc));
          toast.success(cDict.dmcDeletedToast);
        } else if (res.message === 'not found') {
          toast.error(cDict.dmcNotFoundToast);
        }
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className='w-2/12 flex-grow'>
          <CardHeader className='text-center font-extralight'>
            {cDict.cardHeader}:
          </CardHeader>
          <CardContent className={cardContentClass}>{boxStatus}</CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{cDict.dialogTitle}</DialogTitle>
          {data.length === 0 && (
            <DialogDescription>
              {cDict.noDataDialogDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        {data.length !== 0 && (
          <Input
            autoFocus
            type='text'
            placeholder={cDict.dmcSearchInputPlaceholder}
            className='text-center'
            autoComplete='off'
            onChange={(e) => setSearchText(e.target.value)}
          />
        )}

        {filteredData.length > 0 && (
          <ScrollArea className='max-h-[400px]'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{cDict.timeTableHead}</TableHead>
                  <TableHead>{cDict.dateTableHead}</TableHead>
                  <TableHead>DMC</TableHead>
                  <TableHead className='text-right'>
                    {cDict.deleteTableHead}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((dmc) => (
                  <TableRow key={dmc.dmc} id={`row-${dmc.dmc}`}>
                    <TableCell>
                      {new Date(dmc.time).toLocaleTimeString(lang)}
                    </TableCell>
                    <TableCell>
                      {new Date(dmc.time).toLocaleDateString(lang)}
                    </TableCell>
                    <TableCell>{dmc.dmc}</TableCell>
                    <TableCell className='text-right'>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button size='icon' variant='outline'>
                            <Trash2 />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {cDict.alertDialogTitle}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {cDict.alertDialogDescription}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {cDict.alertDialogCancel}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDmc(dmc.dmc)}
                            >
                              {cDict.alertDialogAction}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
