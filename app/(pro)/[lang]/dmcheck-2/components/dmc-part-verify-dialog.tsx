'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import type { Dictionary } from '../lib/dictionary';

interface DmcPartVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scannedDmc: string;
  workplace: string;
  dmcFirstValidation?: string;
  dmcSecondValidation?: string;
  onConfirm: () => void;
  onCancel: () => void;
  dict: Dictionary;
}

export default function DmcPartVerifyDialog({
  open,
  onOpenChange,
  scannedDmc,
  workplace,
  dmcFirstValidation,
  dmcSecondValidation,
  onConfirm,
  onCancel,
  dict,
}: DmcPartVerifyDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };


  // Construct the verification image path based on workplace
  const verificationImage = `/${workplace}_dmc.png`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{dict.scan.dmcPartVerifyDialog.title}</DialogTitle>
          <DialogDescription>
            {dict.scan.dmcPartVerifyDialog.description}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Display the scanned DMC code with validation highlighting */}
          <div className='space-y-2 text-center'>
            <p className='text-muted-foreground text-sm'>
              {dict.scan.dmcPartVerifyDialog.scannedCode}
            </p>
            <Badge variant='secondary' className='px-4 py-2 font-mono text-lg'>
              {scannedDmc}
            </Badge>
          </div>

          {/* Show the DMC location image */}
          <div className='flex justify-center'>
            <Image
              src={verificationImage}
              alt={
                dict.scan.dmcPartVerifyDialog.imageAlt || 'DMC location on part'
              }
              width={300}
              height={200}
              className='rounded-lg'
              priority
            />
          </div>
        </div>

        <DialogFooter className='flex w-full flex-row gap-2'>
          <Button
            variant='outline'
            onClick={handleCancel}
            className='flex w-1/2 items-center justify-center gap-2'
          >
            {dict.scan.dmcPartVerifyDialog.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            className='flex w-1/2 items-center justify-center gap-2'
          >
            {dict.scan.dmcPartVerifyDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
