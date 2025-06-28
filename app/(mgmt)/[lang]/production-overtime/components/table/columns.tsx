'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClientLocaleString } from '@/lib/client-date-utils';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ColumnDef } from '@tanstack/react-table';
import {
  CalendarClock,
  Check,
  Download,
  MoreHorizontal,
  Paperclip,
  X,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useState } from 'react';
import { OvertimeType } from '../../lib/types';
import AddAttachmentDialog from '../add-attachment-dialog';
import ApproveRequestDialog from '../approve-request-dialog';
import CancelRequestDialog from '../cancel-request-dialog';
import MarkAsAccountedDialog from '../mark-as-accounted-dialog';

// Creating a columns factory function that takes the session
export const createColumns = (
  session: Session | null,
): ColumnDef<OvertimeType>[] => {
  // Check if the user has plant-manager or admin role
  const isPlantManager = session?.user?.roles?.includes('plant-manager');
  const isAdmin = session?.user?.roles?.includes('admin');
  const isHR = session?.user?.roles?.includes('hr');
  const canApprove = isPlantManager || isAdmin;

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
          case 'canceled':
            statusLabel = <Badge variant='statusRejected'>Anulowane</Badge>;
            break;
          case 'closed':
            statusLabel = <Badge variant='statusClosed'>Zamknięte</Badge>;
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
        const request = row.original;
        // State to control the attachment dialog
        const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] =
          useState(false);
        // State to control the cancel dialog
        const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
        // State to control the mark as accounted dialog
        const [isMarkAsAccountedDialogOpen, setIsMarkAsAccountedDialogOpen] =
          useState(false);
        // State to control the approve dialog
        const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

        // Get user roles and email for permission checks
        const userRoles = session?.user?.roles || [];
        const userEmail = session?.user?.email;

        // Check if user can cancel the request
        const canCancel =
          request._id &&
          request.status !== 'closed' &&
          request.status !== 'canceled' &&
          request.status !== 'accounted' &&
          (request.requestedBy === userEmail ||
            isPlantManager ||
            isAdmin ||
            userRoles.includes('group-leader') ||
            userRoles.includes('production-manager') ||
            userRoles.includes('hr'));

        // Check if user can add attachment (same logic as in AddAttachmentDialog)
        const canAddAttachment =
          userRoles.some((role) =>
            [
              'group-leader',
              'production-manager',
              'plant-manager',
              'hr',
            ].includes(role),
          ) ||
          userEmail === request.requestedBy ||
          userEmail === request.responsibleEmployee;

        // Check if there are any actions available
        const hasOvertimePickupAction = request.status !== 'canceled';
        const hasApproveAction = canApprove && request.status === 'pending'; // Only pending requests can be approved
        const hasMarkAsAccountedAction = isHR && request.status === 'closed'; // Only closed requests can be marked as accounted
        const hasAddAttachmentAction =
          request._id && request.status === 'approved' && canAddAttachment;
        const hasDownloadAttachmentAction =
          request._id && request.hasAttachment;

        const hasActions =
          hasOvertimePickupAction ||
          hasApproveAction ||
          hasMarkAsAccountedAction ||
          canCancel ||
          hasAddAttachmentAction ||
          hasDownloadAttachmentAction;

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {request.status !== 'canceled' && (
                  <>
                    <Link href={`/production-overtime/${request._id}`}>
                      <DropdownMenuItem>
                        <CalendarClock className='mr-2 h-4 w-4' />
                        <span>Odbiór nadgodzin</span>
                      </DropdownMenuItem>
                    </Link>
                    {/* Only show approve button if user can approve */}
                    {canApprove &&
                      request.status !== 'approved' &&
                      request.status !== 'closed' &&
                      request.status !== 'accounted' && (
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
                    {/* Mark as accounted button - only for HR and approved requests */}
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
                  </>
                )}

                {/* Cancel button - show for non-completed requests */}
                {canCancel && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsCancelDialogOpen(true);
                    }}
                    className='focus:bg-red-400 dark:focus:bg-red-700'
                  >
                    <X className='mr-2 h-4 w-4' />
                    <span>Anuluj zlecenie</span>
                  </DropdownMenuItem>
                )}

                {/* Add attachment button - only for approved orders and authorized users */}
                {hasAddAttachmentAction && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsAttachmentDialogOpen(true);
                    }}
                  >
                    <Paperclip className='mr-2 h-4 w-4' />
                    <span>Dodaj listę obecności</span>
                  </DropdownMenuItem>
                )}

                {/* Download attachment button - show if attachment exists */}
                {request._id && request.hasAttachment && (
                  <Link
                    href={`/api/production-overtime/download?overTimeRequestId=${request._id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <DropdownMenuItem>
                      <Download className='mr-2 h-4 w-4' />
                      <span>Pobierz listę obecności</span>
                    </DropdownMenuItem>
                  </Link>
                )}

                {/* Show "No Action" when no actions are available */}
                {!hasActions && (
                  <DropdownMenuItem disabled>
                    <span>Brak akcji</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialog outside of DropdownMenuContent */}
            {request._id && (
              <>
                <AddAttachmentDialog
                  id={request._id}
                  status={request.status}
                  owner={request.requestedBy}
                  responsibleEmployee={request.responsibleEmployee}
                  session={session}
                  isOpen={isAttachmentDialogOpen}
                  onOpenChange={setIsAttachmentDialogOpen}
                />
                <CancelRequestDialog
                  isOpen={isCancelDialogOpen}
                  onOpenChange={setIsCancelDialogOpen}
                  requestId={request._id}
                />
                <ApproveRequestDialog
                  isOpen={isApproveDialogOpen}
                  onOpenChange={setIsApproveDialogOpen}
                  requestId={request._id}
                  session={session}
                />
                <MarkAsAccountedDialog
                  isOpen={isMarkAsAccountedDialogOpen}
                  onOpenChange={setIsMarkAsAccountedDialogOpen}
                  requestId={request._id}
                  session={session}
                />
              </>
            )}
          </>
        );
      },
    },
    {
      accessorKey: 'approved',
      header: 'Data zatwierdzenia',
      cell: ({ row }) => {
        const approvedAt = row.original.approvedAt;
        const approvedAtString = useClientLocaleString(approvedAt);
        return <div>{approvedAtString}</div>;
      },
    },
    {
      accessorKey: 'fromLocaleString',
      header: 'Od',
      cell: ({ row }) => {
        const from = row.original.from;
        const fromString = useClientLocaleString(from);
        return <div>{fromString}</div>;
      },
    },
    {
      accessorKey: 'toLocaleString',
      header: 'Do',
      cell: ({ row }) => {
        const to = row.original.to;
        const toString = useClientLocaleString(to);
        return <div>{toString}</div>;
      },
    },
    {
      id: 'totalHours',
      header: 'Liczba godzin',
      cell: ({ row }) => {
        const fromDate = new Date(row.original.from);
        const toDate = new Date(row.original.to);
        const totalHours =
          Math.round(
            ((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60)) * 100,
          ) / 100;
        return <div>{totalHours > 0 ? `${totalHours}h` : '-'}</div>;
      },
    },
    {
      accessorKey: 'numberOfEmployees',
      header: 'Liczba pracowników',
      cell: ({ row }) => {
        const numberOfEmployees = row.getValue('numberOfEmployees') as number;
        return <div>{numberOfEmployees || 0}</div>;
      },
    },
    {
      accessorKey: 'employeesWithScheduledDayOff',
      header: 'Odbiór dnia wolnego',
      cell: ({ row }) => {
        const employees = row.getValue('employeesWithScheduledDayOff');
        return <div>{Array.isArray(employees) ? employees.length : 0}</div>;
      },
    },
    {
      accessorKey: 'reason',
      header: 'Uzasadnienie',
      cell: ({ row }) => {
        const reason = row.getValue('reason');
        return <div className='w-[250px] text-justify'>{reason as string}</div>;
      },
    },
    {
      accessorKey: 'note',
      header: 'Dod. info.',
      cell: ({ row }) => {
        const note = row.getValue('note');
        return <div className='w-[250px] text-justify'>{note as string}</div>;
      },
    },
    {
      accessorKey: 'requestedAtLocaleString',
      header: 'Data wystawienia',
      cell: ({ row }) => {
        const requestedAt = row.original.requestedAt;
        const requestedAtString = useClientLocaleString(requestedAt);
        return <div>{requestedAtString}</div>;
      },
    },
    {
      accessorKey: 'requestedBy',
      header: 'Wystawione przez',
      cell: ({ row }) => {
        const requestedBy = row.getValue('requestedBy');
        return (
          <div className='whitespace-nowrap'>
            {extractNameFromEmail(requestedBy as string)}
          </div>
        );
      },
    },
    {
      accessorKey: 'responsibleEmployee',
      header: 'Osoba odpowiedzialna',
      cell: ({ row }) => {
        const responsibleEmployee = row.getValue('responsibleEmployee');
        return (
          <div className='whitespace-nowrap'>
            {extractNameFromEmail(responsibleEmployee as string)}
          </div>
        );
      },
    },
    {
      accessorKey: 'editedBy',
      header: 'Zmodyfikowane przez',
      cell: ({ row }) => {
        const editedBy = row.original.editedBy;
        return (
          <div className='whitespace-nowrap'>
            {editedBy ? extractNameFromEmail(editedBy) : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'editedAtLocaleString',
      header: 'Data modyfikacji',
      cell: ({ row }) => {
        const editedAt = row.original.editedAt;
        const editedAtString = useClientLocaleString(editedAt);
        return <div>{editedAtString}</div>;
      },
    },
    {
      accessorKey: 'canceledBy',
      header: 'Anulowane przez',
      cell: ({ row }) => {
        const canceledBy = row.original.canceledBy;
        return (
          <div className='whitespace-nowrap'>
            {canceledBy ? extractNameFromEmail(canceledBy) : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'closedBy',
      header: 'Zamknięte przez',
      cell: ({ row }) => {
        const closedBy = row.original.closedBy;
        return (
          <div className='whitespace-nowrap'>
            {closedBy ? extractNameFromEmail(closedBy) : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'closedAtLocaleString',
      header: 'Data zamknięcia',
      cell: ({ row }) => {
        const closedAt = row.original.closedAt;
        const closedAtString = useClientLocaleString(closedAt);
        return <div>{closedAtString}</div>;
      },
    },
    {
      accessorKey: 'accountedBy',
      header: 'Rozliczone przez',
      cell: ({ row }) => {
        const accountedBy = row.original.accountedBy;
        return (
          <div className='whitespace-nowrap'>
            {accountedBy ? extractNameFromEmail(accountedBy) : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'accountedAtLocaleString',
      header: 'Data rozliczenia',
      cell: ({ row }) => {
        const accountedAt = row.original.accountedAt;
        const accountedAtString = useClientLocaleString(accountedAt);
        return <div>{accountedAtString}</div>;
      },
    },
    {
      accessorKey: 'canceledAtLocaleString',
      header: 'Data anulowania',
      cell: ({ row }) => {
        const canceledAt = row.original.canceledAt;
        const canceledAtString = useClientLocaleString(canceledAt);
        return <div>{canceledAtString}</div>;
      },
    },
  ];
};
