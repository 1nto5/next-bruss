import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, History, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ApprovalHistoryType } from '../lib/types';
import { rejectDeviationSchema } from '../lib/zod';

type TableCellApproveRoleProps = {
  roleText: string;
  deviationUserRoles: string[];
  role: string;
  approved: boolean | undefined;
  handleApproval: (isApproved: boolean, reason?: string) => void;
  by: string | undefined;
  at: string | undefined;
  lang: string;
  isPendingApproval: boolean;
  reason?: string;
  history?: ApprovalHistoryType[];
};

const TableCellsApprove: React.FC<TableCellApproveRoleProps> = ({
  roleText,
  deviationUserRoles,
  role,
  approved,
  handleApproval,
  by,
  at,
  lang,
  isPendingApproval,
  reason,
  history,
}) => {
  const [openReject, setOpenReject] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  const form = useForm<z.infer<typeof rejectDeviationSchema>>({
    resolver: zodResolver(rejectDeviationSchema),
    defaultValues: {
      reason: '',
    },
  });

  // Sprawdzamy, czy użytkownik ma wymaganą rolę wśród swoich ról
  const hasRole = deviationUserRoles.includes(role);

  const onSubmit = (data: z.infer<typeof rejectDeviationSchema>) => {
    handleApproval(false, data.reason);
    setOpenReject(false);
    form.reset();
  };

  // Determine the status to display
  const getStatusBadge = () => {
    if (approved === undefined) {
      return (
        <Badge variant='outline' className='text-nowrap'>
          Brak decyzji
        </Badge>
      );
    } else if (approved) {
      return (
        <Badge
          variant='default'
          className='bg-green-100 text-green-800 hover:bg-green-100'
        >
          Zatwierdził
        </Badge>
      );
    } else {
      return (
        <Badge
          variant='destructive'
          className='bg-red-100 text-red-800 hover:bg-red-100'
        >
          Odrzucił
        </Badge>
      );
    }
  };

  return (
    <>
      <TableCell>{getStatusBadge()}</TableCell>
      <TableCell className='text-nowrap'>{roleText}</TableCell>

      <TableCell className='flex gap-2'>
        {hasRole && (
          <>
            {/* Allow approval when not already approved (either undefined or rejected) */}
            {approved !== true && (
              <Dialog open={openApprove} onOpenChange={setOpenApprove}>
                <DialogTrigger asChild>
                  <Button
                    size='icon'
                    type='button'
                    variant='outline'
                    className='bg-green-100 hover:bg-green-200'
                  >
                    <ThumbsUp color='green' />
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[425px]'>
                  <DialogHeader>
                    <DialogTitle>Jesteś pewien?</DialogTitle>
                    <DialogDescription>
                      Czy na pewno chcesz zatwierdzić to odchylenie?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className='pt-4'>
                    <Button
                      onClick={() => {
                        handleApproval(true);
                        setOpenApprove(false);
                      }}
                    >
                      <Check />
                      Zatwierdzam
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Only show reject button when not already decided (undefined) */}
            {approved === undefined && (
              <Dialog open={openReject} onOpenChange={setOpenReject}>
                <DialogTrigger asChild>
                  <Button
                    size='icon'
                    type='button'
                    variant='outline'
                    className='bg-red-100 hover:bg-red-200'
                  >
                    <ThumbsDown color='red' />
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[425px]'>
                  <DialogHeader>
                    <DialogTitle>Odrzuć odchylenie</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <div className='grid gap-2'>
                        <FormField
                          control={form.control}
                          name='reason'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Powód</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter className='pt-4'>
                        <Button type='submit'>
                          <Check />
                          Odrzuć
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
        {(!hasRole || (approved === true && approved !== undefined)) && '-'}
      </TableCell>
      <TableCell className='whitespace-nowrap'>
        {(by && extractNameFromEmail(by)) || '-'}
      </TableCell>
      <TableCell className='whitespace-nowrap'>
        {at ? new Date(at).toLocaleString(lang) : '-'}
      </TableCell>
      <TableCell className='min-w-[250px]'>
        {!approved && reason ? reason : '-'}
      </TableCell>
      <TableCell>
        {history && history.length > 0 ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button size='icon' type='button' variant='outline'>
                <History />
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[768px]'>
              <DialogHeader>
                <DialogTitle>Historia</DialogTitle>
                <DialogDescription>{roleText}</DialogDescription>
              </DialogHeader>
              <ScrollArea className='my-4 h-[300px]'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Osoba</TableHead>
                      <TableHead>Powód</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className='font-medium'>
                          {item.approved ? (
                            <Badge
                              variant='default'
                              className='bg-green-100 text-green-800 hover:bg-green-100'
                            >
                              Zatwierdził
                            </Badge>
                          ) : (
                            <Badge
                              variant='destructive'
                              className='bg-red-100 text-red-800 hover:bg-red-100'
                            >
                              Odrzucił
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className='whitespace-nowrap'>
                            {new Date(item.at).toLocaleString(lang)}
                          </span>
                        </TableCell>
                        <TableCell>{extractNameFromEmail(item.by)}</TableCell>
                        <TableCell>
                          {!item.approved && item.reason ? item.reason : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        ) : (
          '-'
        )}
      </TableCell>
    </>
  );
};

export default TableCellsApprove;
