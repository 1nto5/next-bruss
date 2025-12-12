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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Dictionary } from '../lib/dict';

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reference: string) => void;
  dict: Dictionary;
  isLoading: boolean;
}

export default function BookDialog({
  open,
  onOpenChange,
  onConfirm,
  dict,
  isLoading,
}: BookDialogProps) {
  const [reference, setReference] = useState('');

  function handleConfirm() {
    onConfirm(reference);
    setReference('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.markBookedDialog.title}</DialogTitle>
          <DialogDescription>{dict.markBookedDialog.description}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>{dict.markBookedDialog.bookingReference}</Label>
            <Input
              placeholder={dict.markBookedDialog.bookingReferencePlaceholder}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {dict.common.cancel}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {dict.markBookedDialog.action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
