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
import { FailureType } from '@/lib/types/failure';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Pencil } from 'lucide-react';

// import { Separator } from '@/components/ui/separator';
import { UpdateFailureSchema } from '@/lib/z/failure';
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
      to: failure.to ? new Date(failure.to) : undefined,
      supervisor: failure.supervisor,
      responsible: failure.responsible,
      solution: failure.solution,
    },
  });

  const onSubmit = async (data: z.infer<typeof UpdateFailureSchema>) => {
    // setIsDraft(false);
    setIsPendingUpdate(true);
    try {
      console.log('data', data);
      const res = await updateFailure({
        _id: failure._id,
        from: data.from,
        to: data.to ? data.to : undefined,
        supervisor: data.supervisor,
        responsible: data.responsible,
        solution: data.solution,
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
            <div className='grid items-center gap-2'>
              <div className='flex space-x-2'>
                <FormField
                  control={form.control}
                  name='from'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rozpoczęcie dn.</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          defaultValue={format(
                            new Date(failure.from),
                            'yyyy-MM-dd',
                          )}
                          onChange={(e) => {
                            const currentFrom =
                              form.getValues('from') || new Date();
                            const newDate = new Date(e.target.value);
                            const updatedFrom = new Date(
                              newDate.getFullYear(),
                              newDate.getMonth(),
                              newDate.getDate(),
                              currentFrom.getHours(),
                              currentFrom.getMinutes(),
                            );

                            form.setValue('from', updatedFrom);
                          }}
                        />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='from'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>godz.</FormLabel>
                      <FormControl>
                        <Input
                          type='time'
                          defaultValue={format(new Date(failure.from), 'HH:mm')}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value
                              .split(':')
                              .map(Number);
                            const currentFrom =
                              form.getValues('from') || new Date();
                            const updatedFrom = new Date(
                              currentFrom.getFullYear(),
                              currentFrom.getMonth(),
                              currentFrom.getDate(),
                              hours,
                              minutes,
                            );

                            form.setValue('from', updatedFrom);
                          }}
                        />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='from'
                render={({ field }) => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {failure.to && (
                <div className='flex space-x-2'>
                  <FormField
                    control={form.control}
                    name='to'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zakończenie dn.</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            defaultValue={format(
                              new Date(failure.to || Date.now()),
                              'yyyy-MM-dd',
                            )}
                            onChange={(e) => {
                              const currentFrom =
                                form.getValues('to') || new Date();
                              const newDate = new Date(e.target.value);
                              const updatedFrom = new Date(
                                newDate.getFullYear(),
                                newDate.getMonth(),
                                newDate.getDate(),
                                currentFrom.getHours(),
                                currentFrom.getMinutes(),
                              );

                              form.setValue('to', updatedFrom);
                            }}
                          />
                        </FormControl>
                        {/* <FormMessage /> */}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='to'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>godz.</FormLabel>
                        <FormControl>
                          <Input
                            type='time'
                            defaultValue={format(
                              new Date(failure.to || Date.now()),
                              'HH:mm',
                            )}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value
                                .split(':')
                                .map(Number);
                              const currentFrom =
                                form.getValues('to') || new Date();
                              const updatedFrom = new Date(
                                currentFrom.getFullYear(),
                                currentFrom.getMonth(),
                                currentFrom.getDate(),
                                hours,
                                minutes,
                              );

                              form.setValue('to', updatedFrom);
                            }}
                          />
                        </FormControl>
                        {/* <FormMessage /> */}
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name='supervisor'
                render={({ field }) => (
                  <FormItem className='w-[200px]'>
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
            </div>
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
