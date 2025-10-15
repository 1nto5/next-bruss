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
import { CircleX, Play } from 'lucide-react';
import { memo, RefObject, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Dictionary } from '../lib/dict';
import { StartBatchType } from '../lib/zod';

interface StartBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleInputRef: RefObject<HTMLInputElement>;
  batchInputRef: RefObject<HTMLInputElement>;
  onStart: (data: StartBatchType) => Promise<void>;
  dict: Dictionary;
}

export const StartBatchDialog = memo<StartBatchDialogProps>(
  function StartBatchDialog({
    open,
    onOpenChange,
    articleInputRef,
    batchInputRef,
    onStart,
    dict,
  }) {
    const form = useForm<StartBatchType>({
      // Remove resolver to prevent FormMessage display
      defaultValues: {
        scannedArticle: '',
        scannedBatch: '',
      },
    });

    useEffect(() => {
      if (open) {
        setTimeout(() => articleInputRef.current?.focus(), 50);
      }
    }, [open, articleInputRef]);

    // Remove client-side validation - let server handle it
    // This ensures consistent error handling with toast and sound

    const handleDialogClose = (open: boolean) => {
      onOpenChange(open);
      form.reset();
    };

    const handleSubmit = async (data: StartBatchType) => {
      await onStart(data);
      form.reset();
      setTimeout(() => articleInputRef.current?.focus(), 50);
    };

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{dict.startBatchDialog.title}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='scannedArticle'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className='text-center'
                          placeholder={dict.startBatchDialog.articlePlaceholder}
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
                          placeholder={dict.startBatchDialog.batchPlaceholder}
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
              <div className='flex gap-4'>
                <Button
                  type='button'
                  onClick={() => handleDialogClose(false)}
                  className='w-1/2'
                  variant='outline'
                >
                  <CircleX />
                  {dict.startBatchDialog.cancel}
                </Button>
                <Button type='submit' className='w-1/2'>
                  <Play />
                  {dict.startBatchDialog.start}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);