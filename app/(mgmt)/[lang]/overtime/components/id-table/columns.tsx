'use client';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClientLocaleDateString } from '@/lib/client-date-utils';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteDayOff } from '../../actions';
import { overtimeRequestEmployeeType } from '../../lib/types';

const handleDeleteDayOff = async (
  overtimeId: string,
  employeeIdentifier: string,
) => {
  toast.promise(
    deleteDayOff(overtimeId, employeeIdentifier).then((res) => {
      if (res && res.error) {
        throw new Error(res.error);
      }
      return res;
    }),
    {
      loading: 'Trwa usuwanie odbioru dnia wolnego...',
      success: 'Odbiór został usunięty!',
      error: (error) => {
        const errorMsg = error.message;
        if (errorMsg === 'unauthorized') return 'Brak uprawnień!';
        if (errorMsg === 'not found') return 'Nie znaleziono!';
        if (errorMsg === 'not found employee')
          return 'Pracownik nie znaleziony!';
        if (errorMsg === 'invalid status')
          return 'Status zlecenia nie pozwala na jego edycję!';
        console.error('handleDeleteDayOff', errorMsg);
        return 'Skontaktuj się z IT!';
      },
    },
  );
};

function DeleteDayOffDialog({
  isOpen,
  setIsOpen,
  overtimeId,
  firstName,
  lastName,
  identifier,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  overtimeId: string;
  firstName: string;
  lastName: string;
  identifier: string;
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Potwierdź usunięcie odbioru dnia wolnego
          </AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz usunąć odbiór dnia wolnego dla pracownika:{' '}
            {firstName} {lastName} ({identifier})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setIsOpen(false);
              handleDeleteDayOff(overtimeId, identifier);
            }}
          >
            Potwierdź
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ActionsCell({ row }: { row: any }) {
  const [isDeleteOpen, setDeleteOpen] = useState<boolean>(false);

  // assume employee properties exist on row.original
  const { overtimeId, firstName, lastName, identifier } = row.original;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='focus:bg-red-400 dark:focus:bg-red-700'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Usuń odbiór dnia wolnego</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Okno potwierdzenia usunięcia wniosku o urlop */}
      <DeleteDayOffDialog
        isOpen={isDeleteOpen}
        setIsOpen={setDeleteOpen}
        overtimeId={overtimeId}
        firstName={firstName}
        lastName={lastName}
        identifier={identifier}
      />
    </>
  );
}

export const columns: ColumnDef<overtimeRequestEmployeeType>[] = [
  {
    accessorKey: 'firstName',
    header: 'Imię',
  },
  {
    accessorKey: 'lastName',
    header: 'Nazwisko',
  },
  {
    accessorKey: 'identifier',
    header: 'Nr pers.',
  },
  {
    id: 'actions',
    header: 'Akcje',
    cell: ({ row }) => <ActionsCell row={row} />,
  },
  {
    accessorKey: 'agreedReceivingAt',
    header: 'Data odbioru dnia wolnego',
    cell: ({ row }) => {
      const agreedReceivingAt = row.original.agreedReceivingAt;
      const formattedDate = useClientLocaleDateString(agreedReceivingAt);
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'note',
    header: 'Notatka',
    cell: ({ getValue }) => {
      const note = getValue<string>();
      return <span>{note || '-'}</span>;
    },
  },
];
