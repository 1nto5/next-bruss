'use client';

import { AddFailureSchema } from '@/app/[lang]/failures/lv/lib/failures-zod';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';

import { Check, ChevronsUpDown, CopyPlus } from 'lucide-react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import DialogFormWithScroll from '@/components/dialog-form-with-scroll';
import DialogScrollArea from '@/components/dialog-scroll-area';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { insertFailure } from '../actions';
import { FailureOptionType } from '../lib/failures-types';

export default function AddFailureDialog({
  failuresOptions,
  line,
}: {
  failuresOptions: FailureOptionType[];
  line: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPendingInsert, setIsPendingInserting] = useState(false);

  const [openStation, setOpenStation] = useState(false);
  const [openFailure, setOpenFailure] = useState(false);
  const form = useForm<z.infer<typeof AddFailureSchema>>({
    resolver: zodResolver(AddFailureSchema),
    defaultValues: {
      line: line,
      responsible: '',
      supervisor: '',
      from: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        responsible: '',
        supervisor: '',
        from: new Date(),
      });
    }
    form.setValue('line', line);
  }, [open]);

  const selectedStation = form.watch('station');
  const selectedLine = form.watch('line');

  useEffect(() => {
    form.setValue('station', '');
    form.setValue('failure', '');
  }, [selectedLine]);

  useEffect(() => {
    form.setValue('failure', '');
  }, [selectedStation]);

  const selectedFailure = form.watch('failure');

  const filteredStations = failuresOptions
    .filter((option) => option.line === selectedLine)
    .sort((a, b) => a.station.localeCompare(b.station));

  const filteredFailures = (
    filteredStations.filter((option) => option.station === selectedStation)[0]
      ?.options || []
  ).sort((a, b) => a.localeCompare(b));

  const onSubmit = async (data: z.infer<typeof AddFailureSchema>) => {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' title='dodaj awarię'>
          <CopyPlus /> <span>Dodaj awarię</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>
            Nowa awaria{' '}
            {selectedLine && 'na lini: ' + selectedLine.toUpperCase()}
          </DialogTitle>
          {/* <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogScrollArea>
              <DialogFormWithScroll>
                {!selectedLine && (
                  <FormField
                    control={form.control}
                    name='line'
                    render={({ field }) => (
                      <FormItem className='mb-2 space-y-3'>
                        <FormLabel>Linia</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className='flex flex-col space-y-1'
                          >
                            <FormItem className='flex items-center space-y-0 space-x-3'>
                              <FormControl>
                                <RadioGroupItem value='lv1' />
                              </FormControl>
                              <FormLabel className='font-normal'>LV1</FormLabel>
                            </FormItem>
                            <FormItem className='flex items-center space-y-0 space-x-3'>
                              <FormControl>
                                <RadioGroupItem value='lv2' />
                              </FormControl>
                              <FormLabel className='font-normal'>LV2</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {selectedLine && (
                  <>
                    <FormField
                      control={form.control}
                      name='station'
                      render={({ field }) => (
                        <FormItem className=''>
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
                                    disabled={!selectedLine}
                                    className={cn(
                                      'w-full justify-between',
                                      !form.getValues('station') &&
                                        'opacity-50',
                                    )}
                                  >
                                    {selectedStation
                                      ? selectedStation
                                      : 'wybierz'}
                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className='p-0'
                                  side='bottom'
                                  align='start'
                                >
                                  <Command>
                                    <CommandInput placeholder='wyszukaj...' />
                                    <CommandList>
                                      <CommandEmpty>
                                        Nie znaleziono.
                                      </CommandEmpty>
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
                                        {filteredStations.map((option) => (
                                          <CommandItem
                                            key={option.station}
                                            value={option.station}
                                            onSelect={(currentValue) => {
                                              form.setValue(
                                                'station',
                                                currentValue,
                                              );
                                              setOpenStation(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                'mr-2 h-4 w-4',
                                                form.getValues('station') ===
                                                  option.station
                                                  ? 'opacity-100'
                                                  : 'opacity-0',
                                              )}
                                            />
                                            {option.station}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='failure'
                      render={({ field }) => (
                        <FormItem className=' '>
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
                                      !form.getValues('failure') &&
                                        'opacity-50',
                                    )}
                                    disabled={!selectedStation}
                                  >
                                    {selectedFailure
                                      ? selectedFailure
                                      : 'wybierz'}
                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  side='bottom'
                                  align='start'
                                  className='p-0'
                                >
                                  <Command>
                                    <CommandInput placeholder='wyszukaj...' />
                                    <CommandList>
                                      <CommandEmpty>
                                        Nie znaleziono.
                                      </CommandEmpty>
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
                                              form.setValue(
                                                'failure',
                                                currentValue,
                                              );
                                              setOpenFailure(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                'mr-2 h-4 w-4',
                                                form.getValues('failure') ===
                                                  failure
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
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='from'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rozpoczęcie</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              max={new Date(Date.now())}
                              min={new Date(Date.now() - 3600 * 1000)}
                              modal
                              value={field.value}
                              onChange={field.onChange}
                              timePicker={{ hour: true, minute: true }}
                              renderTrigger={({ open, value, setOpen }) => (
                                <DateTimeInput
                                  value={value}
                                  onChange={(x) => !open && field.onChange(x)}
                                  format='dd/MM/yyyy HH:mm'
                                  disabled={open}
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
                        <FormItem>
                          <div className='space-y-2'>
                            <FormLabel>Nadzorujący</FormLabel>
                            <FormControl>
                              <Input placeholder='' {...field} />
                            </FormControl>
                            {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='responsible'
                      render={({ field }) => (
                        <FormItem className=' '>
                          <FormLabel>Odpowiedzialny</FormLabel>
                          <FormControl>
                            <Input placeholder='' {...field} />
                          </FormControl>
                          {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='solution'
                      render={({ field }) => (
                        <FormItem className=' '>
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
                        <FormItem className=' '>
                          <FormLabel>Komentarz</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          {/* <FormMessage /> */}
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </DialogFormWithScroll>
            </DialogScrollArea>
            <DialogFooter className='mt-4'>
              {isPendingInsert ? (
                <Button className='w-full' disabled>
                  <CopyPlus className='animate-spin' />
                  Dodawanie awarii...
                </Button>
              ) : (
                <Button className='w-full' type='submit'>
                  <CopyPlus /> Dodaj awarię
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
