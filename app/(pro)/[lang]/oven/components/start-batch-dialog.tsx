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
import { memo, RefObject, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { startBatchSchema, StartBatchType } from '../lib/zod';

interface StartBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleInputRef: RefObject<HTMLInputElement>;
  batchInputRef: RefObject<HTMLInputElement>;
  onStart: (data: StartBatchType) => Promise<void>;
}

export const StartBatchDialog = memo<StartBatchDialogProps>(
  function StartBatchDialog({
    open,
    onOpenChange,
    articleInputRef,
    batchInputRef,
    onStart,
  }) {
    const form = useForm<StartBatchType>({
      resolver: zodResolver(startBatchSchema),
      defaultValues: {
        scannedArticle: '',
        scannedBatch: '',
      },
      mode: 'onSubmit',
    });

    useEffect(() => {
      if (open) {
        setTimeout(() => articleInputRef.current?.focus(), 50);
      }
    }, [open, articleInputRef]);

    const handleDialogClose = (open: boolean) => {
      onOpenChange(open);
      form.reset();
    };

    const handleSubmit = async (data: StartBatchType) => {
      try {
        await onStart(data);
        form.reset();
        setTimeout(() => articleInputRef.current?.focus(), 50);
      } catch {
        // Parent component handles errors
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Nowy proces</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <FormField
                  control={form.control}
                  name='scannedArticle'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className='text-center'
                          placeholder='Zeskanuj numer artykułu...'
                          autoFocus
                          ref={articleInputRef}
                          maxLength={5}
                          autoComplete='off'
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (field.value) {
                                setTimeout(
                                  () => batchInputRef.current?.focus(),
                                  50,
                                );
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          ref={batchInputRef}
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
                  Rozpocznij
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);
