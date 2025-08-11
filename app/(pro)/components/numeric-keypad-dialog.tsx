'use client';

import { ProButton } from '@/app/(pro)/components/ui/pro-button';
import {
  ProDialog,
  ProDialogContent,
  ProDialogHeader,
  ProDialogTitle,
} from '@/app/(pro)/components/ui/pro-dialog';
import { ProInput } from '@/app/(pro)/components/ui/pro-input';
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
    <ProDialog open={open} onOpenChange={onOpenChange}>
      <ProDialogContent size='lg'>
        <ProDialogHeader>
          <ProDialogTitle>{title}</ProDialogTitle>
        </ProDialogHeader>
        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-3 gap-4'
        >
          <ProInput
            autoFocus
            value={value}
            onChange={handleInputChange}
            className='col-span-3 text-center text-2xl font-semibold'
            autoComplete='off'
            inputMode='numeric'
            pattern='[0-9]*'
            proSize='xl'
          />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <ProButton
              key={number}
              type='button'
              proSize='xl'
              variant='outline'
              onClick={() => handleNumberClick(number)}
              className='text-2xl font-bold'
            >
              {number}
            </ProButton>
          ))}
          <ProButton
            type='button'
            variant='destructive'
            onClick={handleReset}
            proSize='xl'
            aria-label='Reset'
          >
            <RotateCcw />
          </ProButton>
          <ProButton
            type='button'
            proSize='xl'
            variant='outline'
            onClick={() => handleNumberClick(0)}
            className='text-2xl font-bold'
          >
            0
          </ProButton>
          <ProButton type='submit' proSize='xl' aria-label={confirmText || 'Save'} className='bg-green-600 text-white hover:bg-green-700'>
            <Check />
          </ProButton>
        </form>
      </ProDialogContent>
    </ProDialog>
  );
}