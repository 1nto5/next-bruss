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
import { deleteUser } from '.././actions';
import { UserType } from '@/lib/types/user';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<UserType>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {/* <DropdownMenuLabel>{capa.articleNumber}</DropdownMenuLabel> */}
            {/* <DropdownMenuSeparator /> */}
            <Link href={`/admin/users/edit/${user._id}`}>
              <DropdownMenuItem>
                <Pencil className='mr-2 h-4 w-4' />
                <span>Edit</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => deleteUser(user._id)}
              className=' focus:bg-red-400 dark:focus:bg-red-700'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              <span>Delete</span>
              {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
