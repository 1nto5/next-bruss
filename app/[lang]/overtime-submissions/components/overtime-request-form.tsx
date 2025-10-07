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
import { DateTimeInput } from '@/components/ui/datetime-input';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';
import { UsersListType } from '@/lib/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  ChevronsUpDown,
  CircleX,
  Copy,
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
  const [actionType, setActionType] = useState<'save' | 'save-and-add-another'>(
    'save',
  );

  const isEditMode = mode === 'edit';

  const form = useForm<z.infer<typeof OvertimeSubmissionSchema>>({
    resolver: zodResolver(OvertimeSubmissionSchema),
    defaultValues: {
      supervisor: isEditMode ? submission!.supervisor : '',
      date: isEditMode ? new Date(submission!.date) : new Date(),
      hours: isEditMode ? submission!.hours : 1,
      reason: isEditMode ? submission!.reason : '',
      overtimeRequest: isEditMode
        ? (submission!.overtimeRequest ?? false)
        : false,
      payment: isEditMode ? submission!.payment : undefined,
      scheduledDayOff: isEditMode
        ? submission!.scheduledDayOff
          ? new Date(submission!.scheduledDayOff)
          : undefined
        : undefined,
    },
  });

  const onSubmit = async (
    data: z.infer<typeof OvertimeSubmissionSchema>,
    currentActionType: 'save' | 'save-and-add-another' = actionType,
  ) => {
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

        if (!isEditMode) {
          if (currentActionType === 'save-and-add-another') {
            // Show only one toast for add another
            toast.success('Zgłoszenie zapisane!');
          } else {
            toast.success(successMessage);
            form.reset(); // Reset form after successful submission
            redirect();
          }
        } else {
          toast.success(successMessage);
          redirect();
        }
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

  const handleSaveAndAddAnother = () => {
    setActionType('save-and-add-another');
    form.handleSubmit((data) => onSubmit(data, 'save-and-add-another'))();
  };

  const handleRegularSave = () => {
    setActionType('save');
    form.handleSubmit((data) => onSubmit(data, 'save'))();
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Default to regular save when Enter is pressed
            handleRegularSave();
          }}
        >
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='supervisor'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Przełożony</FormLabel>
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
              name='date'
              render={({ field }) => {
                const now = new Date();
                now.setHours(23, 59, 59, 999);

                // 7 days ago
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setHours(0, 0, 0, 0);
                sevenDaysAgo.setDate(now.getDate() - 7);

                const hoursValue = form.watch('hours');
                let minDate, maxDate;
                if (hoursValue < 0) {
                  // Overtime pickup: any time after now
                  minDate = now;
                  maxDate = undefined;
                } else {
                  minDate = sevenDaysAgo;
                  maxDate = now;
                }

                return (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        modal
                        hideTime
                        value={field.value}
                        onChange={field.onChange}
                        min={minDate}
                        max={maxDate}
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
                );
              }}
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

            {/* Overtime Request Switch */}
            <FormField
              control={form.control}
              name='overtimeRequest'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zlecenie godzin nadliczbowych</FormLabel>
                  <FormDescription>
                    Planowana praca w godzinach nadliczbowych wymaga zgody
                    przełożonego oraz dyrektora.
                  </FormDescription>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id='overtimeRequest-switch'
                      disabled={isEditMode && submission?.status !== 'pending'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Payment Switch, only if overtimeRequest is true */}
            {form.watch('overtimeRequest') && (
              <FormField
                control={form.control}
                name='payment'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wypłata</FormLabel>
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          id='payment-switch'
                          disabled={
                            isEditMode && submission?.status !== 'pending'
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Pickup Date, only if overtimeRequest is true and payment is false */}
            {form.watch('overtimeRequest') &&
              form.watch('payment') === false && (
                <FormField
                  control={form.control}
                  name='scheduledDayOff'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data odbioru godzin nadliczbowych</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          modal
                          hideTime
                          value={field.value}
                          onChange={field.onChange}
                          min={new Date()}
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
              )}
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

            <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
              {!isEditMode && (
                <Button
                  type='button'
                  variant='secondary'
                  onClick={handleSaveAndAddAnother}
                  disabled={isPending}
                  className='w-full sm:w-auto'
                >
                  <Copy
                    className={
                      isPending && actionType === 'save-and-add-another'
                        ? 'animate-spin'
                        : ''
                    }
                  />
                  Zapisz i dodaj kolejne
                </Button>
              )}

              <Button
                type='button'
                onClick={handleRegularSave}
                className='w-full sm:w-auto'
                disabled={isPending}
              >
                <SubmitIcon
                  className={
                    isPending && actionType === 'save' ? 'animate-spin' : ''
                  }
                />
                {getSubmitButtonText()}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
