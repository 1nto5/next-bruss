import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TableCell } from '@/components/ui/table';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import { confirmActionExecutionSchema } from '@/lib/z/deviation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { format } from 'date-fns';
import { ClipboardCheck } from 'lucide-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
}) => {
  const form = useForm<z.infer<typeof confirmActionExecutionSchema>>({
    resolver: zodResolver(confirmActionExecutionSchema),
    defaultValues: {
      additionalInfo: '',
      executionTime: new Date(new Date().setHours(12, 0, 0, 0) + 86400000),
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size='icon' type='button' variant='outline'>
                <ClipboardCheck />
              </Button>
            </AlertDialogTrigger>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='w-2/3 space-y-6'
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Jesteś pewien?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div>Czy wybrana akcja korygująca została wykonana?</div>

                      <FormField
                        control={form.control}
                        name='executionTime'
                        render={({ field }) => (
                          <FormItem className='flex flex-col gap-2'>
                            <FormLabel htmlFor='datetime'>Date time</FormLabel>
                            <FormControl>
                              <DateTimePicker
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction type='submit'>
                      Potwierdź
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </form>
            </Form>
          </AlertDialog>
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
