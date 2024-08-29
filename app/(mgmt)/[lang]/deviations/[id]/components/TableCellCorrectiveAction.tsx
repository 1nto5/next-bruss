'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  DialogDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TableCell } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { correctiveActionStatusOptions as statusOptions } from '@/lib/options/deviation';
import {
  correctiveActionStatusType,
  correctiveActionType,
} from '@/lib/types/deviation';
import { cn } from '@/lib/utils';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { confirmActionExecutionSchema } from '@/lib/z/deviation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ClipboardCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { changeCorrectiveActionStatus } from '../actions';

type TableCellCorrectiveActionProps = {
  correctiveAction: correctiveActionType;
  correctiveActionIndex: number;
  deviationId: string;
  lang: string;
  user: string;
};

const TableCellCorrectiveAction: React.FC<TableCellCorrectiveActionProps> = ({
  correctiveAction,
  correctiveActionIndex,
  deviationId,
  lang,
  user,
}) => {
  const form = useForm<z.infer<typeof confirmActionExecutionSchema>>({
    resolver: zodResolver(confirmActionExecutionSchema),
    defaultValues: {
      executedAt: new Date(new Date().setHours(12, 0, 0, 0)),
      status: '',
      comment: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (
    data: z.infer<typeof confirmActionExecutionSchema>,
  ) => {
    setIsPending(true);
    try {
      const status = {
        value: data.status as correctiveActionType['status']['value'],
        comment: data.comment,
        executedAt: new Date(data.executedAt),
        changed: {
          at: new Date(),
          by: user,
        },
      };
      const res = await changeCorrectiveActionStatus(
        deviationId,
        correctiveActionIndex,
        status,
      );
      if (res.success) {
        toast.success('Akcja korygująca została zakończona!');
      } else if (res.error) {
        console.error('handleConfirmExecution', res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('handleConfirmExecution', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };
  return (
    <>
      <TableCell>{correctiveAction.description}</TableCell>

      <TableCell>
        {correctiveAction.created.by === user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size='icon' type='button' variant='outline'>
                <ClipboardCheck />
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Zmiana statusu akcji korygującej</DialogTitle>
                {/* <DialogDescription>
                  Wybierz datę wykonania akcji korygującej oraz dodaj dodatkowe
                  informacje gdy jest to konieczne.
                </DialogDescription> */}
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className='grid gap-4'>
                    <FormField
                      control={form.control}
                      name='executedAt'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>Data zmiany statusu</FormLabel>
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
                            <PopoverContent
                              className='w-auto p-0'
                              align='start'
                            >
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
                                  const minDate = correctiveAction.created.at;
                                  const maxDate = new Date(today);
                                  maxDate.setDate(today.getDate() + 0);
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
                      name='status'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>Status</FormLabel>
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
                                    ? statusOptions.find(
                                        (option) =>
                                          option.value === field.value,
                                      )?.label
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
                                    {statusOptions.map((status) => (
                                      <CommandItem
                                        value={status.value.toString()}
                                        key={status.value.toString()}
                                        onSelect={() => {
                                          form.setValue(
                                            'status',
                                            status.value.toString(),
                                          );
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            status.value ===
                                              (field.value as correctiveActionStatusType['value'])
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                        {status.label}
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
                      name='comment'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dodatkowe informacje</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={`Dowolny tekst dotyczący wykonania akcji korygującej`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className='pt-4'>
                    <Button type='submit'>Potwierdź</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </TableCell>
      <TableCell>
        {extractNameFromEmail(correctiveAction.responsible)}
      </TableCell>
      <TableCell>
        {new Date(correctiveAction.deadline).toLocaleDateString(lang)}
      </TableCell>
      <TableCell>{correctiveAction.status.value}</TableCell>
      <TableCell>
        {correctiveAction.created?.at
          ? new Date(correctiveAction.created.at).toLocaleString(lang)
          : '-'}
      </TableCell>
    </>
  );
};

export default TableCellCorrectiveAction;
