'use client';

import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { correctiveActionStatusOptions as statusOptions } from '@/lib/options/deviation';
import { correctiveActionType } from '@/lib/types/deviation';
import { cn } from '@/lib/utils';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { confirmActionExecutionSchema } from '@/lib/z/deviation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, ClipboardCheck, History, Loader2 } from 'lucide-react';
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
  user: string | null | undefined;
  userRoles: string[] | null | undefined;
  deviationOwner: string;
};

const TableCellCorrectiveAction: React.FC<TableCellCorrectiveActionProps> = ({
  correctiveAction,
  correctiveActionIndex,
  deviationId,
  lang,
  user,
  userRoles,
  deviationOwner,
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
  const [open, setOpen] = useState(false);

  const getStatusLabel = (statusValue: string) => {
    const status = statusOptions.find((option) => option.value === statusValue);
    return status?.label || '';
  };

  const onSubmit = async (
    data: z.infer<typeof confirmActionExecutionSchema>,
  ) => {
    setIsPending(true);
    try {
      if (!user) {
        console.error('onSubmit', 'no user');
        return;
      }
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
        toast.success('Status został zaktualizowany!');
        setOpen(false);
      } else if (res.error) {
        console.error('onSubmit', res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <TableCell>{correctiveAction.description}</TableCell>
      <TableCell>
        {extractNameFromEmail(correctiveAction.responsible)}
      </TableCell>
      <TableCell>
        {new Date(correctiveAction.deadline).toLocaleDateString(lang)}
      </TableCell>
      <TableCell>{getStatusLabel(correctiveAction.status.value)}</TableCell>
      <TableCell>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size='icon' type='button' variant='outline'>
              <ClipboardCheck />
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            {correctiveAction.status.value === 'closed' ? (
              <DialogHeader>
                <DialogTitle>Akcja korygująca zakończona</DialogTitle>
                <DialogDescription>
                  Nie można zmienić statusu zakończonej akcji korygującej.
                </DialogDescription>
              </DialogHeader>
            ) : correctiveAction.created.by === user ||
              user === deviationOwner ||
              userRoles?.some((role) =>
                [
                  'group-leader',
                  'quality-manager',
                  'engineering-manager',
                  'maintenance-manager',
                  'production-manager',
                ].includes(role),
              ) ? (
              <>
                <DialogHeader>
                  <DialogTitle>Zmiana statusu akcji korygującej</DialogTitle>
                  <DialogDescription>
                    {correctiveAction.description}
                  </DialogDescription>
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
                                      'pl-3 text-left font-normal',
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
                                    const minDate = new Date(
                                      correctiveAction.status.executedAt,
                                    );
                                    const maxDate = new Date(today);
                                    maxDate.setDate(today.getDate() + 0);
                                    return date < minDate || date > maxDate;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='status'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Wybierz' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem
                                    key={status.value}
                                    value={status.value.toString()}
                                  >
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                      {isPending ? (
                        <Button disabled>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Potwierdzanie
                        </Button>
                      ) : (
                        <Button type='submit'>Potwierdź</Button>
                      )}
                    </DialogFooter>
                  </form>
                </Form>
              </>
            ) : (
              <DialogHeader>
                <DialogTitle>Brak uprawnień</DialogTitle>
                <DialogDescription>
                  Nie masz uprawnień do zmiany statusu akcji korygującej.
                </DialogDescription>
              </DialogHeader>
            )}
          </DialogContent>
        </Dialog>
      </TableCell>

      <TableCell>
        {correctiveAction.created?.at
          ? new Date(correctiveAction.created.at).toLocaleString(lang)
          : '-'}
      </TableCell>

      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button size='icon' type='button' variant='outline'>
              <History />
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[768px]'>
            <DialogHeader>
              <DialogTitle>
                Historia zmian statusu akcji korygującej
              </DialogTitle>
              <DialogDescription>
                {correctiveAction.description}
              </DialogDescription>
            </DialogHeader>
            <Table>
              {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Status</TableHead>
                  <TableHead>Data wykonania</TableHead>
                  <TableHead>Komentarz</TableHead>
                  <TableHead>Zmiana przez</TableHead>
                  <TableHead className='text-right'>Czas edycji</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>
                    {getStatusLabel(correctiveAction.status.value)}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      correctiveAction.status.executedAt,
                    ).toLocaleDateString(lang)}
                  </TableCell>
                  <TableCell>{correctiveAction.status.comment}</TableCell>
                  <TableCell>
                    {extractNameFromEmail(correctiveAction.created.by)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {new Date(
                      correctiveAction.status.changed.at,
                    ).toLocaleString(lang)}
                  </TableCell>
                </TableRow>
                {correctiveAction.history &&
                  correctiveAction.history.map((historyItem, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>
                        {getStatusLabel(historyItem.value)}
                      </TableCell>
                      <TableCell>
                        {new Date(historyItem.executedAt).toLocaleDateString(
                          lang,
                        )}
                      </TableCell>
                      <TableCell>{historyItem.comment}</TableCell>
                      <TableCell>
                        {extractNameFromEmail(historyItem.changed.by)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {new Date(historyItem.changed.at).toLocaleString(lang)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* 
              <DialogFooter className='pt-4'>
                <Button type='submit'>Potwierdź</Button>
              </DialogFooter> */}
          </DialogContent>
        </Dialog>
      </TableCell>
    </>
  );
};

export default TableCellCorrectiveAction;
