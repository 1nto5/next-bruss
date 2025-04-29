'use client';

import { correctiveActionStatusOptions as statusOptions } from '@/app/(mgmt)/[lang]/deviations/lib/options';
import { correctiveActionType } from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { confirmActionExecutionSchema } from '@/app/(mgmt)/[lang]/deviations/lib/zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ClipboardCheck, History } from 'lucide-react';
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
      // status: '',
      comment: '',
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const getStatusLabel = (statusValue: string) => {
    const status = statusOptions.find((option) => option.value === statusValue);
    return status?.label || '';
  };

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case 'open':
        return (
          <Badge variant='outline' className='text-nowrap'>
            Otwarta
          </Badge>
        );
      case 'closed':
        return (
          <Badge
            variant='default'
            className='bg-green-100 text-nowrap text-green-800 hover:bg-green-100'
          >
            Zakończona
          </Badge>
        );
      case 'overdue':
        return (
          <Badge
            variant='destructive'
            className='bg-orange-100 text-nowrap text-orange-800 hover:bg-orange-100'
          >
            Zaległa
          </Badge>
        );
      case 'in progress':
        return (
          <Badge
            variant='default'
            className='bg-blue-100 text-nowrap text-blue-800 hover:bg-blue-100'
          >
            W trakcie
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant='destructive'
            className='bg-red-100 text-nowrap text-red-800 hover:bg-red-100'
          >
            Odrzucona
          </Badge>
        );
      default:
        return (
          <Badge variant='outline' className='text-nowrap'>
            {getStatusLabel(statusValue)}
          </Badge>
        );
    }
  };

  const onSubmit = async (
    data: z.infer<typeof confirmActionExecutionSchema>,
  ) => {
    // Close dialog immediately
    setOpen(false);

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          if (!user) {
            console.error('onSubmit', 'no user');
            reject(new Error('Brak użytkownika!'));
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
            resolve();
          } else if (res.error) {
            console.error('onSubmit', res.error);
            reject(new Error('Skontaktuj się z IT!'));
          }
        } catch (error) {
          console.error('onSubmit', error);
          reject(new Error('Skontaktuj się z IT!'));
        }
      }),
      {
        loading: 'Aktualizowanie statusu...',
        success: 'Status został zaktualizowany!',
        error: (err) => err.message || 'Skontaktuj się z IT!',
      },
    );
  };

  return (
    <>
      <TableCell>{getStatusBadge(correctiveAction.status.value)}</TableCell>

      <TableCell>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size='icon' type='button' variant='outline'>
              <ClipboardCheck className='' />
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
              user === correctiveAction.responsible ||
              userRoles?.some((role) =>
                [
                  'group-leader',
                  'quality-manager',
                  'production-manager',
                  'plant-manager',
                ].includes(role),
              ) ? (
              <>
                <DialogHeader>
                  <DialogTitle>Zmiana statusu akcji korygującej</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className='grid gap-2'>
                      <FormField
                        control={form.control}
                        name='executedAt'
                        render={({ field }) => (
                          <FormItem className='flex flex-col'>
                            <FormLabel>Data zmiany</FormLabel>
                            <FormControl>
                              <DateTimePicker
                                modal
                                hideTime
                                value={field.value}
                                onChange={field.onChange}
                                min={
                                  new Date(correctiveAction.status.executedAt)
                                }
                                max={(() => {
                                  const today = new Date();
                                  const maxDate = new Date(today);
                                  maxDate.setDate(today.getDate() + 0);
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
                      <Button type='submit'>
                        <Check className={isPending ? 'animate-spin' : ''} />{' '}
                        Potwierdź
                      </Button>
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
      <TableCell>{correctiveAction.description}</TableCell>

      <TableCell>
        {extractNameFromEmail(correctiveAction.responsible)}
      </TableCell>
      <TableCell>
        {new Date(correctiveAction.deadline).toLocaleDateString(lang)}
      </TableCell>

      <TableCell className='whitespace-nowrap'>
        {correctiveAction.status?.changed?.at
          ? new Date(correctiveAction.status.changed.at).toLocaleString(lang)
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
              <DialogTitle>Historia</DialogTitle>
            </DialogHeader>
            <ScrollArea className='my-4 h-[300px]'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Komentarz</TableHead>
                    <TableHead>Osoba</TableHead>
                    <TableHead className='text-right'>Czas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className='font-medium'>
                      {getStatusBadge(correctiveAction.status.value)}
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
                          {getStatusBadge(historyItem.value)}
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
                          {new Date(historyItem.changed.at).toLocaleString(
                            lang,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>

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
