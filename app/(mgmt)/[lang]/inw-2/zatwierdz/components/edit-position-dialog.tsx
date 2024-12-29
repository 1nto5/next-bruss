'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PositionType } from '@/lib/types/inventory';
import { UpdatePositionSchema } from '@/lib/z/inventory';
import { zodResolver } from '@hookform/resolvers/zod';
import { set } from 'date-fns';
import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { updatePosition as update } from '../actions';

export default function EditPositionDialog({
  position,
}: {
  position: PositionType;
}) {
  const [open, setOpen] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const form = useForm<z.infer<typeof UpdatePositionSchema>>({
    resolver: zodResolver(UpdatePositionSchema),
    defaultValues: {
      articleNumber: position.articleNumber,
      quantity: position.quantity,
      wip: position.wip,
      unit: position.unit,
      comment: position.comment || '',
      approved: position.approver ? true : false,
    },
  });

  const onSubmit = async (data: z.infer<typeof UpdatePositionSchema>) => {
    setIsPendingUpdate(true);
    try {
      console.log('onSubmit', data);
      const res = await update(position.identifier, data);
      if (res.success) {
        toast.success('Pozycja zapisana!');
        setOpen(false);
      } else if (res.error === 'article not found') {
        form.setError('articleNumber', { message: 'Artykuł nie istnieje' });
      } else if (res.error === 'wip not allowed') {
        form.setError('wip', { message: 'Niedozwolony dla S900' });
      } else if (res.error) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button size={'sm'} variant={'outline'}>
            <Pencil />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className='w-[700px] sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Edycja pozycji {position.identifier}</DialogTitle>
          {/* <DialogDescription>
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className='h-[450px]'>
              <div className='grid items-center gap-2 p-2'>
                <FormField
                  control={form.control}
                  name='articleNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artykuł</FormLabel>
                      <FormControl>
                        <Input className='w-[80px]' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='quantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ilość {`[${position.unit}]`}</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          className='w-[120px]'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='wip'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-2'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>WIP</FormLabel>
                      </div>
                      <FormMessage />
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='comment'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Komentarz</FormLabel>
                      <FormControl>
                        <Textarea className='w-[400px]' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator className='mb-2' />
                <FormField
                  control={form.control}
                  name='approved'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Zatwierdź pozycję
                        </FormLabel>
                        {position.approver && (
                          <FormDescription>
                            Pozycja została juz zatwierdzona przez{' '}
                            {position.approver}
                          </FormDescription>
                        )}
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className='mt-4'>
              {isPendingUpdate ? (
                <Button disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Zapisz
                </Button>
              ) : (
                <Button type='submit'>Zapisz</Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
