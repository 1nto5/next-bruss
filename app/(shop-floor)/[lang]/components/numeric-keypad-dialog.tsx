'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, RotateCcw } from 'lucide-react';
import { useCallback } from 'react';

interface NumericKeypadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  maxLength?: number;
}

export default function NumericKeypadDialog({
  open,
  onOpenChange,
  value,
  onValueChange,
  onConfirm,
  title,
  confirmText,
  maxLength = 10,
}: NumericKeypadDialogProps) {
  const handleNumberClick = useCallback(
    (number: number) => {
      if (value.length < maxLength) {
        onValueChange(value + number.toString());
      }
    },
    [value, onValueChange, maxLength]
  );

  const handleReset = useCallback(() => {
    onValueChange('');
  }, [onValueChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '');
    if (newValue.length <= maxLength) {
      onValueChange(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-3 gap-4'
        >
          <Input
            autoFocus
            value={value}
            onChange={handleInputChange}
            className='col-span-3 text-center'
            autoComplete='off'
            inputMode='numeric'
            pattern='[0-9]*'
          />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Button
              key={number}
              type='button'
              variant='outline'
              onClick={() => handleNumberClick(number)}
            >
              {number}
            </Button>
          ))}
          <Button
            type='button'
            variant='destructive'
            onClick={handleReset}
            aria-label='Reset'
          >
            <RotateCcw />
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleNumberClick(0)}
          >
            0
          </Button>
          <Button type='submit' aria-label={confirmText || 'Save'}>
            <Check />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}