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
import { Dictionary } from '../lib/dict';

interface OvertimeRequestFormProps {
  managers: UsersListType;
  loggedInUserEmail: string;
  mode: 'new' | 'edit';
  submission?: OvertimeSubmissionType;
  dict: Dictionary;
}

export default function OvertimeRequestForm({
  managers,
  loggedInUserEmail,
  mode,
  submission,
  dict,
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
          ? dict.toast.submissionUpdated
          : dict.toast.submissionAdded;

        if (!isEditMode) {
          if (currentActionType === 'save-and-add-another') {
            // Show only one toast for add another
            toast.success(dict.toast.submissionSaved);
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
          toast.error(dict.errors.unauthorized);
        } else if (errorMsg === 'not found') {
          toast.error(dict.errors.notFound);
        } else if (errorMsg === 'invalid status') {
          toast.error(dict.errors.cannotEditApprovedOrRejected);
        } else if (errorMsg === 'not inserted') {
          toast.error(dict.errors.notInserted);
        } else {
          toast.error(dict.errors.contactIT);
        }
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error(dict.errors.contactIT);
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
    return isEditMode ? dict.form.titleEdit : dict.form.titleNew;
  };

  const getSubmitButtonText = () => {
    return isEditMode ? dict.actions.save : dict.actions.add;
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
              <Table /> <span>{dict.form.submissionsTable}</span>
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
                  <FormLabel>{dict.form.supervisor}</FormLabel>
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
                            : dict.filters.select}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='p-0' side='bottom' align='start'>
                      <Command>
                        <CommandInput placeholder={dict.filters.searchPlaceholder} />
                        <CommandList>
                          <CommandEmpty>
                            {dict.form.managerNotFound}
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
                  <FormLabel>{dict.form.hours}</FormLabel>
                  <FormDescription>
                    {dict.form.hoursDescription}
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
                    <FormLabel>{dict.form.date}</FormLabel>
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
                  <FormLabel>{dict.form.reason}</FormLabel>
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
                  <FormLabel>{dict.form.overtimeRequest}</FormLabel>
                  <FormDescription>
                    {dict.form.overtimeRequestDescription}
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
                    <FormLabel>{dict.form.payment}</FormLabel>
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
                      <FormLabel>{dict.form.scheduledDayOff}</FormLabel>
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
                  {dict.actions.cancel}
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
                {dict.filters.clear}
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
                  {dict.actions.saveAndAddAnother}
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
