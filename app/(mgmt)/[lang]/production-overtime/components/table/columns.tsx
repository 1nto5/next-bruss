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
import { toast } from 'sonner';
import { approveOvertimeRequest as approve } from '../../actions';
import { OvertimeType } from '../../lib/types';
import AddAttachmentDialog from '../add-attachment-dialog';
import CancelRequestDialog from '../cancel-request-dialog';

const handleApprove = async (id: string, session: Session | null) => {
  // Check if user has plant-manager role
  const isPlantManager = session?.user?.roles?.includes('plant-manager');

  if (!isPlantManager) {
    toast.error('Tylko kierownik zakładu może zatwierdzać zlecenia!');
    return;
  }

  toast.promise(
    approve(id).then((res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      return res;
    }),
    {
      loading: 'Zapisuję zmiany...',
      success: 'Zlecenie zatwierdzone!',
      error: (error) => {
        const errorMsg = error.message;
        if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
        if (errorMsg === 'not found') return 'Nie znaleziono zlecenia!';
        console.error('handleApprove', errorMsg);
        return 'Skontaktuj się z IT!';
      },
    },
  );
};

// Creating a columns factory function that takes the session
export const createColumns = (
  session: Session | null,
): ColumnDef<OvertimeType>[] => {
  // Check if the user has plant-manager role
  const isPlantManager = session?.user?.roles?.includes('plant-manager');

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

        // Check if user can cancel the request
        const canCancel =
          request._id &&
          request.status !== 'closed' &&
          request.status !== 'canceled' &&
          (request.requestedBy === session?.user?.email || isPlantManager);

        // Check if there are any actions available
        const hasOvertimePickupAction = request.status !== 'canceled';
        const hasApproveAction = isPlantManager && request.status === 'pending'; // Only pending requests can be approved
        const hasAddAttachmentAction =
          request._id && request.status === 'approved';
        const hasDownloadAttachmentAction =
          request._id && request.hasAttachment;

        const hasActions =
          hasOvertimePickupAction ||
          hasApproveAction ||
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
                    {/* Only show approve button if user is plant manager */}
                    {isPlantManager &&
                      request.status !== 'approved' &&
                      request.status !== 'closed' && (
                        <DropdownMenuItem
                          onClick={() =>
                            request._id && handleApprove(request._id, session)
                          }
                        >
                          <Check className='mr-2 h-4 w-4' />
                          <span>Zatwierdź</span>
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

                {/* Add attachment button - only for approved orders */}
                {request._id && request.status === 'approved' && (
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
                  overTimeRequestId={request._id}
                  overTimeRequestStatus='open'
                  overTimeRequestOwner={request.requestedBy}
                  session={session}
                  isOpen={isAttachmentDialogOpen}
                  onOpenChange={setIsAttachmentDialogOpen}
                />
                <CancelRequestDialog
                  isOpen={isCancelDialogOpen}
                  onOpenChange={setIsCancelDialogOpen}
                  requestId={request._id}
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
        const approvedAtLocaleString = row.original.approvedAtLocaleString;
        return (
          <div>
            {approvedAtLocaleString ? `${approvedAtLocaleString}` : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'fromLocaleString',
      header: 'Od',
    },
    {
      accessorKey: 'toLocaleString',
      header: 'Do',
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
      accessorKey: 'canceledAtLocaleString',
      header: 'Data anulowania',
      cell: ({ row }) => {
        const canceledAtLocaleString = row.original.canceledAtLocaleString;
        return (
          <div>
            {canceledAtLocaleString ? `${canceledAtLocaleString}` : '-'}
          </div>
        );
      },
    },
  ];
};
