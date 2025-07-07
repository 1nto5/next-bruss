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
import {
  Check,
  ChevronsUpDown,
  CircleX,
  Plus,
  Save,
  Table,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  insertOvertimeSubmission as insert,
  redirectToOvertime as redirect,
  updateOvertimeSubmission as update,
} from '../actions';
import { OvertimeSubmissionType } from '../lib/types';
import { OvertimeSubmissionSchema } from '../lib/zod';

interface OvertimeRequestFormProps {
  managers: UsersListType;
  loggedInUserEmail: string;
  mode: 'new' | 'edit';
  submission?: OvertimeSubmissionType;
}

export default function OvertimeRequestForm({
  managers,
  loggedInUserEmail,
  mode,
  submission,
}: OvertimeRequestFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [supervisorOpen, setSupervisorOpen] = useState(false);

  const isEditMode = mode === 'edit';

  const form = useForm<z.infer<typeof OvertimeSubmissionSchema>>({
    resolver: zodResolver(OvertimeSubmissionSchema),
    defaultValues: {
      supervisor: isEditMode ? submission!.supervisor : '',
      date: isEditMode ? new Date(submission!.date) : new Date(),
      hours: isEditMode ? submission!.hours : 1,
      reason: isEditMode ? submission!.reason : '',
    },
  });

  const onSubmit = async (data: z.infer<typeof OvertimeSubmissionSchema>) => {
    setIsPending(true);
    try {
      let res;
      if (isEditMode) {
        res = await update(submission!._id, data);
      } else {
        res = await insert(data);
      }

      if ('success' in res) {
        const successMessage = isEditMode
          ? 'Zgłoszenie zostało zaktualizowane!'
          : 'Zgłoszenie dodane!';
        toast.success(successMessage);

        if (!isEditMode) {
          form.reset(); // Reset form after successful submission
        }
        redirect();
      } else if ('error' in res) {
        console.error(res.error);
        // Handle specific error messages
        const errorMsg = res.error;
        if (errorMsg === 'unauthorized') {
          toast.error('Nie masz uprawnień do wykonania tej akcji!');
        } else if (errorMsg === 'not found') {
          toast.error('Nie znaleziono zgłoszenia!');
        } else if (errorMsg === 'invalid status') {
          toast.error(
            'Nie można edytować zatwierdzonego lub odrzuconego zgłoszenia!',
          );
        } else if (errorMsg === 'not inserted') {
          toast.error('Nie udało się dodać zgłoszenia!');
        } else {
          toast.error('Skontaktuj się z IT!');
        }
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  const getTitle = () => {
    return isEditMode
      ? 'Edytuj zgłoszenie nadgodzin'
      : 'Nowe zgłoszenie nadgodzin';
  };

  const getSubmitButtonText = () => {
    return isEditMode ? 'Zapisz zmiany' : 'Dodaj zgłoszenie';
  };

  const getSubmitButtonIcon = () => {
    return isEditMode ? Save : Plus;
  };

  const SubmitIcon = getSubmitButtonIcon();

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>{getTitle()}</CardTitle>
          <Link href='/overtime-submissions'>
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
                            : 'wybierz'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='p-0' side='bottom' align='start'>
                      <Command>
                        <CommandInput placeholder='szukaj...' />
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
              name='date'
              render={({ field }) => {
                // Calculate min/max dates
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const firstDayPrevMonth = new Date(year, month - 1, 1);
                const lastDayNextMonth = new Date(
                  year,
                  month + 2,
                  0,
                  23,
                  59,
                  59,
                  999,
                );
                // Get current hours value from form
                const hoursValue = form.watch('hours');
                // Determine max date
                const maxDate = hoursValue < 0 ? lastDayNextMonth : now;
                return (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        hideTime={true}
                        min={firstDayPrevMonth}
                        max={maxDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name='hours'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Godziny</FormLabel>
                  <FormDescription>
                    Podaj liczbę godzin z dokładnością do pół godziny (np. 2.5).
                    Użyj wartości ujemnych (np. -2.5) aby odebrać nadgodziny.
                  </FormDescription>
                  <FormControl>
                    <Input
                      type='number'
                      step={0.5}
                      min={-16}
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
                  <FormLabel>Uzasadnienie</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <Separator className='mb-4' />

          <CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
            {isEditMode ? (
              <Link href='/overtime-submissions'>
                <Button
                  variant='destructive'
                  type='button'
                  className='w-full sm:w-auto'
                >
                  <CircleX />
                  Anuluj
                </Button>
              </Link>
            ) : (
              <Button
                variant='destructive'
                type='button'
                onClick={() => form.reset()}
                className='w-full sm:w-auto'
              >
                <CircleX />
                Wyczyść
              </Button>
            )}
            <Button
              type='submit'
              className='w-full sm:w-auto'
              disabled={isPending}
            >
              <SubmitIcon className={isPending ? 'animate-spin' : ''} />
              {getSubmitButtonText()}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
