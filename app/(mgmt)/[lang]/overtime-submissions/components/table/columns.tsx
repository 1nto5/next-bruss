'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Edit, MoreHorizontal, X } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useState } from 'react';
import { OvertimeSubmissionType } from '../../lib/types';
import ApproveSubmissionDialog from '../approve-submission-dialog';
import CancelRequestDialog from '../cancel-request-dialog';
import MarkAsAccountedDialog from '../mark-as-accounted-dialog';
import RejectSubmissionDialog from '../reject-submission-dialog';

// Creating a columns factory function that takes the session
export const createColumns = (
  session: Session | null,
): ColumnDef<OvertimeSubmissionType>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className='flex h-full items-center justify-center'>
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
          />
        </div>
      ),
      cell: ({ row, table }) => {
        // Determine if the row can be selected for any bulk action
        const session = (table.options.meta as any)?.session;
        const userRoles = session?.user?.roles || [];
        const isAdmin = userRoles.includes('admin');
        const isHR = userRoles.includes('hr');
        const userEmail = session?.user?.email;
        const submission = row.original;
        const canApprove =
          (submission.supervisor === userEmail || isHR || isAdmin) &&
          submission.status === 'pending';
        const canReject =
          (submission.supervisor === userEmail || isHR || isAdmin) &&
          submission.status === 'pending';
        const canMarkAsAccounted =
          (isHR || isAdmin) && submission.status === 'approved';
        const canCancel =
          submission.submittedBy === userEmail &&
          submission.status === 'pending';
        const canSelect =
          canApprove || canReject || canMarkAsAccounted || canCancel;
        return (
          <div className='flex h-full items-center justify-center'>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label='Select row'
              disabled={!canSelect}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let statusLabel;

        switch (status) {
          case 'pending':
            statusLabel = (
              <Badge variant='statusPending' className='text-nowrap'>
                Oczekuje
              </Badge>
            );
            break;
          case 'approved':
            statusLabel = <Badge variant='statusApproved'>Zatwierdzone</Badge>;
            break;
          case 'rejected':
            statusLabel = <Badge variant='statusRejected'>Odrzucone</Badge>;
            break;
          case 'accounted':
            statusLabel = <Badge variant='statusAccounted'>Rozliczone</Badge>;
            break;
          case 'cancelled':
            statusLabel = <Badge variant='statusCancelled'>Anulowane</Badge>;
            break;
          default:
            statusLabel = <Badge variant='outline'>{status}</Badge>;
        }

        return statusLabel;
      },
    },
    {
      id: 'actions',
      header: 'Akcje',
      cell: ({ row }) => {
        const submission = row.original;
        // State to control dialogs
        const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
        const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
        const [isMarkAsAccountedDialogOpen, setIsMarkAsAccountedDialogOpen] =
          useState(false);
        const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

        // Get user email and roles for permission checks
        const userEmail = session?.user?.email;
        const userRoles = session?.user?.roles || [];
        const isAuthor = submission.submittedBy === userEmail;

        // Check if user has HR or admin role for emergency override
        const isHR = userRoles.includes('hr');
        const isAdmin = userRoles.includes('admin');

        // Check permissions
        const canApproveReject =
          (submission.supervisor === userEmail || isHR || isAdmin) &&
          submission.status === 'pending';

        const canEdit = isAuthor && submission.status === 'pending';
        const canDelete = isAuthor && submission.status === 'pending';

        const hasMarkAsAccountedAction =
          isHR && submission.status === 'approved';

        const hasActions =
          canEdit || canDelete || canApproveReject || hasMarkAsAccountedAction;

        if (!hasActions) {
          return null;
        }

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {/* Edit button for authors */}
                {canEdit && (
                  <Link href={`/overtime/edit/${submission._id}`}>
                    <DropdownMenuItem>
                      <Edit className='mr-2 h-4 w-4' />
                      <span>Edytuj</span>
                    </DropdownMenuItem>
                  </Link>
                )}

                {/* Cancel button for authors */}
                {canDelete && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsCancelDialogOpen(true);
                    }}
                    className='focus:bg-red-400 dark:focus:bg-red-700'
                  >
                    <X className='mr-2 h-4 w-4' />
                    <span>Anuluj</span>
                  </DropdownMenuItem>
                )}

                {/* Approve button */}
                {canApproveReject && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsApproveDialogOpen(true);
                    }}
                  >
                    <Check className='mr-2 h-4 w-4' />
                    <span>Zatwierdź</span>
                  </DropdownMenuItem>
                )}

                {/* Reject button */}
                {canApproveReject && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsRejectDialogOpen(true);
                    }}
                    className='focus:bg-red-400 dark:focus:bg-red-700'
                  >
                    <X className='mr-2 h-4 w-4' />
                    <span>Odrzuć</span>
                  </DropdownMenuItem>
                )}

                {/* Mark as accounted button */}
                {hasMarkAsAccountedAction && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsMarkAsAccountedDialogOpen(true);
                    }}
                  >
                    <Check className='mr-2 h-4 w-4' />
                    <span>Oznacz jako rozliczone</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialogs */}
            <ApproveSubmissionDialog
              isOpen={isApproveDialogOpen}
              onOpenChange={setIsApproveDialogOpen}
              submissionId={submission._id}
              session={session}
            />
            <RejectSubmissionDialog
              isOpen={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
              submissionId={submission._id}
              session={session}
            />
            <MarkAsAccountedDialog
              isOpen={isMarkAsAccountedDialogOpen}
              onOpenChange={setIsMarkAsAccountedDialogOpen}
              submissionId={submission._id}
              session={session}
            />
            <CancelRequestDialog
              isOpen={isCancelDialogOpen}
              onOpenChange={setIsCancelDialogOpen}
              requestId={submission._id}
            />
          </>
        );
      },
    },
    {
      accessorKey: 'submittedBy',
      header: 'Zgłaszający',
      cell: ({ row }) => {
        const email = row.getValue('submittedBy') as string;
        return (
          <span className='whitespace-nowrap'>
            {extractNameFromEmail(email)}
          </span>
        );
      },
    },
    {
      accessorKey: 'supervisor',
      header: 'Kierownik',
      cell: ({ row }) => {
        const email = row.getValue('supervisor') as string;
        return (
          <span className='whitespace-nowrap'>
            {extractNameFromEmail(email)}
          </span>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date') as string);
        return <span>{date.toLocaleDateString('pl-PL')}</span>;
      },
    },
    {
      accessorKey: 'hours',
      header: 'Godziny',
      cell: ({ row }) => {
        const hours = row.getValue('hours') as number;
        return (
          <span className={hours < 0 ? 'text-red-600 dark:text-red-400' : ''}>
            {hours}h
          </span>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Uzasadnienie',
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
        return <div className='w-[250px] text-justify'>{reason}</div>;
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Data zgłoszenia',
      cell: ({ row }) => {
        const date = new Date(row.getValue('submittedAt') as string);
        return (
          <span>
            {date.toLocaleDateString('pl-PL')}{' '}
            {date.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'editedAt',
      header: 'Data edycji',
      cell: ({ row }) => {
        const date = row.getValue('editedAt') as Date;
        if (!date) return <span>-</span>;
        return (
          <span>
            {date.toLocaleDateString('pl-PL')}{' '}
            {date.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'editedBy',
      header: 'Edytował',
      cell: ({ row }) => {
        const email = row.getValue('editedBy') as string;
        if (!email) return <span>-</span>;
        return (
          <span className='whitespace-nowrap'>
            {extractNameFromEmail(email)}
          </span>
        );
      },
    },
    {
      accessorKey: 'approvedAt',
      header: 'Data zatwierdzenia',
      cell: ({ row }) => {
        const date = row.getValue('approvedAt') as Date;
        if (!date) return <span>-</span>;
        return (
          <span>
            {date.toLocaleDateString('pl-PL')}{' '}
            {date.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'approvedBy',
      header: 'Zatwierdził',
      cell: ({ row }) => {
        const email = row.getValue('approvedBy') as string;
        if (!email) return <span>-</span>;
        return (
          <span className='whitespace-nowrap'>
            {extractNameFromEmail(email)}
          </span>
        );
      },
    },
    {
      accessorKey: 'rejectedAt',
      header: 'Data odrzucenia',
      cell: ({ row }) => {
        const date = row.getValue('rejectedAt') as Date;
        if (!date) return <span>-</span>;
        return (
          <span>
            {date.toLocaleDateString('pl-PL')}{' '}
            {date.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },

    {
      accessorKey: 'rejectionReason',
      header: 'Powód odrzucenia',
      cell: ({ row }) => {
        const reason = row.getValue('rejectionReason') as string;
        if (!reason) return <span>-</span>;
        return <div className='w-[250px] text-justify'>{reason}</div>;
      },
    },
    {
      accessorKey: 'accountedAt',
      header: 'Data rozliczenia',
      cell: ({ row }) => {
        const date = row.getValue('accountedAt') as Date;
        if (!date) return <span>-</span>;
        return (
          <span>
            {date.toLocaleDateString('pl-PL')}{' '}
            {date.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'accountedBy',
      header: 'Rozliczył',
      cell: ({ row }) => {
        const email = row.getValue('accountedBy') as string;
        if (!email) return <span>-</span>;
        return (
          <span className='whitespace-nowrap'>
            {extractNameFromEmail(email)}
          </span>
        );
      },
    },
  ];
};
