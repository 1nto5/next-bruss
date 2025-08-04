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
import { Check, Loader2, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const PasteValuesSchema = z.object({
  values: z.string(),
});

type PasteValuesFormData = z.infer<typeof PasteValuesSchema>;

interface PasteValuesDialogProps {
  fieldType: 'hydra_batch' | 'article';
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

      // Validate values based on field type
      if (valuesList.length > 0) {
        const invalidValues: string[] = [];

        valuesList.forEach((value) => {
          if (fieldType === 'article') {
            // Article should be 5 digits
            if (!/^\d{5}$/.test(value)) {
              invalidValues.push(value);
            }
          } else if (fieldType === 'hydra_batch') {
            // HYDRA Batch should be 10 characters
            if (value.length !== 10) {
              invalidValues.push(value);
            }
          }
        });

        if (invalidValues.length > 0) {
          const errorMessage =
            fieldType === 'article'
              ? `Invalid article format (must be 5 digits): ${invalidValues.slice(0, 3).join(', ')}${invalidValues.length > 3 ? '...' : ''}`
              : `Invalid HYDRA Batch format (must be 10 characters): ${invalidValues.slice(0, 3).join(', ')}${invalidValues.length > 3 ? '...' : ''}`;

          toast.error(errorMessage);
          return;
        }
      }

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
                          ? fieldType === 'article'
                            ? `Current values are shown below. You can edit them or paste new values:
30111
30112
30113`
                            : `Current values are shown below. You can edit them or paste new values:
HH12345678
AB98765432
XY11223344`
                          : fieldType === 'article'
                            ? `Paste your article values here (5 digits), for example:
30111
30112
30113`
                            : `Paste your HYDRA Batch values here (10 characters), for example:
HH12345678
AB98765432
XY11223344`
                      }
                      className='min-h-[150px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
              <div className='flex flex-col gap-2 w-full sm:flex-row sm:justify-between sm:w-full'>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={handleClearAll}
                  disabled={isPendingApply}
                  className='w-full sm:w-auto order-3 sm:order-1'
                >
                  <Trash2 />
                  Clear All
                </Button>
                <div className='flex flex-col gap-2 w-full sm:flex-row sm:w-auto'>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      setOpen(false);
                    }}
                    className='w-full sm:w-auto order-2'
                  >
                    <X />
                    Cancel
                  </Button>
                  <Button type='submit' disabled={isPendingApply} className='w-full sm:w-auto order-1 sm:order-3'>
                    {isPendingApply ? (
                      <Loader2 className='animate-spin' />
                    ) : (
                      <Check />
                    )}
                    Confirm
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
