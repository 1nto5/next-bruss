// TODO: save draft and go to edit page
// TODO: get article name

'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { UsersListType } from '@/lib/types/user';
import { cn } from '@/lib/utils';
import { addCorrectiveActionSchema } from '@/lib/z/deviation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Eraser,
  Loader2,
  Plus,
  Table,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { redirectToDeviation, updateCorrectiveAction } from '../actions';

type AddCorrectiveActionPropsType = {
  id: string;
  users: UsersListType;
};

export default function AddCorrectiveAction({
  id,
  users,
}: AddCorrectiveActionPropsType) {
  // const [isDraft, setIsDraft] = useState<boolean>();
  const [isPendingUpdate, setIsPendingUpdating] = useState<boolean>(false);

  const form = useForm<z.infer<typeof addCorrectiveActionSchema>>({
    resolver: zodResolver(addCorrectiveActionSchema),
    defaultValues: {
      description: '',
      responsible: undefined,
      // deadline: new Date(new Date().setHours(12, 0, 0, 0) + 86400000),
      deadline: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof addCorrectiveActionSchema>) => {
    console.log('onSubmit', data);
    setIsPendingUpdating(true);
    try {
      const res = await updateCorrectiveAction(id, data);
      if (res.success) {
        toast.success('Akcja korygująca dodana!');
        // form.reset()
        redirectToDeviation(id);
      } else if (res.error === 'not found') {
        toast.error('Nie znaleziono odchylenia!');
      } else if (res.error === 'not authorized') {
        toast.error(
          'Tylko właściciel odchylenia może dodawać akcje korygujące!',
        );
      } else if (res.error) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdating(false);
    }
  };

  return (
    <Card className='w-[768px]'>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>Nowa akcja korygująca</CardTitle>
          <Link href={`/deviations/${id}`}>
            <Button size='icon' variant='outline'>
              <Table />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Separator className='mb-4' />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* <form
          onSubmit={form.handleSubmit(isDraft ? handleDraftInsert : onSubmit)}
        > */}
          <CardContent className='grid w-full items-center gap-4'>
            <div className='flex space-x-2'>
              <FormField
                control={form.control}
                name='deadline'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Termin wykonania</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-56 pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Wybierz datę</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              date.setHours(12, 0, 0, 0);
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            const minDate = new Date(today);
                            minDate.setDate(today.getDate() + 1);
                            const maxDate = new Date(today);
                            maxDate.setDate(today.getDate() + 90);
                            return date < minDate || date > maxDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='responsible'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Osoba odpowiedzialna</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'w-[200px] justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? users.find(
                                  (language) => language.email === field.value,
                                )?.name
                              : 'Wybierz'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[200px] p-0'>
                        <Command>
                          <CommandInput placeholder='Szukaj...' />
                          <CommandList>
                            <CommandEmpty>Nie znaleziono.</CommandEmpty>
                            {/* height of the selection window */}
                            <CommandGroup className='max-h-48 overflow-y-auto'>
                              {users.map((user) => (
                                <CommandItem
                                  value={user.name}
                                  key={user.email}
                                  onSelect={() => {
                                    form.setValue('responsible', user.email);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      user.email === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                  {user.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis akcji</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Wprowadź dowolny tekst opisujący akcję do podjęcia`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <Separator className='mb-4' />

          <CardFooter className='flex justify-between'>
            <Button
              variant='destructive'
              type='button'
              onClick={() => form.reset()}
            >
              <Eraser className='mr-2 h-4 w-4' />
              Wyczyść
            </Button>
            <div className='flex space-x-2'>
              {isPendingUpdate ? (
                <Button disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Dodawanie
                </Button>
              ) : (
                <Button type='submit'>
                  <Plus className='mr-2 h-4 w-4' />
                  Dodaj akcję korygującą
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
