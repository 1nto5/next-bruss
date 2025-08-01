'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const PasteValuesSchema = z.object({
  values: z.string(),
});

type PasteValuesFormData = z.infer<typeof PasteValuesSchema>;

interface PasteValuesDialogProps {
  fieldType: 'dmc' | 'hydra_batch' | 'pallet_batch';
  fieldLabel: string;
  currentValue: string;
  currentCount: number;
  onApplyValues: (values: string) => void;
  children: React.ReactNode;
}

export default function PasteValuesDialog({
  fieldType,
  fieldLabel,
  currentValue,
  currentCount,
  onApplyValues,
  children,
}: PasteValuesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPendingApply, setIsPendingApply] = useState(false);

  // Helper function to convert comma-separated values to newline-separated
  const formatCurrentValues = (value: string) => {
    if (!value) return '';
    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .join('\n');
  };

  const form = useForm<PasteValuesFormData>({
    resolver: zodResolver(PasteValuesSchema),
    defaultValues: {
      values: '',
    },
  });

  // Update form when dialog opens with current values formatted
  useEffect(() => {
    if (open) {
      form.reset({
        values: formatCurrentValues(currentValue),
      });
    }
  }, [open, currentValue, form]);

  const onSubmit = async (data: PasteValuesFormData) => {
    setIsPendingApply(true);
    try {
      // Parse the pasted values - split by newlines and filter out empty lines
      const valuesList = data.values
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // Convert to comma-separated format or empty string if no values
      const commaSeparatedValues =
        valuesList.length > 0 ? valuesList.join(', ') : '';

      // Apply the values using the callback
      onApplyValues(commaSeparatedValues);

      const message =
        valuesList.length > 0
          ? `Applied ${valuesList.length} values to ${fieldLabel} filter`
          : `Cleared ${fieldLabel} filter`;

      toast.success(message);
      setOpen(false);
      form.reset({ values: '' });
    } catch (error) {
      console.error('Error applying pasted values:', error);
      toast.error('Error applying values');
    } finally {
      setIsPendingApply(false);
    }
  };

  const handleClearAll = () => {
    onApplyValues('');
    toast.success(`Cleared ${fieldLabel} filter`);
    setOpen(false);
    form.reset({ values: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Manage {fieldLabel} Values</DialogTitle>
          <div className='text-muted-foreground text-sm'>
            {currentCount > 0 ? (
              <span>
                Current: {currentCount} value{currentCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span>No values currently set</span>
            )}
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='values'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Values (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        currentCount > 0
                          ? `Current values are shown below. You can edit them or paste new values:
ABC123
DEF456
GHI789`
                          : `Paste your values here, for example:
ABC123
DEF456
GHI789`
                      }
                      className='min-h-[150px] font-mono'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
              <Button
                type='button'
                variant='destructive'
                onClick={handleClearAll}
                disabled={isPendingApply}
                className='sm:w-auto'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Clear All
              </Button>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPendingApply}>
                  {isPendingApply ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Applying...
                    </>
                  ) : (
                    'Apply Values'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
