import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { AlertCircleIcon, StopCircle, X } from 'lucide-react';
import { memo } from 'react';
import type { Dictionary } from '../lib/dict';
import type { OvenProcessType } from '../lib/types';

interface EndAllProcessesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
  processes: OvenProcessType[];
  currentTemp: number | null;
  dict: Dictionary;
}

export const EndAllProcessesDialog = memo<EndAllProcessesDialogProps>(
  function EndAllProcessesDialog({
    open,
    onOpenChange,
    onConfirm,
    processes,
    currentTemp,
    dict,
  }) {
    const runningProcesses = processes;

    const handleConfirm = async () => {
      const success = await onConfirm();
      if (success) {
        onOpenChange(false);
      }
      // If success is false, keep dialog open
    };

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dict.endBatchDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {runningProcesses.length === 1
                ? dict.endBatchDialog.description.singular
                : dict.endBatchDialog.description.plural.replace(
                    '{count}',
                    runningProcesses.length.toString(),
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {currentTemp !== null && (
            <Alert variant='destructive'>
              <AlertCircleIcon />
              <AlertDescription>
                <p>{dict.endBatchDialog.temperatureWarning}</p>
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter className='flex w-full flex-row gap-2'>
            <AlertDialogCancel className='flex w-1/4 items-center justify-center gap-2'>
              <X className='h-4 w-4' />
              {dict.endBatchDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className='flex w-3/4 items-center justify-center gap-2 bg-red-600 hover:bg-red-700'
            >
              <StopCircle className='h-4 w-4' />
              {dict.endBatchDialog.end}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
