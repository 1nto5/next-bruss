'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ColumnDef } from '@tanstack/react-table';
import {
  Check,
  Download,
  Edit,
  MoreHorizontal,
  Paperclip,
  Trash2,
  X,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useState } from 'react';
import { OvertimeSubmissionType } from '../../lib/types';
import AddAttachmentDialog from '../add-attachment-dialog';
import ApproveSubmissionDialog from '../approve-submission-dialog';
import CancelRequestDialog from '../cancel-request-dialog';
import MarkAsAccountedDialog from '../mark-as-accounted-dialog';
import RejectSubmissionDialog from '../reject-submission-dialog';

// Creating a columns factory function that takes the session
export const createColumns = (
  session: Session | null,
): ColumnDef<OvertimeSubmissionType>[] => {
  // Check user roles
  const userRoles = session?.user?.roles || [];
  const isManager = userRoles.some((role) =>
    role.toLowerCase().includes('manager'),
  );
  const isAdmin = userRoles.includes('admin');
  const isHR = userRoles.includes('hr');
  const canApprove = isManager || isAdmin || isHR;

  return [
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
        const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] =
          useState(false);
        const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
        const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
        const [isMarkAsAccountedDialogOpen, setIsMarkAsAccountedDialogOpen] =
          useState(false);
        const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

        // Get user email for permission checks
        const userEmail = session?.user?.email;
        const isAuthor = submission.submittedBy === userEmail;

        // Check permissions
        const canApproveReject =
          (submission.supervisor === userEmail || isAdmin) &&
          submission.status === 'pending';

        const canEdit = isAuthor && submission.status === 'pending';
        const canDelete = isAuthor && submission.status === 'pending';

        const canAddAttachment =
          userRoles.some(
            (role) => role.toLowerCase().includes('manager') || role === 'hr',
          ) ||
          userEmail === submission.submittedBy ||
          userEmail === submission.supervisor;

        const hasMarkAsAccountedAction =
          (isHR || isAdmin) && submission.status === 'approved';
        const hasAddAttachmentAction = submission._id && canAddAttachment;
        const hasDownloadAttachmentAction =
          submission._id && submission.hasAttachment;

        const hasActions =
          canEdit ||
          canDelete ||
          canApproveReject ||
          hasMarkAsAccountedAction ||
          hasAddAttachmentAction ||
          hasDownloadAttachmentAction;

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

                {/* Delete button for authors */}
                {canDelete && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsCancelDialogOpen(true);
                    }}
                    className='focus:bg-red-400 dark:focus:bg-red-700'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    <span>Usuń</span>
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

                {/* Add attachment button */}
                {hasAddAttachmentAction && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsAttachmentDialogOpen(true);
                    }}
                  >
                    <Paperclip className='mr-2 h-4 w-4' />
                    <span>Dodaj załącznik</span>
                  </DropdownMenuItem>
                )}

                {/* Download attachment button */}
                {hasDownloadAttachmentAction && (
                  <DropdownMenuItem asChild>
                    <Link href={`/api/overtime/download?id=${submission._id}`}>
                      <Download className='mr-2 h-4 w-4' />
                      <span>Pobierz załącznik</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialogs */}
            <AddAttachmentDialog
              isOpen={isAttachmentDialogOpen}
              onOpenChange={setIsAttachmentDialogOpen}
              submissionId={submission._id}
            />
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
        return <span>{extractNameFromEmail(email)}</span>;
      },
    },
    {
      accessorKey: 'supervisor',
      header: 'Kierownik',
      cell: ({ row }) => {
        const email = row.getValue('supervisor') as string;
        return <span>{extractNameFromEmail(email)}</span>;
      },
    },
    {
      accessorKey: 'workedDate',
      header: 'Data pracy',
      cell: ({ row }) => {
        const date = new Date(row.getValue('workedDate') as string);
        return <span>{date.toLocaleDateString('pl-PL')}</span>;
      },
    },
    {
      accessorKey: 'hoursWorked',
      header: 'Godziny',
      cell: ({ row }) => {
        const hours = row.getValue('hoursWorked') as number;
        return <span>{hours}h</span>;
      },
    },
    {
      accessorKey: 'reason',
      header: 'Uzasadnienie',
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
        return (
          <span className='max-w-[200px] truncate' title={reason}>
            {reason}
          </span>
        );
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
  ];
};
