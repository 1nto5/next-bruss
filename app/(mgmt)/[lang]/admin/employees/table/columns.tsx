'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

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
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  // DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmployeeType } from '@/lib/types/employee-types';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteEmployee } from '../actions';

const onDeleteEmployee = async (articleId: string) => {
  try {
    const res = await deleteEmployee(articleId);
    if (!res) {
      toast.error('Failed to delete employee!');
    }
    if (res && res.error === 'not found') {
      toast.error('Employee not found!');
    }
    if (res && res.success === 'deleted') {
      toast.success('Employee deleted successfully!');
    }
  } catch (error) {
    toast.error('Failed to delete employee!');
  }
};

const ActionsCell = ({ row }: { row: { original: unknown } }) => {
  const articleConfig = row.original;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <Link href={`/admin/employees/edit/${articleConfig._id}`}>
            <DropdownMenuItem>
              <Pencil className='mr-2 h-4 w-4' />
              <span>Edit</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className='focus:bg-red-400 dark:focus:bg-red-700'
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this employee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsOpen(false);
                if (articleConfig._id) {
                  onDeleteEmployee(articleConfig._id);
                } else {
                  toast.error(`Employee _id is missing. Please contact IT.`);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columns: ColumnDef<EmployeeType>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },

  {
    id: 'actions',
    header: 'Actions',
    cell: (props) => <ActionsCell {...props} />,
  },
  { accessorKey: 'identifier', header: 'Identifier' },
  { accessorKey: 'pin', header: 'PIN' },
];
