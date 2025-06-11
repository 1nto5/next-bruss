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
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  approveOvertimeRequest as approve,
  deleteOvertimeRequestDraft as deleteDraft,
} from '../../actions';
import { OvertimeType } from '../../lib/production-overtime-types';

const handleApprove = async (id: string) => {
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

export const columns: ColumnDef<OvertimeType>[] = [
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
          statusLabel = <Badge variant='statusApproved'>Zatwierdzony</Badge>;
          break;
        case 'rejected':
          statusLabel = <Badge variant='statusRejected'>Odrzucony</Badge>;
          break;
        case 'draft':
          statusLabel = <Badge variant='statusDraft'>Szkic</Badge>;
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
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {request.status === 'draft' && (
                <Link href={`/production-overtime/edit/${request._id}`}>
                  <DropdownMenuItem>
                    <Pencil className='mr-2 h-4 w-4' />
                    <span>Edytuj</span>
                  </DropdownMenuItem>
                </Link>
              )}
              {request.status !== 'draft' && (
                <>
                  <Link href={`/production-overtime/${request._id}`}>
                    <DropdownMenuItem>
                      <CalendarClock className='mr-2 h-4 w-4' />
                      <span>Odbiór nadgodzin</span>
                    </DropdownMenuItem>
                  </Link>
                  {request.status !== 'approved' && (
                    <DropdownMenuItem
                      onClick={() => request._id && handleApprove(request._id)}
                    >
                      <Check className='mr-2 h-4 w-4' />
                      <span>Zatwierdź</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {request.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => request._id && deleteDraft(request._id)}
                  className='focus:bg-red-400 dark:focus:bg-red-700'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  <span>Usuń</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
  {
    accessorKey: 'approved',
    header: 'Zatwierdzony',
    cell: ({ row }) => {
      const approvedAtLocaleString = row.original.approvedAtLocaleString;
      return (
        <div>{approvedAtLocaleString ? `${approvedAtLocaleString}` : '-'}</div>
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
    header: 'Zlecenie wystawione',
  },
  {
    accessorKey: 'requestedBy',
    header: 'Wystawił',
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
    accessorKey: 'editedAtLocaleString',
    header: 'Ostatnia zmiana',
  },
];
