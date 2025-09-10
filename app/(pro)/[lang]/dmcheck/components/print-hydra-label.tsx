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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type PrintHydraLabelProps = {
  cDict: any;
  printHydraLabelAipIp: string;
  printHydraLabelAipWorkplacePosition: number;
  identifier: string;
  quantity?: string | number;
};

export function PrintHydraLabel({
  cDict,
  printHydraLabelAipIp,
  printHydraLabelAipWorkplacePosition,
  identifier,
  quantity,
}: PrintHydraLabelProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  // Label was already printed automatically since box is full
  const [hasLabelBeenPrinted, setHasLabelBeenPrinted] = useState(true);
  const [showReprintDialog, setShowReprintDialog] = useState(false);

  const handlePrintClick = () => {
    if (hasLabelBeenPrinted) {
      setShowReprintDialog(true);
      return;
    }
    handlePrint();
  };

  const handleConfirmReprint = () => {
    setShowReprintDialog(false);
    handlePrint();
  };

  const handlePrint = async () => {
    // for testing:
    setHasLabelBeenPrinted(true);

    if (!printHydraLabelAipIp) {
      toast.error(
        cDict.printHydraLabelErrorNoConfig ||
          'Missing Hydra label printing configuration',
      );
      return;
    }

    setIsPrinting(true);
    try {
      // Use the proxy API route instead of direct connection to avoid CORS issues
      const response = await fetch('/api/dmcheck/hydra-print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          quantity,
          printHydraLabelAipIp,
          printHydraLabelAipWorkplacePosition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to print Hydra label');
      }

      setHasLabelBeenPrinted(true);
      toast.success(
        cDict.printHydraLabelSuccess || 'Hydra label sent to printer',
      );
    } catch (error) {
      console.error('Error printing Hydra label:', error);
      toast.error(cDict.printHydraLabelError || 'Error printing Hydra label');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className='mt-8 flex flex-col items-center justify-center'>
      <Button
        variant='destructive'
        onClick={handlePrintClick}
        disabled={isPrinting}
        className='flex items-center gap-2'
      >
        <Printer className='h-4 w-4' />
        {isPrinting
          ? cDict.printHydraLabelPrinting || 'Printing...'
          : cDict.printHydraLabelReprint || 'Reprint Hydra Label'}
      </Button>

      <AlertDialog open={showReprintDialog} onOpenChange={setShowReprintDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cDict.printHydraLabelConfirmTitle || 'Confirm Reprint'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cDict.printHydraLabelConfirmReprint ||
                'This label has already been printed. Are you sure you want to print it again?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPrinting}>
              {cDict.cancel || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReprint}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isPrinting}
            >
              {cDict.confirm || 'Yes, print again'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
