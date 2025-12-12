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
import { ScrollArea } from '@/components/ui/scroll-area';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { confirmWithPR } from '../actions';
import { Dictionary } from '../lib/dict';
import { PRLookupResult } from '../lib/types';

interface ConfirmWithPRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  availablePRs: PRLookupResult[];
  dict: Dictionary;
  onSuccess: () => void;
}

export default function ConfirmWithPRDialog({
  open,
  onOpenChange,
  invoiceId,
  availablePRs,
  dict,
  onSuccess,
}: ConfirmWithPRDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedPR, setSelectedPR] = useState<PRLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPRs = availablePRs.filter(
    (pr) =>
      pr.internalId?.toLowerCase().includes(search.toLowerCase()) ||
      pr.supplierName?.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleConfirm() {
    if (!selectedPR) return;

    setIsLoading(true);
    const result = await confirmWithPR(invoiceId, selectedPR._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    if (result.success === 'sent-to-review') {
      toast.info(dict.confirmDialog.sentToReview);
    } else {
      toast.success(dict.confirmDialog.success);
    }

    setSelectedPR(null);
    setSearch('');
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{dict.confirmDialog.withPRTitle}</DialogTitle>
          <DialogDescription>
            {dict.confirmDialog.withPRDescription}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder={dict.confirmDialog.searchPR}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>

          <ScrollArea className='h-[300px] rounded border'>
            {filteredPRs.length === 0 ? (
              <div className='flex h-full items-center justify-center p-4 text-muted-foreground'>
                {dict.confirmDialog.noPRsFound}
              </div>
            ) : (
              <div className='space-y-1 p-2'>
                {filteredPRs.map((pr) => (
                  <button
                    key={pr._id}
                    type='button'
                    onClick={() => setSelectedPR(pr)}
                    className={`w-full rounded-md p-3 text-left transition-colors hover:bg-muted ${
                      selectedPR?._id === pr._id
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : ''
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>{pr.internalId}</span>
                      <span className='text-sm text-muted-foreground'>
                        {pr.total.toLocaleString('pl-PL', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        {pr.currency}
                      </span>
                    </div>
                    <div className='mt-1 text-sm text-muted-foreground'>
                      {pr.supplierName || '—'} ·{' '}
                      {extractNameFromEmail(pr.requestedBy)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedPR && (
            <div className='rounded bg-muted p-3'>
              <Label className='text-sm text-muted-foreground'>
                {dict.confirmDialog.selected}:
              </Label>
              <div className='mt-1 font-medium'>
                {selectedPR.internalId} — {selectedPR.supplierName} —{' '}
                {selectedPR.total.toLocaleString('pl-PL', {
                  minimumFractionDigits: 2,
                })}{' '}
                {selectedPR.currency}
              </div>
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
          <Button onClick={handleConfirm} disabled={!selectedPR || isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {dict.confirmDialog.action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
