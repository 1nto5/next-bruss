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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Dictionary } from '../lib/dict';

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  dict: Dictionary;
  isLoading: boolean;
}

export default function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  dict,
  isLoading,
}: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function handleConfirm() {
    if (reason.trim().length < 10) {
      setError(dict.rejectDialog.reasonMinLength);
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.rejectDialog.title}</DialogTitle>
          <DialogDescription>{dict.rejectDialog.description}</DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <Textarea
            placeholder={dict.rejectDialog.reasonPlaceholder}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            className='min-h-[100px]'
          />
          {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {dict.common.cancel}
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {dict.rejectDialog.action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
