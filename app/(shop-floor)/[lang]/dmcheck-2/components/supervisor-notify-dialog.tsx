'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Dictionary } from '../lib/dict';

interface SupervisorNotifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  dict: Dictionary;
}

export default function SupervisorNotifyDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  dict,
}: SupervisorNotifyDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{dict.scan.supervisorNotifyDialog.title}</DialogTitle>
          <DialogDescription>
            {dict.scan.supervisorNotifyDialog.description}
          </DialogDescription>
        </DialogHeader>


        <DialogFooter className='flex w-full flex-row gap-2'>
          <Button
            variant='outline'
            onClick={handleCancel}
            className='flex w-1/2 items-center justify-center gap-2'
          >
            {dict.scan.supervisorNotifyDialog.cancelButton}
          </Button>
          <Button
            onClick={handleConfirm}
            className='flex w-1/2 items-center justify-center gap-2'
          >
            {dict.scan.supervisorNotifyDialog.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}