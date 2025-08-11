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
import { ProBadge } from '@/app/(pro)/components/ui/pro-badge';
import { ProButton } from '@/app/(pro)/components/ui/pro-button';
import {
  ProCard,
  ProCardContent,
  ProCardDescription,
  ProCardHeader,
  ProCardTitle,
} from '@/app/(pro)/components/ui/pro-card';
import {
  ProDialog,
  ProDialogContent,
  ProDialogDescription,
  ProDialogHeader,
  ProDialogTitle,
} from '@/app/(pro)/components/ui/pro-dialog';
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
import { ExternalLink, Forklift, Loader2, Package, Trash2 } from 'lucide-react';
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
        <ProCard>
          <ProCardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Package className='text-muted-foreground h-6 w-6' />
                <ProCardTitle>{dict.box}</ProCardTitle>
              </div>
              <div className='flex items-center gap-3'>
                {boxIsFull && (
                  <ProBadge variant='destructive' className='animate-pulse' proSize='default'>
                    {dict.full}
                  </ProBadge>
                )}
                {boxData.piecesInBox > 0 && (
                  <ProButton
                    onClick={handleBoxIconClick}
                    variant='ghost'
                    size='icon'
                    disabled={isLoadingBoxScans}
                    className='h-12 w-12'
                  >
                    {isLoadingBoxScans ? (
                      <Loader2 className='text-muted-foreground animate-spin h-6 w-6' />
                    ) : (
                      <ExternalLink className='text-muted-foreground h-6 w-6' />
                    )}
                  </ProButton>
                )}
              </div>
            </div>
          </ProCardHeader>
          <ProCardContent>
            <div className='space-y-4'>
              <div className='text-center'>
                <span className='text-6xl font-bold'>{boxData.piecesInBox}</span>
                <span className='text-4xl text-muted-foreground mx-3'>/</span>
                <span className='text-5xl font-semibold text-muted-foreground'>{piecesPerBox}</span>
              </div>
              <Progress 
                value={boxProgress} 
                className={`h-4 ${boxIsFull ? 'animate-pulse [&>div]:bg-destructive' : ''}`} 
              />
            </div>
          </ProCardContent>
        </ProCard>

        {selectedArticle.pallet && (
          <ProCard>
            <ProCardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Forklift className='text-muted-foreground h-6 w-6' />
                  <ProCardTitle>{dict.pallet}</ProCardTitle>
                </div>
                <div className='flex items-center gap-2'>
                  {palletIsFull && (
                    <ProBadge variant='destructive' className='animate-pulse' proSize='default'>
                      {dict.fullPallet}
                    </ProBadge>
                  )}
                  {palletData.boxesOnPallet > 0 && (
                    <ProButton
                      onClick={handlePalletIconClick}
                      variant='ghost'
                      size='icon'
                      disabled={isLoadingPalletBoxes}
                      className='h-12 w-12'
                    >
                      {isLoadingPalletBoxes ? (
                        <Loader2 className='text-muted-foreground animate-spin h-6 w-6' />
                      ) : (
                        <ExternalLink className='text-muted-foreground h-6 w-6' />
                      )}
                    </ProButton>
                  )}
                </div>
              </div>
            </ProCardHeader>
            <ProCardContent>
              <div className='space-y-4'>
                <div className='text-center'>
                  <span className='text-6xl font-bold'>{palletData.boxesOnPallet}</span>
                  <span className='text-4xl text-muted-foreground mx-3'>/</span>
                  <span className='text-5xl font-semibold text-muted-foreground'>{boxesPerPallet || 0}</span>
                </div>
                <Progress 
                  value={palletProgress} 
                  className={`h-4 ${palletIsFull ? 'animate-pulse [&>div]:bg-destructive' : ''}`} 
                />
              </div>
            </ProCardContent>
          </ProCard>
        )}
      </div>

      {/* Box Scans Dialog */}
      <ProDialog open={boxDialogOpen} onOpenChange={setBoxDialogOpen}>
        <ProDialogContent size='xl'>
          <ProDialogHeader>
            <ProDialogTitle className='flex items-center gap-3'>
              <Package className='h-6 w-6' />
              {dict.box}
            </ProDialogTitle>
            <ProDialogDescription>
              {boxData.piecesInBox} / {piecesPerBox} {dict.pieces}
            </ProDialogDescription>
          </ProDialogHeader>
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
                            <ProButton
                              size='icon'
                              variant='ghost'
                              className='h-10 w-10'
                            >
                              <Trash2 className='h-5 w-5' />
                            </ProButton>
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
                            <AlertDialogFooter>
                              <AlertDialogCancel>
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
                              >
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
        </ProDialogContent>
      </ProDialog>

      {/* Pallet Scans Dialog */}
      {selectedArticle.pallet && (
        <ProDialog open={palletDialogOpen} onOpenChange={setPalletDialogOpen}>
          <ProDialogContent size='xl'>
            <ProDialogHeader>
              <ProDialogTitle className='flex items-center gap-3'>
                <Forklift className='h-6 w-6' />
                {dict.pallet}
              </ProDialogTitle>
              <ProDialogDescription>
                {palletData.boxesOnPallet} / {boxesPerPallet || 0}{' '}
                {dict.boxes}
              </ProDialogDescription>
            </ProDialogHeader>
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
                              <ProButton
                                size='icon'
                                variant='ghost'
                                className='h-10 w-10'
                              >
                                <Trash2 className='h-5 w-5' />
                              </ProButton>
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
                              <AlertDialogFooter>
                                <AlertDialogCancel>
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
                                >
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
          </ProDialogContent>
        </ProDialog>
      )}
    </>
  );
}
