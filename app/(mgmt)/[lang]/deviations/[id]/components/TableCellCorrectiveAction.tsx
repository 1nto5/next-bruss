'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Calendar } from '@/components/ui/calendar';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { TableCell } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import {
  addCorrectiveActionSchema,
  confirmActionExecutionSchema,
} from '@/lib/z/deviation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ClipboardCheck,
  Eraser,
  Loader2,
  Plus,
  Table,
} from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { confirmCorrectiveActionExecution } from '../actions';

type TableCellCorrectiveActionProps = {
  description: string;
  responsible: string;
  deadline: string | Date;
  executedAt?: string | Date;
  lang: string;
  user?: string;
  correctiveActionIndex: number;
  id: string;
  deviationCreatedAt: Date;
};

const TableCellCorrectiveAction: React.FC<TableCellCorrectiveActionProps> = ({
  description,
  responsible,
  deadline,
  executedAt,
  lang,
  user,
  correctiveActionIndex,
  id,
  deviationCreatedAt,
}) => {
  const form = useForm<z.infer<typeof confirmActionExecutionSchema>>({
    resolver: zodResolver(confirmActionExecutionSchema),
    defaultValues: {
      additionalInfo: '',
      executionTime: new Date(new Date().setHours(12, 0, 0, 0)),
    },
  });

  const [isPendingConfirmExecution, startConfirmExecutionTransition] =
    useTransition();

  const onSubmit = () => {
    startConfirmExecutionTransition(async () => {
      try {
        if (id) {
          console.error('handleApproval', 'id is missing');
          toast.error('Skontaktuj się z IT!');
          return;
        }
        const res = await confirmCorrectiveActionExecution(
          id,
          correctiveActionIndex,
          form.getValues('executionTime'),
          form.getValues('additionalInfo'),
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
      }
    });
  };
  return (
    <>
      <TableCell>{description}</TableCell>

      <TableCell>
        {!executedAt && responsible === user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size='icon' type='button' variant='outline'>
                <ClipboardCheck />
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Potwierdź wykonanie</DialogTitle>
                <DialogDescription>
                  Wybierz datę wykonania akcji korygującej oraz dodaj dodatkowe
                  informacje gdy jest to konieczne.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className='grid gap-4'>
                    <FormField
                      control={form.control}
                      name='executionTime'
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
                                  const minDate = deviationCreatedAt;
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
                      name='additionalInfo'
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
                  <DialogFooter>
                    <Button type='submit'>Potwierdź</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </TableCell>
      <TableCell>{extractNameFromEmail(responsible)}</TableCell>
      <TableCell>{new Date(deadline).toLocaleDateString(lang)}</TableCell>
      <TableCell>
        {executedAt ? new Date(executedAt).toLocaleString(lang) : '-'}
      </TableCell>
    </>
  );
};

export default TableCellCorrectiveAction;
