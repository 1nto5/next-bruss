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
import { deleteArticle } from '../actions';
import { ArticleConfigType } from '@/lib/types/articleConfig';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

//TODO: implement or delete :)
// import { useHotkeys } from 'react-hotkeys-hook';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<ArticleConfigType>[] = [
  {
    accessorKey: 'workplace',
    header: 'Workplace',
    cell: ({ row }) => {
      const workplace: string = row.getValue('workplace');
      const uppercaseWorkplace = workplace.toUpperCase();
      return <div>{uppercaseWorkplace}</div>;
    },
  },
  {
    accessorKey: 'articleNumber',
    header: 'Number',
  },
  {
    accessorKey: 'articleName',
    header: 'Name',
  },
  {
    id: 'actions',
    header: 'Actions',

    cell: ({ row }) => {
      const articleConfig = row.original;

      return (
        <AlertDialog>
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
              <Link href={`/admin/dmcheck-articles/edit/${articleConfig._id}`}>
                <DropdownMenuItem>
                  <Pencil className='mr-2 h-4 w-4' />
                  <span>Edit</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                // onClick={() => {
                //   if (articleConfig._id) {
                //     deleteArticle(articleConfig._id);
                //   } else {
                //     toast.error(`Article _id is missing. Please contact IT.`);
                //   }
                // }}
                className=' focus:bg-red-400 dark:focus:bg-red-700'
              >
                <AlertDialogTrigger asChild>
                  {/* <Button>
                    <Trash2 className='mr-2 h-4 w-4' />
                    <span>Delete</span>
                  </Button> */}
                  test
                </AlertDialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
  {
    accessorKey: 'articleNote',
    header: 'Note',
  },
  {
    accessorKey: 'piecesPerBox',
    header: 'Pieces / box',
  },
  {
    accessorKey: 'dmc',
    header: 'DMC full content',
  },
  {
    accessorKey: 'dmcFirstValidation',
    header: 'Validation string',
  },
  {
    accessorKey: 'secondValidation',
    header: 'Second validation',
    cell: ({ row }) => {
      const value: boolean = row.getValue('secondValidation');
      const text = value ? 'Yes' : 'No';
      return <div>{text}</div>;
    },
  },
  {
    accessorKey: 'dmcSecondValidation',
    header: 'Second validation string',
  },
  {
    accessorKey: 'hydraProcess',
    header: 'HYDRA process',
  },
  {
    accessorKey: 'ford',
    header: 'FORD date validation',
    cell: ({ row }) => {
      const value: boolean = row.getValue('ford');
      const text = value ? 'Yes' : 'No';
      return <div>{text}</div>;
    },
  },
  {
    accessorKey: 'bmw',
    header: 'BMW date validation',
    cell: ({ row }) => {
      const value: boolean = row.getValue('bmw');
      const text = value ? 'Yes' : 'No';
      return <div>{text}</div>;
    },
  },
  {
    accessorKey: 'pallet',
    header: 'Pallet label',
    cell: ({ row }) => {
      const value: boolean = row.getValue('pallet');
      const text = value ? 'Yes' : 'No';
      return <div>{text}</div>;
    },
  },
  {
    accessorKey: 'boxesPerPallet',
    header: 'Boxes / pallet',
  },
];
