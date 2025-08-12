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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Locale } from '@/i18n.config';
import { ExternalLink, Forklift, Loader2, Package, Trash2, X, Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { deleteDmcFromBox, deleteHydraFromPallet } from '../actions';
import { useGetBoxScans } from '../data/get-box-scans';
import { useGetBoxStatus } from '../data/get-box-status';
import { useGetPalletBoxes } from '../data/get-pallet-boxes';
import { useGetPalletStatus } from '../data/get-pallet-status';
import type { Dictionary } from '../lib/dictionary';
import { useScanStore } from '../lib/stores';

interface StatusBarProps {
  dict: Dictionary['statusBar'];
  lang: Locale;
}

export default function StatusBar({ dict, lang }: StatusBarProps) {
  const { selectedArticle } = useScanStore();

  // Get status from React Query with refetch functions
  const {
    data: boxData = { piecesInBox: 0 },
    refetch: refetchBoxStatus,
  } = useGetBoxStatus(selectedArticle?.id);
  const {
    data: palletData = { boxesOnPallet: 0 },
    refetch: refetchPalletStatus,
  } = useGetPalletStatus(selectedArticle?.id, selectedArticle?.pallet || false);
  
  // Calculate full status locally using selectedArticle from store
  const boxIsFull = boxData.piecesInBox >= (selectedArticle?.piecesPerBox || 0);
  const palletIsFull = palletData.boxesOnPallet >= (selectedArticle?.boxesPerPallet || 0);

  const [boxDialogOpen, setBoxDialogOpen] = useState(false);
  const [palletDialogOpen, setPalletDialogOpen] = useState(false);

  // React Query hooks with manual refetch - must be called before conditional return
  const {
    data: boxScans = [],
    refetch: refetchBoxScans,
    isFetching: isLoadingBoxScans,
  } = useGetBoxScans(selectedArticle?.id);

  const {
    data: palletBoxes = [],
    refetch: refetchPalletBoxes,
    isFetching: isLoadingPalletBoxes,
  } = useGetPalletBoxes(selectedArticle?.id);

  // Handle icon clicks to fetch data and open dialog - must be called before conditional return
  const handleBoxIconClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      await refetchBoxScans();
      setBoxDialogOpen(true);
    },
    [refetchBoxScans],
  );

  const handlePalletIconClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      await refetchPalletBoxes();
      setPalletDialogOpen(true);
    },
    [refetchPalletBoxes],
  );

  // Don't render if no article selected
  if (!selectedArticle) return null;

  const { piecesPerBox, boxesPerPallet } = selectedArticle;

  const locale = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL';

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString(locale);
  };

  // Calculate progress percentages
  const boxProgress = (boxData.piecesInBox / piecesPerBox) * 100;
  const palletProgress =
    selectedArticle.pallet && boxesPerPallet
      ? (palletData.boxesOnPallet / boxesPerPallet) * 100
      : 0;

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Package className='text-muted-foreground h-6 w-6' />
                <CardTitle>{dict.box}</CardTitle>
              </div>
              <div className='flex items-center gap-3'>
                {boxIsFull && (
                  <Badge variant='destructive' className='animate-pulse'>
                    {dict.full}
                  </Badge>
                )}
                <Button
                  onClick={handleBoxIconClick}
                  variant='ghost'
                  size='icon'
                  disabled={isLoadingBoxScans || boxData.piecesInBox === 0}
                >
                  {isLoadingBoxScans ? (
                    <Loader2 className='text-muted-foreground animate-spin h-6 w-6' />
                  ) : (
                    <ExternalLink className='text-muted-foreground h-6 w-6' />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-2 pb-4'>
            <div className='space-y-4'>
              <div className='text-center'>
                <span className='text-4xl font-bold'>{boxData.piecesInBox}</span>
                <span className='text-2xl text-muted-foreground mx-3'>/</span>
                <span className='text-3xl text-muted-foreground'>{piecesPerBox}</span>
              </div>
              <Progress 
                value={boxProgress} 
                className={`h-4 ${boxIsFull ? 'animate-pulse [&>div]:bg-destructive' : ''}`} 
              />
            </div>
          </CardContent>
        </Card>

        {selectedArticle.pallet && (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Forklift className='text-muted-foreground h-6 w-6' />
                  <CardTitle>{dict.pallet}</CardTitle>
                </div>
                <div className='flex items-center gap-2'>
                  {palletIsFull && (
                    <Badge variant='destructive' className='animate-pulse'>
                      {dict.fullPallet}
                    </Badge>
                  )}
                  <Button
                    onClick={handlePalletIconClick}
                    variant='ghost'
                    size='icon'
                    disabled={isLoadingPalletBoxes || palletData.boxesOnPallet === 0}
                  >
                    {isLoadingPalletBoxes ? (
                      <Loader2 className='text-muted-foreground animate-spin h-6 w-6' />
                    ) : (
                      <ExternalLink className='text-muted-foreground h-6 w-6' />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-2 pb-4'>
              <div className='space-y-4'>
                <div className='text-center'>
                  <span className='text-4xl font-bold'>{palletData.boxesOnPallet}</span>
                  <span className='text-2xl text-muted-foreground mx-3'>/</span>
                  <span className='text-3xl text-muted-foreground'>{boxesPerPallet || 0}</span>
                </div>
                <Progress 
                  value={palletProgress} 
                  className={`h-4 ${palletIsFull ? 'animate-pulse [&>div]:bg-destructive' : ''}`} 
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Box Scans Dialog */}
      <Dialog open={boxDialogOpen} onOpenChange={setBoxDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className='flex items-center gap-3'>
              <Package className='h-6 w-6' />
              {dict.box}
            </DialogTitle>
            <DialogDescription>
              {boxData.piecesInBox} / {piecesPerBox} {dict.pieces}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='h-[400px] w-full'>
            {boxScans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DMC</TableHead>
                    <TableHead>{dict.time}</TableHead>
                    <TableHead className='w-16 text-right'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boxScans.map((scan) => (
                    <TableRow key={scan.dmc}>
                      <TableCell className='font-mono text-xs'>
                        {scan.dmc}
                      </TableCell>
                      <TableCell>{formatTime(scan.time)}</TableCell>
                      <TableCell className='text-right'>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-10 w-10'
                            >
                              <Trash2 className='h-5 w-5' />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {dict.deleteDmc}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {dict.deleteDmcConfirm}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex flex-row gap-2 w-full">
                              <AlertDialogCancel className="w-1/4 flex items-center justify-center gap-2">
                                <X className="h-4 w-4" />
                                {dict.cancel}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  toast.promise(
                                    async () => {
                                      const res = await deleteDmcFromBox(
                                        scan.dmc,
                                      );
                                      if (res.message === 'deleted') {
                                        await refetchBoxScans();
                                        await refetchBoxStatus();
                                        return dict.dmcDeleted;
                                      } else {
                                        throw new Error(dict.dmcNotFound);
                                      }
                                    },
                                    {
                                      loading: dict.deletingDmc,
                                      success: (msg) => msg,
                                      error: (err) =>
                                        err.message || dict.deleteError,
                                    },
                                  );
                                }}
                                className="w-3/4 flex items-center justify-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                {dict.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className='text-muted-foreground flex justify-center p-8'>
                {dict.noScans}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Pallet Scans Dialog */}
      {selectedArticle.pallet && (
        <Dialog open={palletDialogOpen} onOpenChange={setPalletDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className='flex items-center gap-3'>
                <Forklift className='h-6 w-6' />
                {dict.pallet}
              </DialogTitle>
              <DialogDescription>
                {palletData.boxesOnPallet} / {boxesPerPallet || 0}{' '}
                {dict.boxes}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className='h-[400px] w-full'>
              {palletBoxes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HYDRA</TableHead>
                      <TableHead>{dict.time}</TableHead>
                      <TableHead className='w-16 text-right'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {palletBoxes.map((box) => (
                      <TableRow key={box.hydra}>
                        <TableCell className='font-mono text-xs'>
                          {box.hydra}
                        </TableCell>
                        <TableCell>{formatTime(box.time)}</TableCell>
                        <TableCell className='text-right'>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size='icon'
                                variant='ghost'
                                className='h-10 w-10'
                              >
                                <Trash2 className='h-5 w-5' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {dict.deleteBox}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {dict.deleteBoxConfirm}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-row gap-2 w-full">
                                <AlertDialogCancel className="w-1/4 flex items-center justify-center gap-2">
                                  <X className="h-4 w-4" />
                                  {dict.cancel}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    toast.promise(
                                      async () => {
                                        const res = await deleteHydraFromPallet(
                                          box.hydra,
                                        );
                                        if (res.message === 'deleted') {
                                          await refetchPalletBoxes();
                                          await refetchPalletStatus();
                                          return dict.boxDeleted;
                                        } else {
                                          throw new Error(dict.boxNotFound);
                                        }
                                      },
                                      {
                                        loading: dict.deletingBox,
                                        success: (msg) => msg,
                                        error: (err) =>
                                          err.message || dict.deleteError,
                                      },
                                    );
                                  }}
                                  className="w-3/4 flex items-center justify-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {dict.delete}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className='text-muted-foreground flex justify-center p-8'>
                  {dict.noScans}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
