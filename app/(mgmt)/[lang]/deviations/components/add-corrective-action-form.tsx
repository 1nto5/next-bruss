'use client';
import { addCorrectiveActionSchema } from '@/app/(mgmt)/[lang]/deviations/lib/zod';
import { Button } from '@/components/ui/button';
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
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { UsersListType } from '@/lib/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeftToLine,
  Check,
  ChevronsUpDown,
  Eraser,
  Loader2,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { redirectToDeviation, updateCorrectiveAction } from '../actions';

type AddCorrectiveActionPropsType = {
  id: string;
  users: UsersListType;
};

export default function AddCorrectiveActionForm({
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
      deadline: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof addCorrectiveActionSchema>) => {
    // console.log('onSubmit', data);
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
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>Nowa akcja korygująca</CardTitle>
          <Link href={`/deviations/${id}`}>
            <Button variant='outline'>
              <ArrowLeftToLine /> Odchylenie
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* <form
          onSubmit={form.handleSubmit(isDraft ? handleDraftInsert : onSubmit)}
        > */}
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='deadline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termin wykonania</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      modal
                      hideTime
                      value={field.value}
                      onChange={field.onChange}
                      min={(() => {
                        const today = new Date();
                        const minDate = new Date(today);
                        minDate.setDate(today.getDate() + 1);
                        return minDate;
                      })()}
                      max={(() => {
                        const today = new Date();
                        const maxDate = new Date(today);
                        maxDate.setDate(today.getDate() + 90);
                        return maxDate;
                      })()}
                      timePicker={{ hour: false, minute: false }}
                      renderTrigger={({ open, value, setOpen }) => (
                        <DateTimeInput
                          value={value}
                          onChange={(x) => !open && field.onChange(x)}
                          format='dd/MM/yyyy'
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
              name='responsible'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Osoba odpowiedzialna</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? users.find((user) => user.email === field.value)
                                ?.name
                            : 'Wybierz'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='p-0' side='bottom' align='start'>
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
