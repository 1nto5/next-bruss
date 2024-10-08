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
import { Boxes, Forklift, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { deleteBoxFromPallet, getBoxesOnPalletTableData } from '../actions';

export function PalletCardDialog({
  palletStatus,
  statusDivClass,
  cDict,
  lang,
  articleConfigId,
}: {
  palletStatus: string;
  statusDivClass: string;
  cDict: any;
  lang: Locale;
  articleConfigId: string;
}) {
  const [data, setData] = useState<
    { hydra_batch: string; hydra_time: string }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [searchText, setSearchText] = useState('');

  async function fetchData() {
    try {
      setIsPending(true);
      const result = await getBoxesOnPalletTableData(articleConfigId);
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
      <Card className='relative'>
        <CardHeader className='flex items-center justify-between'>
          <div className='font-extralight'>{cDict.cardHeader}:</div>
        </CardHeader>
        <CardContent>
          <div className={statusDivClass}>{palletStatus} </div>
        </CardContent>
        <Button
          size={'icon'}
          variant={'secondary'}
          className='absolute right-2 top-2'
        >
          <Forklift className='animate-spin' />
        </Button>
      </Card>
    );
  }

  const filteredData = data.filter((value) =>
    value.hydra_batch.toLowerCase().includes(searchText.toLowerCase()),
  );

  // const handleDeleteDmc = async (dmc: string) => {
  //   const res = await deleteBoxFromPallet(dmc);
  //   if (res.message === 'deleted') {
  //     setData(data.filter((item) => item.dmc !== dmc));
  //     toast.success(cDict.dmcDeletedToast);
  //   }
  // };

  const handleDeleteBox = async (hydra_batch: string) => {
    const rowElement = document.getElementById(`row-${hydra_batch}`);
    if (rowElement) {
      rowElement.classList.add('animate-fade-out');
      setTimeout(async () => {
        const res = await deleteBoxFromPallet(hydra_batch);
        if (res.message === 'deleted') {
          setData(data.filter((item) => item.hydra_batch !== hydra_batch));
          toast.success(cDict.hydraBatchDeletedToast);
        } else if (res.message === 'not found') {
          toast.error(cDict.hydraBatchNotFoundToast);
        }
      }, 300);
    }
  };

  return (
    <Card className='relative'>
      <CardHeader className='items-center'>
        <div className='font-extralight'>{cDict.cardHeader}:</div>
      </CardHeader>
      <CardContent className={statusDivClass}>
        {palletStatus}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size={'icon'}
              variant={'outline'}
              className='absolute right-2 top-2'
            >
              <Forklift />
            </Button>
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
                placeholder={cDict.hydraBatchSearchInputPlaceholder}
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
                      <TableHead>Batch</TableHead>
                      <TableHead className='text-right'>
                        {cDict.deleteTableHead}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((value) => (
                      <TableRow
                        key={value.hydra_batch}
                        id={`row-${value.hydra_batch}`}
                      >
                        <TableCell>
                          {new Date(value.hydra_time).toLocaleTimeString(lang)}
                        </TableCell>
                        <TableCell>
                          {new Date(value.hydra_time).toLocaleDateString(lang)}
                        </TableCell>
                        <TableCell>{value.hydra_batch}</TableCell>
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
                                  onClick={() =>
                                    handleDeleteBox(value.hydra_batch)
                                  }
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
      </CardContent>
    </Card>
  );
}
