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
import { formatDate, formatTime } from '@/lib/utils/date-format';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Edit, FileText, MoreHorizontal, X } from 'lucide-react';
import { Session } from 'next-auth';
import { useState } from 'react';
import LocalizedLink from '@/components/localized-link';
import { OvertimeSubmissionType } from '../../lib/types';
import ApproveSubmissionDialog from '../approve-submission-dialog';
import CancelRequestDialog from '../cancel-request-dialog';
import MarkAsAccountedDialog from '../mark-as-accounted-dialog';
import RejectSubmissionDialog from '../reject-submission-dialog';
import { Dictionary } from '../../lib/dict';

// Creating a columns factory function that takes the session and dict
export const createColumns = (
  session: Session | null,
  dict: Dictionary,
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
      accessorKey: 'internalId',
      header: 'ID',
      cell: ({ row }) => {
        const internalId = row.getValue('internalId') as string;
        return <div>{internalId || ''}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: dict.columns.status,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let statusLabel;

        switch (status) {
          case 'pending':
            statusLabel = (
              <Badge variant='statusPending' className='text-nowrap'>
                {dict.status.pending}
              </Badge>
            );
            break;
          case 'pending-plant-manager':
            statusLabel = (
              <Badge
                variant='statusPending'
                className='bg-yellow-400 text-nowrap text-black'
              >
                {dict.status.pendingPlantManager}
              </Badge>
            );
            break;
          case 'approved':
            statusLabel = <Badge variant='statusApproved'>{dict.status.approved}</Badge>;
            break;
          case 'rejected':
            statusLabel = <Badge variant='statusRejected'>{dict.status.rejected}</Badge>;
            break;
          case 'accounted':
            statusLabel = <Badge variant='statusAccounted'>{dict.status.accounted}</Badge>;
            break;
          case 'cancelled':
            statusLabel = <Badge variant='statusCancelled'>{dict.status.cancelled}</Badge>;
            break;
          default:
            statusLabel = <Badge variant='outline'>{status}</Badge>;
        }

        return statusLabel;
      },
    },
    // Settlement type column (Zlecenie)
    {
      accessorKey: 'payment',
      header: dict.columns.payment,
      cell: ({ row }) => {
        const payment = row.original.payment as boolean;
        const scheduledDayOff = row.original.scheduledDayOff;

        let displayText = '-';
        if (payment) {
          displayText = 'wypłata';
        } else if (scheduledDayOff) {
          const formattedDate = formatDate(scheduledDayOff);
          displayText = `odbiór: ${formattedDate}`;
        }

        return (
          <div className='text-center text-sm'>
            {displayText}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: dict.columns.actions,
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
        const canApprovePlantManager =
          (userRoles.includes('plant-manager') || isAdmin) &&
          (submission.status as string) === 'pending-plant-manager';

        // Edit permissions:
        // - Author can edit when status is pending
        // - HR/Admin can edit regardless of status
        const canEdit =
          (isAuthor && submission.status === 'pending') || isHR || isAdmin;
        const canDelete = isAuthor && submission.status === 'pending';

        const hasMarkAsAccountedAction =
          (isHR || isAdmin) && submission.status === 'approved';

        const hasActions =
          canEdit ||
          canDelete ||
          canApproveReject ||
          canApprovePlantManager ||
          hasMarkAsAccountedAction;

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
                {/* View Details - always available as first option */}
                <LocalizedLink href={`/overtime-submissions/${submission._id}`}>
                  <DropdownMenuItem>
                    <FileText className='mr-2 h-4 w-4' />
                    <span>{dict.actions.viewDetails}</span>
                  </DropdownMenuItem>
                </LocalizedLink>

                {/* Edit button for authors */}
                {canEdit && (
                  <LocalizedLink href={`/overtime-submissions/edit/${submission._id}`}>
                    <DropdownMenuItem>
                      <Edit className='mr-2 h-4 w-4' />
                      <span>{dict.actions.edit}</span>
                    </DropdownMenuItem>
                  </LocalizedLink>
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
                    <span>{dict.actions.cancel}</span>
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
                    <span>{dict.actions.approve}</span>
                  </DropdownMenuItem>
                )}
                {/* Plant Manager Approve button */}
                {canApprovePlantManager && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsApproveDialogOpen(true);
                    }}
                  >
                    <Check className='mr-2 h-4 w-4' />
                    <span>{dict.actions.approvePlantManager}</span>
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
                    <span>{dict.actions.reject}</span>
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
                    <span>{dict.actions.markAsAccounted}</span>
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
              dict={dict}
            />
            <RejectSubmissionDialog
              isOpen={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
              submissionId={submission._id}
              session={session}
              dict={dict}
            />
            <MarkAsAccountedDialog
              isOpen={isMarkAsAccountedDialogOpen}
              onOpenChange={setIsMarkAsAccountedDialogOpen}
              submissionId={submission._id}
              session={session}
              dict={dict}
            />
            <CancelRequestDialog
              isOpen={isCancelDialogOpen}
              onOpenChange={setIsCancelDialogOpen}
              requestId={submission._id}
              dict={dict}
            />
          </>
        );
      },
    },
    {
      accessorKey: 'submittedBy',
      header: dict.columns.submittedBy,
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
      header: dict.columns.supervisor,
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
      header: dict.columns.date,
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return <span>{formatDate(date)}</span>;
      },
    },
    {
      accessorKey: 'hours',
      header: dict.columns.hours,
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
      header: dict.columns.reason,
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string | undefined;
        if (!reason) return <div className='max-w-[200px]'>-</div>;
        const truncated = reason.length > 80
          ? `${reason.substring(0, 80)}...`
          : reason;
        return <div className='max-w-[200px]'>{truncated}</div>;
      },
    },
  ];
};
