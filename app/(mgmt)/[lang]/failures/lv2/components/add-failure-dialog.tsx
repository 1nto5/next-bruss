'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { failuresOptions, stationsOptions } from '@/lib/options/failures-lv2';
import { cn } from '@/lib/utils';
import { AddFailureSchema } from '@/lib/z/failure';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Check, ChevronsUpDown, CopyPlus } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { insertFailure } from '../actions';

export default function AddFailureDialog({}: {}) {
  const [open, setOpen] = useState(false);
  const [isPendingInsert, setIsPendingInserting] = useState(false);

  const [openStation, setOpenStation] = useState(false);
  const [openFailure, setOpenFailure] = useState(false);

  const form = useForm<z.infer<typeof AddFailureSchema>>({
    resolver: zodResolver(AddFailureSchema),
    defaultValues: {
      supervisor: '',
      responsible: '',
      solution: '',
      from: new Date(new Date()),
      to: new Date(new Date().getTime() + 60 * 60 * 1000),
    },
  });

  const selectedStation = form.watch('station');
  useEffect(() => {
    form.setValue('failure', '');
  }, [selectedStation]);

  const selectedFailure = form.watch('failure');

  const onSubmit = async (data: z.infer<typeof AddFailureSchema>) => {
    // setIsDraft(false);
    setIsPendingInserting(true);
    try {
      const res = await insertFailure(data);
      if (res.success) {
        toast.success('Awaria dodana!');
      } else if (res.error) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingInserting(false);
      form.reset();
      setOpen(false);
    }
  };

  const filteredFailures =
    failuresOptions.find((option) => option.station === selectedStation)
      ?.options || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='outline' title='dodaj awarię'>
          <CopyPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[700px] sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Nowa awaria LV2</DialogTitle>
          {/* <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid items-center gap-2'>
              <FormField
                control={form.control}
                name='station'
                render={({ field }) => (
                  <FormItem className='w-[200px]'>
                    <div className='flex flex-col items-start space-y-2'>
                      <FormLabel>Stacja</FormLabel>
                      <FormControl>
                        <Popover
                          open={openStation}
                          onOpenChange={setOpenStation}
                          modal={true}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              role='combobox'
                              // aria-expanded={open}
                              className={cn(
                                'w-full justify-between',
                                !form.getValues('station') && 'opacity-50',
                              )}
                            >
                              {selectedStation ? selectedStation : 'wybierz'}
                              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-[200px] p-0'>
                            <Command>
                              <CommandInput placeholder='wyszukaj...' />
                              <CommandList>
                                <CommandEmpty>Nie znaleziono.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    key='reset'
                                    onSelect={() => {
                                      form.setValue('station', '');
                                      setOpenStation(false);
                                    }}
                                  >
                                    <Check className='mr-2 h-4 w-4 opacity-0' />
                                    nie wybrano
                                  </CommandItem>
                                  {stationsOptions.map((station) => (
                                    <CommandItem
                                      key={station}
                                      value={station}
                                      onSelect={(currentValue) => {
                                        form.setValue('station', currentValue);
                                        setOpenStation(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          form.getValues('station') === station
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {station}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      {/* <FormMessage /> */}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='failure'
                render={({ field }) => (
                  <FormItem className='w-[350px]'>
                    <div className='flex flex-col items-start space-y-2'>
                      <FormLabel>Awaria</FormLabel>
                      <FormControl>
                        <Popover
                          open={openFailure}
                          onOpenChange={setOpenFailure}
                          modal={true}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              role='combobox'
                              className={cn(
                                'w-full justify-between',
                                !form.getValues('failure') && 'opacity-50',
                              )}
                              disabled={!selectedStation}
                            >
                              {selectedFailure ? selectedFailure : 'wybierz'}
                              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-[350px] p-0'>
                            <Command>
                              <CommandInput placeholder='wyszukaj...' />
                              <CommandList>
                                <CommandEmpty>Nie znaleziono.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    key='reset'
                                    onSelect={() => {
                                      form.setValue('failure', '');
                                      setOpenFailure(false);
                                    }}
                                  >
                                    <Check className='mr-2 h-4 w-4 opacity-0' />
                                    nie wybrano
                                  </CommandItem>
                                  {filteredFailures.map((failure) => (
                                    <CommandItem
                                      key={failure}
                                      value={failure}
                                      onSelect={(currentValue) => {
                                        form.setValue('failure', currentValue);
                                        setOpenFailure(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          form.getValues('failure') === failure
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {failure}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      {/* <FormMessage /> */}
                    </div>
                  </FormItem>
                )}
              />

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
                          defaultValue={format(new Date(), 'yyyy-MM-dd')}
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
                          defaultValue={format(new Date(), 'HH:mm')}
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
                          defaultValue={format(new Date(), 'yyyy-MM-dd')}
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
                            new Date(new Date().getTime() + 60 * 60 * 1000),
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
              <Button type='submit'>Dodaj</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
