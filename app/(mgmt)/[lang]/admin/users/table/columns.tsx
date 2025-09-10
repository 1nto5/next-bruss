'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

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
import Link from 'next/link';
import { Trash2, Pencil } from 'lucide-react';
import { deleteUser } from '../actions';
import { UserType } from '@/lib/types/user';

import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const onDeleteUser = async (userId: string) => {
  try {
    const res = await deleteUser(userId);
    if (!res) {
      toast.error('Failed to delete user!');
    }
    if (res && res.error === 'not found') {
      toast.error('User not found!');
    }
    if (res && res.success === 'deleted') {
      toast.success('User deleted successfully!');
    }
  } catch (error) {
    toast.error('Failed to delete user!');
  }
};

const ActionsCell = ({ row }: { row: { original: UserType } }) => {
  const user = row.original;
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
          <Link href={`/admin/users/edit/${user._id}`}>
            <DropdownMenuItem>
              <Pencil className='mr-2 h-4 w-4' />
              <span>Edit</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className=' focus:bg-red-400 dark:focus:bg-red-700'
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
              This action will permanently delete this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsOpen(false);
                if (user._id) {
                  onDeleteUser(user._id);
                } else {
                  toast.error(`Article _id is missing. Please contact IT.`);
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

export const columns: ColumnDef<UserType>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (props) => <ActionsCell {...props} />,
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
  },
];
