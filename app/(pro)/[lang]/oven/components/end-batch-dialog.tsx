import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { memo, RefObject } from 'react';
import { useForm } from 'react-hook-form';
import { endBatchSchema, EndBatchType } from '../lib/zod';

interface EndBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement>;
  onEnd: (data: EndBatchType) => Promise<void>;
}

export const EndBatchDialog = memo<EndBatchDialogProps>(
  function EndBatchDialog({ open, onOpenChange, inputRef, onEnd }) {
    const form = useForm<EndBatchType>({
      resolver: zodResolver(endBatchSchema),
      defaultValues: {
        scannedBatch: '',
      },
      mode: 'onSubmit',
    });

    const handleDialogClose = (open: boolean) => {
      onOpenChange(open);
      form.reset();
    };

    const handleSubmit = async (data: EndBatchType) => {
      try {
        await onEnd(data);
        form.reset();
      } catch {
        // Parent component handles errors
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Zakończ proces</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <FormField
                  control={form.control}
                  name='scannedBatch'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className='text-center'
                          placeholder='Zeskanuj HYDRA batch...'
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

              <div className='flex gap-2'>
                <Button
                  type='button'
                  onClick={() => handleDialogClose(false)}
                  className='flex-1'
                  variant='outline'
                >
                  Anuluj
                </Button>
                <Button type='submit' className='flex-1'>
                  Zakończ
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);
