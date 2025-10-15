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
import { formatDateTime } from '@/lib/utils/date-format';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  CalendarClock,
  Check,
  CheckCircle,
  Download,
  Edit,
  FileText,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { Session } from 'next-auth';
import { useState } from 'react';
import Link from 'next/link';
import LocalizedLink from '@/components/localized-link';
import { Dictionary } from '../../lib/dict';
import { DepartmentConfig, OvertimeType } from '../../lib/types';
import {
  bulkDeleteOvertimeRequests,
  bulkReactivateOvertimeRequests,
} from '../../actions';
import ApproveRequestDialog from '../approve-request-dialog';
import CancelRequestDialog from '../cancel-request-dialog';
import MarkAsAccountedDialog from '../mark-as-accounted-dialog';

// Creating a columns factory function that takes the session, dict, and departments
export const createColumns = (
  session: Session | null,
  dict: Dictionary,
  departments?: DepartmentConfig[],
): ColumnDef<OvertimeType>[] => {
  // Check if the user has plant-manager or admin role
  const isPlantManager = session?.user?.roles?.includes('plant-manager');
  const isAdmin = session?.user?.roles?.includes('admin');
  const isHR = session?.user?.roles?.includes('hr');
  const canApprove = isPlantManager || isAdmin;

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
        const isPlantManager = userRoles.includes('plant-manager');
        const isHR = userRoles.includes('hr');
        const userEmail = session?.user?.email;
        const request = row.original;

        const canApprove =
          (isPlantManager || isAdmin) && request.status === 'pending';
        const canMarkAsAccounted = isHR && request.status === 'completed';
        const canCancel =
          request._id &&
          request.status !== 'completed' &&
          request.status !== 'canceled' &&
          request.status !== 'accounted' &&
          (request.requestedBy === userEmail ||
            isPlantManager ||
            isAdmin ||
            userRoles.includes('group-leader') ||
            userRoles.includes('production-manager') ||
            userRoles.includes('hr'));

        const canSelect = canApprove || canMarkAsAccounted || canCancel;

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
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => {
        const internalId = row.getValue('internalId') as string;
        return <div>{internalId}</div>;
      },
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const aValue = rowA.getValue(columnId) as string;
        const bValue = rowB.getValue(columnId) as string;

        if (!aValue || !bValue) return 0;

        // Extract number part from ID format "N/YY"
        const aMatch = aValue.match(/^(\d+)\//);
        const bMatch = bValue.match(/^(\d+)\//);

        if (aMatch && bMatch) {
          const aNum = parseInt(aMatch[1], 10);
          const bNum = parseInt(bMatch[1], 10);
          return aNum - bNum;
        }

        // Fallback to string comparison
        return aValue.localeCompare(bValue);
      },
    },
    {
      accessorKey: 'department',
      header: 'Dział',
      cell: ({ row }) => {
        const department = row.getValue('department') as string;
        const departmentConfig = departments?.find(
          (dept) => dept.value === department,
        );
        const displayName =
          departmentConfig?.namePl || department || 'Nieznany';
        return <div>{displayName}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: dict.tableColumns.status,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let statusLabel;

        switch (status) {
          case 'forecast':
            statusLabel = (
              <Badge variant='statusForecast' className='text-nowrap'>
                Forecast
              </Badge>
            );
            break;
          case 'pending':
            statusLabel = (
              <Badge variant='statusPending' className='text-nowrap'>
                {dict.tableColumns.statuses.pending}
              </Badge>
            );
            break;
          case 'approved':
            statusLabel = <Badge variant='statusApproved'>{dict.tableColumns.statuses.approved}</Badge>;
            break;
          case 'canceled':
            statusLabel = <Badge variant='statusRejected'>{dict.tableColumns.statuses.canceled}</Badge>;
            break;
          case 'completed':
            statusLabel = <Badge variant='statusClosed'>{dict.tableColumns.statuses.completed}</Badge>;
            break;
          case 'accounted':
            statusLabel = <Badge variant='statusAccounted'>{dict.tableColumns.statuses.accounted}</Badge>;
            break;
          default:
            statusLabel = <Badge variant='outline'>{status}</Badge>;
        }

        return statusLabel;
      },
    },
    {
      id: 'actions',
      header: dict.tableColumns.actions,
      cell: ({ row }) => {
        const request = row.original;
        // State to control the attachment dialog

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
          request.status !== 'completed' &&
          request.status !== 'canceled' &&
          request.status !== 'accounted' &&
          (request.requestedBy === userEmail ||
            isPlantManager ||
            isAdmin ||
            userRoles.includes('group-leader') ||
            userRoles.includes('production-manager') ||
            userRoles.includes('hr') ||
            userRoles.includes('admin'));

        // Check if user can add attachment (same logic as in AddAttachmentDialog)
        const canAddAttachment =
          userRoles.some((role) =>
            [
              'group-leader',
              'production-manager',
              'plant-manager',
              'hr',
              'admin',
            ].includes(role),
          ) ||
          userEmail === request.requestedBy ||
          userEmail === request.responsibleEmployee;

        // Check if user can edit
        // For canceled and accounted statuses - only admin can edit
        // For other statuses: Admin, HR, and plant-manager can edit always
        // Author can edit only pending status
        const canEdit =
          request.status === 'canceled' || request.status === 'accounted'
            ? userRoles.includes('admin')
            : (request.requestedBy === userEmail &&
                request.status === 'pending') ||
              userRoles.includes('admin') ||
              userRoles.includes('hr') ||
              userRoles.includes('plant-manager');

        // Check if there are any actions available
        const hasOvertimePickupAction = request.status !== 'canceled';
        const hasApproveAction = canApprove && request.status === 'pending'; // Only pending requests can be approved
        const hasMarkAsAccountedAction = isHR && request.status === 'completed'; // Only completed requests can be marked as accounted
        const hasAddAttachmentAction =
          request._id && request.status === 'approved' && canAddAttachment;
        const hasDownloadAttachmentAction =
          request._id && request.hasAttachment;

        const hasActions =
          hasOvertimePickupAction ||
          hasApproveAction ||
          hasMarkAsAccountedAction ||
          canCancel ||
          canEdit ||
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
                {/* View Details - always available */}
                <LocalizedLink href={`/overtime-orders/${request._id}`}>
                  <DropdownMenuItem>
                    <FileText className='mr-2 h-4 w-4' />
                    <span>Szczegóły zlecenia</span>
                  </DropdownMenuItem>
                </LocalizedLink>

                {request.status !== 'canceled' && (
                  <>
                    <LocalizedLink href={`/overtime-orders/${request._id}/employees`}>
                      <DropdownMenuItem>
                        <CalendarClock className='mr-2 h-4 w-4' />
                        <span>{dict.tableColumns.overtimePickup}</span>
                      </DropdownMenuItem>
                    </LocalizedLink>
                    {/* Edit button - only for author and pending/approved status */}
                    {canEdit && (
                      <LocalizedLink href={`/overtime-orders/${request._id}/edit`}>
                        <DropdownMenuItem>
                          <Edit className='mr-2 h-4 w-4' />
                          <span>{dict.tableColumns.editRequest}</span>
                        </DropdownMenuItem>
                      </LocalizedLink>
                    )}
                    {/* Only show approve button if user can approve */}
                    {canApprove &&
                      request.status !== 'approved' &&
                      request.status !== 'completed' &&
                      request.status !== 'accounted' && (
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setIsApproveDialogOpen(true);
                          }}
                        >
                          <Check className='mr-2 h-4 w-4' />
                          <span>{dict.tableColumns.approve}</span>
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
                        <span>{dict.tableColumns.markAsAccounted}</span>
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
                    <span>{dict.tableColumns.cancelRequest}</span>
                  </DropdownMenuItem>
                )}

                {/* Complete order button - only for approved orders and authorized users */}
                {hasAddAttachmentAction && (
                  <LocalizedLink href={`/overtime-orders/${request._id}/complete`}>
                    <DropdownMenuItem>
                      <CheckCircle className='mr-2 h-4 w-4' />
                      <span>Zamknij zlecenie</span>
                    </DropdownMenuItem>
                  </LocalizedLink>
                )}

                {/* Download attachment button - show if attachment exists */}
                {request._id && request.hasAttachment && (
                  <Link
                    href={`/api/overtime-orders/download?overTimeRequestId=${request._id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <DropdownMenuItem>
                      <Download className='mr-2 h-4 w-4' />
                      <span>{dict.tableColumns.downloadAttachment}</span>
                    </DropdownMenuItem>
                  </Link>
                )}

                {/* Admin actions */}
                {isAdmin && request.status === 'canceled' && (
                  <DropdownMenuItem
                    onSelect={async (e) => {
                      e.preventDefault();
                      const result = await bulkReactivateOvertimeRequests([
                        request._id,
                      ]);
                      if (result.error) {
                        alert(`Błąd: ${result.error}`);
                      } else {
                        alert('Zlecenie zostało reaktywowane');
                        window.location.reload();
                      }
                    }}
                  >
                    <RotateCcw className='mr-2 h-4 w-4' />
                    <span>Reaktywuj zlecenie</span>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem
                    onSelect={async (e) => {
                      e.preventDefault();
                      if (
                        confirm(
                          'Czy na pewno chcesz TRWALE usunąć to zlecenie? Ta operacja jest nieodwracalna.',
                        )
                      ) {
                        const result = await bulkDeleteOvertimeRequests([
                          request._id,
                        ]);
                        if (result.error) {
                          alert(`Błąd: ${result.error}`);
                        } else {
                          alert('Zlecenie zostało usunięte');
                          window.location.reload();
                        }
                      }
                    }}
                    className='text-destructive'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    <span>Usuń zlecenie</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialog outside of DropdownMenuContent */}
            {request._id && (
              <>
                <CancelRequestDialog
                  isOpen={isCancelDialogOpen}
                  onOpenChange={setIsCancelDialogOpen}
                  requestId={request._id}
                  dict={dict}
                />
                <ApproveRequestDialog
                  isOpen={isApproveDialogOpen}
                  onOpenChange={setIsApproveDialogOpen}
                  requestId={request._id}
                  session={session}
                  dict={dict}
                />
                <MarkAsAccountedDialog
                  isOpen={isMarkAsAccountedDialogOpen}
                  onOpenChange={setIsMarkAsAccountedDialogOpen}
                  requestId={request._id}
                  session={session}
                  dict={dict}
                />
              </>
            )}
          </>
        );
      },
    },
    {
      id: 'period',
      header: 'Data',
      cell: ({ row }) => {
        const from = new Date(row.original.from);
        const to = new Date(row.original.to);

        const fromDate = from.toLocaleDateString('pl-PL');
        const toDate = to.toLocaleDateString('pl-PL');

        // Check if it's the same day
        if (fromDate === toDate) {
          return <div className='text-sm'>{fromDate}</div>;
        }

        // Check if it's consecutive days in the same month/year
        const fromDay = from.getDate();
        const toDay = to.getDate();
        const sameMonth =
          from.getMonth() === to.getMonth() &&
          from.getFullYear() === to.getFullYear();

        if (sameMonth && toDay === fromDay + 1) {
          const month = (from.getMonth() + 1).toString().padStart(2, '0');
          const year = from.getFullYear();
          return (
            <div className='text-sm'>
              {fromDay}-{toDay}.{month}.{year}
            </div>
          );
        }

        // Different dates, show full range with hyphen
        return (
          <div className='text-sm'>
            <div>{fromDate}</div>
            <div className='text-muted-foreground'>- {toDate}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'numberOfEmployees',
      header: dict.tableColumns.numberOfEmployees,
      cell: ({ row }) => {
        const numberOfEmployees = row.getValue('numberOfEmployees') as number;
        return <div>{numberOfEmployees || 0}</div>;
      },
    },
    {
      accessorKey: 'numberOfShifts',
      header: dict.tableColumns.numberOfShifts,
      cell: ({ row }) => {
        const numberOfShifts = row.getValue('numberOfShifts') as number;
        return <div>{numberOfShifts || 1}</div>;
      },
    },
    {
      id: 'totalHours',
      header: dict.tableColumns.totalHours,
      cell: ({ row }) => {
        const fromDate = new Date(row.original.from);
        const toDate = new Date(row.original.to);
        const numberOfEmployees = row.original.numberOfEmployees || 0;
        const numberOfShifts = row.original.numberOfShifts || 1;

        // Calculate hours per employee
        const hoursPerEmployee =
          Math.round(
            ((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60)) * 100,
          ) / 100;

        // Calculate total hours for all employees divided by number of shifts
        const totalHours =
          (hoursPerEmployee * numberOfEmployees) / numberOfShifts;

        return <div>{totalHours > 0 ? `${totalHours}h` : '-'}</div>;
      },
    },
    {
      accessorKey: 'employeesWithScheduledDayOff',
      header: dict.tableColumns.dayOffPickup,
      cell: ({ row }) => {
        const employees = row.getValue('employeesWithScheduledDayOff');
        return <div>{Array.isArray(employees) ? employees.length : 0}</div>;
      },
    },
    {
      accessorKey: 'reason',
      header: dict.tableColumns.reason,
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
        const truncated =
          reason.length > 80 ? reason.substring(0, 80) + '...' : reason;
        return <div className='w-[200px] text-justify'>{truncated}</div>;
      },
    },
    {
      accessorKey: 'responsibleEmployee',
      header: dict.tableColumns.responsibleEmployee,
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
      accessorKey: 'requestedBy',
      header: dict.tableColumns.requestedBy,
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
      accessorKey: 'requestedAtLocaleString',
      header: dict.tableColumns.requestedAt,
      cell: ({ row }) => {
        const requestedAt = row.original.requestedAt;
        const requestedAtString = formatDateTime(requestedAt);
        return <div>{requestedAtString}</div>;
      },
    },

    {
      accessorKey: 'editedBy',
      header: dict.tableColumns.editedBy,
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
      header: dict.tableColumns.editedAt,
      cell: ({ row }) => {
        const editedAt = row.original.editedAt;
        const editedAtString = formatDateTime(editedAt);
        return <div>{editedAtString}</div>;
      },
    },

    {
      accessorKey: 'completedBy',
      header: dict.tableColumns.completedBy,
      cell: ({ row }) => {
        const completedBy = row.original.completedBy;
        return (
          <div className='whitespace-nowrap'>
            {completedBy ? extractNameFromEmail(completedBy) : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'completedAtLocaleString',
      header: dict.tableColumns.completedAt,
      cell: ({ row }) => {
        const completedAt = row.original.completedAt;
        const completedAtString = formatDateTime(completedAt);
        return <div>{completedAtString}</div>;
      },
    },
    {
      accessorKey: 'accountedBy',
      header: dict.tableColumns.accountedBy,
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
      header: dict.tableColumns.accountedAt,
      cell: ({ row }) => {
        const accountedAt = row.original.accountedAt;
        const accountedAtString = formatDateTime(accountedAt);
        return <div>{accountedAtString}</div>;
      },
    },
    {
      accessorKey: 'canceledBy',
      header: dict.tableColumns.canceledBy,
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
      header: dict.tableColumns.canceledAt,
      cell: ({ row }) => {
        const canceledAt = row.original.canceledAt;
        const canceledAtString = formatDateTime(canceledAt);
        return <div>{canceledAtString}</div>;
      },
    },
    {
      accessorKey: 'note',
      header: dict.tableColumns.additionalInfo,
      cell: ({ row }) => {
        const note = row.getValue('note');
        return <div className='w-[250px] text-justify'>{note as string}</div>;
      },
    },
  ];
};
