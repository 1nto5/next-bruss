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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { confirmWithSC } from '../actions';
import { Dictionary } from '../lib/dict';
import { SupplierCodeType } from '../lib/types';

interface ConfirmWithSCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  supplierCodes: SupplierCodeType[];
  dict: Dictionary;
  onSuccess: () => void;
}

export default function ConfirmWithSCDialog({
  open,
  onOpenChange,
  invoiceId,
  supplierCodes,
  dict,
  onSuccess,
}: ConfirmWithSCDialogProps) {
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedSC = supplierCodes.find((sc) => sc.code === selectedCode);

  async function handleConfirm() {
    if (!selectedCode) return;

    setIsLoading(true);
    const result = await confirmWithSC(invoiceId, selectedCode);
    setIsLoading(false);

    if (result.error) {
      if (result.error === 'not-sc-owner') {
        toast.error(dict.confirmDialog.notSCOwner);
      } else {
        toast.error(dict.toast.contactIT);
      }
      return;
    }

    if (result.success === 'sent-to-review') {
      toast.info(dict.confirmDialog.sentToReview);
    } else {
      toast.success(dict.confirmDialog.success);
    }

    setSelectedCode('');
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.confirmDialog.withSCTitle}</DialogTitle>
          <DialogDescription>
            {dict.confirmDialog.withSCDescription}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>{dict.confirmDialog.selectSC}</Label>
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger>
                <SelectValue placeholder={dict.confirmDialog.selectSCPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {supplierCodes.map((sc) => (
                  <SelectItem key={sc.code} value={sc.code}>
                    {sc.code} — {sc.description}
                    {sc.maxValue && ` (max: ${sc.maxValue} ${sc.maxCurrency})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSC && (
            <div className='rounded bg-muted p-3 text-sm'>
              <div>
                <strong>{dict.confirmDialog.scDescription}:</strong>{' '}
                {selectedSC.description}
              </div>
              {selectedSC.maxValue && (
                <div>
                  <strong>{dict.confirmDialog.scLimit}:</strong>{' '}
                  {selectedSC.maxValue.toLocaleString('pl-PL', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  {selectedSC.maxCurrency}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {dict.common.cancel}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedCode || isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {dict.confirmDialog.action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
