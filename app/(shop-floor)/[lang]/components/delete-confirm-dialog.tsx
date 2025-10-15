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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { ReactNode } from 'react';

export interface DeleteConfirmDialogProps {
  trigger?: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  labels: {
    cancel: string;
    delete: string;
  };
}

export default function DeleteConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  labels,
}: DeleteConfirmDialogProps) {
  const defaultTrigger = (
    <Button size='icon' variant='ghost'>
      <Trash2 />
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex w-full flex-row gap-2'>
          <AlertDialogCancel className='flex w-1/4 items-center justify-center gap-2'>
            <X className='h-4 w-4' />
            {labels.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className='flex w-3/4 items-center justify-center gap-2'
          >
            <Trash2 className='h-4 w-4' />
            {labels.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
