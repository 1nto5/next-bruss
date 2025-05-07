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
  reason?: string;
  history?: ApprovalHistoryType[];
  deviationStatus?: string; // Add deviation status prop
};

// Define valid approval roles
type ApprovalRole =
  | 'group-leader'
  | 'quality-manager'
  | 'production-manager'
  | 'plant-manager';

// Role elevation mapping - use type to ensure keys are valid roles
const ROLE_ELEVATIONS: Record<ApprovalRole, ApprovalRole[]> = {
  'plant-manager': [
    'plant-manager',
    'group-leader',
    'quality-manager',
    'production-manager',
  ], // Plant managers can approve as any role
  'production-manager': ['group-leader', 'production-manager'],
  'group-leader': ['group-leader'],
  'quality-manager': ['quality-manager'],
};

// Role display names
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  'group-leader': 'Group Leader',
  'quality-manager': 'Kierownik Jakości',
  'production-manager': 'Kierownik Produkcji',
  'plant-manager': 'Dyrektor Zakładu',
};

// List of statuses where approval actions should be disabled
const DISABLED_APPROVAL_STATUSES = ['in progress', 'approved', 'closed'];

const TableCellsApprove: React.FC<TableCellApproveRoleProps> = ({
  roleText,
  deviationUserRoles,
  role,
  approved,
  handleApproval,
  by,
  at,
  lang,
  reason,
  history,
  deviationStatus,
}) => {
  const [openReject, setOpenReject] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  // Create a form for the approval dialog with comment field
  const approvalForm = useForm({
    defaultValues: {
      comment: '',
    },
  });

  const form = useForm<z.infer<typeof rejectDeviationSchema>>({
    resolver: zodResolver(rejectDeviationSchema),
    defaultValues: {
      reason: '',
    },
  });

  // Get all roles the user can approve as (including elevated roles)
  const getElevatedRoles = (): string[] => {
    // If user has 'plant-manager' role, allow them to approve as any role
    // (actual vacancy check will happen in the server action)
    if (deviationUserRoles.includes('plant-manager')) {
      return [role]; // Return the current role being rendered
    }

    // Start with the current role if the user has it directly
    let availableRoles = deviationUserRoles.includes(role) ? [role] : [];

    // Add elevated roles
    for (const userRole of deviationUserRoles) {
      // Type guard to ensure userRole is a valid key
      if (userRole in ROLE_ELEVATIONS) {
        const elevatedRoles = ROLE_ELEVATIONS[userRole as ApprovalRole];
        if (elevatedRoles && elevatedRoles.includes(role as ApprovalRole)) {
          availableRoles.push(userRole);
        }
      }
    }

    // Return array with unique values instead of using Set
    return availableRoles.filter((v, i, a) => a.indexOf(v) === i);
  };

  // Check if user has role or elevated privileges
  const availableRoles = getElevatedRoles();
  const hasRolePrivilege = availableRoles.length > 0;

  // Check if approval actions should be disabled based on deviation status
  const isApprovalDisabled = DISABLED_APPROVAL_STATUSES.includes(
    deviationStatus || '',
  );

  const onSubmit = (data: z.infer<typeof rejectDeviationSchema>) => {
    handleApproval(false, data.reason);
    setOpenReject(false);
    form.reset();
  };

  // Handle approve with comment
  const handleApproveWithComment = () => {
    const comment = approvalForm.getValues().comment;
    handleApproval(true, comment);
    setOpenApprove(false);
    approvalForm.reset();
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

      <TableCell>
        <div className='flex items-center gap-2'>
          {hasRolePrivilege && !isApprovalDisabled && (
            <>
              {/* Allow approval when not already approved (either undefined or rejected) */}
              {approved !== true && (
                <Dialog open={openApprove} onOpenChange={setOpenApprove}>
                  <DialogTrigger asChild>
                    <Button
                      size='icon'
                      type='button'
                      variant='outline'
                      className='bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800'
                      disabled={
                        role !== 'plant-manager' &&
                        deviationUserRoles.includes('plant-manager-approval') &&
                        !deviationUserRoles.includes('plant-manager')
                      }
                      title={
                        role !== 'plant-manager' &&
                        deviationUserRoles.includes('plant-manager-approval') &&
                        !deviationUserRoles.includes('plant-manager')
                          ? 'Decyzja niemożliwa - odchylenie zostało już zatwierdzone przez Dyrektora Zakładu'
                          : 'Zatwierdź odchylenie'
                      }
                    >
                      <ThumbsUp color='green' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>Zatwierdzenie odchylenia</DialogTitle>
                      <DialogDescription>
                        Czy na pewno chcesz zatwierdzić to odchylenie jako{' '}
                        {roleText}?
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...approvalForm}>
                      <div className='grid gap-2'>
                        <FormField
                          control={approvalForm.control}
                          name='comment'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Komentarz</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <DialogFooter className='pt-4'>
                        <Button onClick={handleApproveWithComment}>
                          <Check />
                          Zatwierdzam
                        </Button>
                      </DialogFooter>
                    </Form>
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
                      className='bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800'
                      disabled={
                        role !== 'plant-manager' &&
                        deviationUserRoles.includes('plant-manager-approval') &&
                        !deviationUserRoles.includes('plant-manager')
                      }
                      title={
                        role !== 'plant-manager' &&
                        deviationUserRoles.includes('plant-manager-approval') &&
                        !deviationUserRoles.includes('plant-manager')
                          ? 'Decyzja niemożliwa - odchylenie zostało już zatwierdzone przez Dyrektora Zakładu'
                          : 'Odrzuć odchylenie'
                      }
                    >
                      <ThumbsDown color='red' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>Odrzuć odchylenie</DialogTitle>
                      {deviationUserRoles.includes('plant-manager') &&
                        role !== 'plant-manager' && (
                          <DialogDescription className='font-semibold text-yellow-600'>
                            Odrzucasz jako Dyrektor Zakładu w roli: {roleText}
                          </DialogDescription>
                        )}
                    </DialogHeader>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='grid gap-2'>
                          <FormField
                            control={form.control}
                            name='reason'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Komentarz</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter className='flex items-center justify-end pt-4'>
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
          {(!hasRolePrivilege ||
            (approved === true && approved !== undefined) ||
            isApprovalDisabled) &&
            '-'}
        </div>
      </TableCell>
      <TableCell className='whitespace-nowrap'>
        {(by && extractNameFromEmail(by)) || '-'}
      </TableCell>
      <TableCell className='whitespace-nowrap'>
        {at ? new Date(at).toLocaleString(lang) : '-'}
      </TableCell>
      <TableCell className='min-w-[250px]'>{reason ? reason : '-'}</TableCell>
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
                      <TableHead>Komentarz</TableHead>
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
                        <TableCell>
                          <span className='text-nowrap'>
                            {extractNameFromEmail(item.by)}
                          </span>
                        </TableCell>
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
