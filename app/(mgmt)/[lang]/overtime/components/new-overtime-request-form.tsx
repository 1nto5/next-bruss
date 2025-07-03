'use client';
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
import { DateTimePicker } from '@/components/ui/datetime-picker';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { UsersListType } from '@/lib/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, CircleX, Plus, Table } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  insertOvertimeSubmission as insert,
  redirectToOvertime as redirect,
} from '../actions';
import { OvertimeHoursSubmissionSchema } from '../lib/zod';

export default function NewOvertimeSubmissionForm({
  managers,
  loggedInUserEmail,
}: {
  managers: UsersListType;
  loggedInUserEmail: string;
}) {
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [supervisorOpen, setSupervisorOpen] = useState(false);

  const form = useForm<z.infer<typeof OvertimeHoursSubmissionSchema>>({
    resolver: zodResolver(OvertimeHoursSubmissionSchema),
    defaultValues: {
      supervisor: '',
      workedDate: new Date(),
      hoursWorked: 1,
      reason: '',
      description: '',
      note: '',
    },
  });

  const onSubmit = async (
    data: z.infer<typeof OvertimeHoursSubmissionSchema>,
  ) => {
    setIsPendingInserting(true);
    try {
      const res = await insert(data);
      if ('success' in res) {
        toast.success('Zgłoszenie godzin nadliczbowych dodane!');
        form.reset(); // Reset form after successful submission
        redirect();
      } else if ('error' in res) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingInserting(false);
    }
  };

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>
            Nowe zgłoszenie przepracowanych godzin nadliczbowych
          </CardTitle>
          <Link href='/overtime'>
            <Button variant='outline'>
              <Table /> <span>Tabela zgłoszeń</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Separator className='mb-4' />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='supervisor'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kierownik</FormLabel>
                  <FormDescription>
                    Wybierz kierownika, który zatwierdzi Twoje godziny
                    nadliczbowe.
                  </FormDescription>
                  <Popover
                    open={supervisorOpen}
                    onOpenChange={setSupervisorOpen}
                  >
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
                            ? managers.find(
                                (manager) => manager.email === field.value,
                              )?.name
                            : 'Wybierz kierownika'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='p-0' side='bottom' align='start'>
                      <Command>
                        <CommandInput placeholder='Szukaj kierownika...' />
                        <CommandList>
                          <CommandEmpty>
                            Nie znaleziono kierownika.
                          </CommandEmpty>
                          <CommandGroup className='max-h-48 overflow-y-auto'>
                            {managers.map((manager) => (
                              <CommandItem
                                value={manager.name}
                                key={manager.email}
                                onSelect={() => {
                                  form.setValue('supervisor', manager.email);
                                  setSupervisorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    manager.email === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                {manager.name}
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
              name='workedDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data wykonanej pracy</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hideTime={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='hoursWorked'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Liczba przepracowanych godzin nadliczbowych
                  </FormLabel>
                  <FormDescription>
                    Podaj liczbę godzin z dokładnością do pół godziny (np. 2.5)
                  </FormDescription>
                  <FormControl>
                    <Input
                      type='number'
                      step={0.5}
                      min={0.5}
                      max={16}
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === ''
                            ? 0.5
                            : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Uzasadnienie pracy w godzinach nadliczbowych
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis wykonanych prac</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dodatkowe informacje</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
            <Button
              variant='destructive'
              type='button'
              onClick={() => form.reset()}
              className='w-full sm:w-auto'
            >
              <CircleX />
              Wyczyść
            </Button>
            <Button
              type='submit'
              className='w-full sm:w-auto'
              disabled={isPendingInsert}
            >
              <Plus className={isPendingInsert ? 'animate-spin' : ''} />
              Dodaj zgłoszenie
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
