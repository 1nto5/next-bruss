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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Pencil } from 'lucide-react';
import { FailureType } from '../lib/types-failures';

// import { Separator } from '@/components/ui/separator';
import { UpdateFailureSchema } from '@/app/(mgmt)/[lang]/failures/lv/lib/zod-failures';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { updateFailure } from '../actions';

export default function EditFailureDialog({
  failure,
}: {
  failure: FailureType;
}) {
  const [open, setOpen] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const form = useForm<z.infer<typeof UpdateFailureSchema>>({
    resolver: zodResolver(UpdateFailureSchema),
    defaultValues: {
      from: new Date(failure.from),
      to: new Date(failure.to),
      supervisor: failure.supervisor,
      responsible: failure.responsible,
      solution: failure.solution,
      comment: failure.comment,
    },
  });

  const onSubmit = async (data: z.infer<typeof UpdateFailureSchema>) => {
    // setIsDraft(false);
    setIsPendingUpdate(true);
    try {
      const res = await updateFailure({
        _id: failure._id,
        from: data.from,
        to: data.to,
        supervisor: data.supervisor,
        responsible: data.responsible,
        solution: data.solution,
        comment: data.comment,
      });
      if (res.success) {
        toast.success('Awaria zapisana!');
      } else if (res.error) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdate(false);
      form.reset();
      setOpen(false);
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
          <DialogTitle>Edycja awarii</DialogTitle>
          <DialogDescription>
            Linia: {failure.line.toUpperCase()}, stacja: {failure.station},
            awaria: {failure.failure}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className='h-[450px]'>
              <div className='grid items-center gap-2 p-2'>
                {/* Data rozpoczęcia */}
                <FormField
                  control={form.control}
                  name='from'
                  render={({ field }) => (
                    <FormItem className='w-48'>
                      <FormLabel>Rozpoczęcie</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          min={new Date(Date.now() - 8 * 3600 * 1000)}
                          max={new Date()}
                          modal
                          renderTrigger={({ value, setOpen, open }) => (
                            <DateTimeInput
                              value={value}
                              onChange={field.onChange}
                              format='dd/MM/yyyy HH:mm'
                              onCalendarClick={() => setOpen(!open)}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data zakończenia */}
                <FormField
                  control={form.control}
                  name='to'
                  render={({ field }) => (
                    <FormItem className='w-48'>
                      <FormLabel>Zakończenie</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          min={new Date(Date.now() - 8 * 3600 * 1000)}
                          max={new Date()}
                          modal
                          renderTrigger={({ value, setOpen, open }) => (
                            <DateTimeInput
                              value={value}
                              onChange={field.onChange}
                              format='dd/MM/yyyy HH:mm'
                              onCalendarClick={() => setOpen(!open)}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='supervisor'
                  render={({ field }) => (
                    <FormItem className='w-48'>
                      <FormLabel>Nadzorujący</FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} />
                      </FormControl>
                      {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='responsible'
                  render={({ field }) => (
                    <FormItem className='w-[200px]'>
                      <FormLabel>Odpowiedzialny</FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} />
                      </FormControl>
                      {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='solution'
                  render={({ field }) => (
                    <FormItem className='w-[400px]'>
                      <FormLabel>Rozwiązanie</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='comment'
                  render={({ field }) => (
                    <FormItem className='w-[400px]'>
                      <FormLabel>Komentarz</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      {/* <FormMessage /> */}
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
