import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { CircleX, StopCircle } from 'lucide-react';
import { memo, RefObject } from 'react';
import { useForm } from 'react-hook-form';
import type { Dictionary } from '../lib/dictionary';
import { EndBatchType } from '../lib/zod';

interface EndBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement>;
  onEnd: (data: EndBatchType) => Promise<void>;
  dict: Dictionary;
}

export const EndBatchDialog = memo<EndBatchDialogProps>(
  function EndBatchDialog({ open, onOpenChange, inputRef, onEnd, dict }) {
    const form = useForm<EndBatchType>({
      // Remove resolver to prevent FormMessage display
      defaultValues: {
        scannedBatch: '',
      },
    });

    const handleDialogClose = (open: boolean) => {
      onOpenChange(open);
      form.reset();
    };

    const handleSubmit = async (data: EndBatchType) => {
      await onEnd(data);
      form.reset();
    };

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{dict.endBatchDialog.title}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='scannedBatch'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className='text-center'
                          placeholder={dict.endBatchDialog.batchPlaceholder}
                          autoFocus
                          ref={inputRef}
                          maxLength={10}
                          autoComplete='off'
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              form.handleSubmit(handleSubmit)();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex gap-4'>
                <Button
                  type='button'
                  onClick={() => handleDialogClose(false)}
                  className='w-1/2'
                  variant='outline'
                >
                  <CircleX className='mr-2' />
                  {dict.endBatchDialog.cancel}
                </Button>
                <Button type='submit' className='w-1/2'>
                  <StopCircle className='mr-2' />
                  {dict.endBatchDialog.end}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);