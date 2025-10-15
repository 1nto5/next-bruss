'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface ItemListDialogItem {
  id: string;
  primaryValue: string;
  secondaryValue: string;
  [key: string]: unknown;
}

export interface ItemListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: LucideIcon;
  items: ItemListDialogItem[];
  primaryColumnLabel: string;
  secondaryColumnLabel: string;
  noItemsMessage: string;
  renderDeleteAction?: (item: ItemListDialogItem) => ReactNode;
}

export default function ItemListDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  items,
  primaryColumnLabel,
  secondaryColumnLabel,
  noItemsMessage,
  renderDeleteAction,
}: ItemListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Icon className='size-6' />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className='h-[400px] w-full'>
          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{primaryColumnLabel}</TableHead>
                  <TableHead>{secondaryColumnLabel}</TableHead>
                  <TableHead className='w-16 text-right'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-mono'>
                      {item.primaryValue}
                    </TableCell>
                    <TableCell>{item.secondaryValue}</TableCell>
                    <TableCell className='text-right'>
                      {renderDeleteAction?.(item)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='text-muted-foreground flex justify-center p-8'>
              {noItemsMessage}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
