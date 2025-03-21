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
import { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, MoreHorizontal, Replace, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteEmployee, reportAbsence } from '../../../actions';
import { overtimeRequestEmployeeType } from '../../../lib/production-overtime-types';
const handleReportAbsence = async (
  overtimeId: string,
  employeeIndex: number,
) => {
  toast.promise(
    reportAbsence(overtimeId, employeeIndex).then((res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      return res;
    }),
    {
      loading: 'Zgłaszam nieobecność...',
      success: 'Nieobecność zgłoszona!',
      error: (error) => {
        const errorMsg = error.message;
        if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
        if (errorMsg === 'not found') return 'Nie znaleziono zlecenia!';
        if (errorMsg === 'not found employee')
          return 'Nie znaleziono pracownika!';
        console.error('handleReportAbsence', errorMsg);
        return 'Skontaktuj się z IT!';
      },
    },
  );
};

const handleDeleteEmployee = async (
  overtimeId: string,
  employeeIndex: number,
) => {
  toast.promise(
    deleteEmployee(overtimeId, employeeIndex).then((res) => {
      if (res && res.error) {
        throw new Error(res.error);
      }
      return res;
    }),
    {
      loading: 'Usuwam pracownika...',
      success: 'Pracownik usunięty!',
      error: (error) => {
        const errorMsg = error.message;
        if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
        if (errorMsg === 'not found') return 'Nie znaleziono zlecenia!';
        if (errorMsg === 'not found employee')
          return 'Nie znaleziono pracownika!';
        console.error('handleDeleteEmployee', errorMsg);
        return 'Skontaktuj się z IT!';
      },
    },
  );
};

function ReportAbsenceDialog({
  isOpen,
  setIsOpen,
  overtimeId,
  employeeIndex,
  firstName,
  lastName,
  identifier,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  overtimeId: string;
  employeeIndex: number;
  firstName: string;
  lastName: string;
  identifier: string;
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Potwierdź nieobecność</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz zgłosić nieobecność dla pracownika: {firstName}{' '}
            {lastName} ({identifier})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setIsOpen(false);
              handleReportAbsence(overtimeId, employeeIndex);
            }}
          >
            Potwierdź
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteEmployeeDialog({
  isOpen,
  setIsOpen,
  overtimeId,
  employeeIndex,
  firstName,
  lastName,
  identifier,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  overtimeId: string;
  employeeIndex: number;
  firstName: string;
  lastName: string;
  identifier: string;
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Potwierdź usunięcie pracownika</AlertDialogTitle>
          <AlertDialogDescription>
            Czy na pewno chcesz usunąć pracownika: {firstName} {lastName} (
            {identifier})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setIsOpen(false);
              handleDeleteEmployee(overtimeId, employeeIndex);
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
  const pathname = usePathname();
  const [isReportOpen, setReportOpen] = useState<boolean>(false);
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
          <Link href={`${pathname}/replace/${row.index}`}>
            <DropdownMenuItem>
              <Replace className='mr-2 h-4 w-4' />
              <span>Wymień</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className='focus:bg-yellow-400 dark:focus:bg-yellow-700'
            onClick={() => setReportOpen(true)}
          >
            <AlertCircle className='mr-2 h-4 w-4' />
            <span>Zgłoś nieobecność</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='focus:bg-red-400 dark:focus:bg-red-700'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Usuń</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report absence confirmation dialog */}
      <ReportAbsenceDialog
        isOpen={isReportOpen}
        setIsOpen={setReportOpen}
        overtimeId={overtimeId}
        employeeIndex={row.index}
        firstName={firstName}
        lastName={lastName}
        identifier={identifier}
      />

      {/* Delete employee confirmation dialog */}
      <DeleteEmployeeDialog
        isOpen={isDeleteOpen}
        setIsOpen={setDeleteOpen}
        overtimeId={overtimeId}
        employeeIndex={row.index}
        firstName={firstName}
        lastName={lastName}
        identifier={identifier}
      />
    </>
  );
}

export const columns: ColumnDef<overtimeRequestEmployeeType>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<string>();
      if (!status) return <span>Obecny</span>;
      if (status === 'deleted')
        return (
          <span className='animate-pulse font-bold text-red-500'>Usunięty</span>
        );
      if (status === 'absent')
        return (
          <span className='animate-pulse font-bold text-yellow-500'>
            Nieobecny
          </span>
        );
      return <span className='animate-pulse'>{status}</span>;
    },
  },
  {
    accessorKey: 'firstName',
    header: 'Imie',
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
    accessorKey: 'agreedReceivingAtLocaleString',
    header: 'Ustalona data odbioru',
  },
  {
    accessorKey: 'note',
    header: 'Notatka',
  },
];
