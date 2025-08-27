'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Copy, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

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
import { ArticleConfigType } from '@/lib/types/article-config';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { CopyDialog } from '../components/copy-dialog';
import { DeleteDialog } from '../components/delete-dialog';

const ActionsCell = ({ row }: { row: { original: ArticleConfigType } }) => {
  const articleConfig = row.original;
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenCopyDialog, setIsOpenCopyDialog] = useState(false);

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
          <Link href={`/admin/dmcheck-articles/edit/${articleConfig._id || ''}`}>
            <DropdownMenuItem>
              <Pencil className='mr-2 h-4 w-4' />
              <span>Edit</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => setIsOpenCopyDialog(true)}>
            <Copy className='mr-2 h-4 w-4' />
            <span>Copy</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='focus:bg-red-400 dark:focus:bg-red-700'
            onClick={() => setIsOpenDeleteDialog(true)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CopyDialog
        isOpen={isOpenCopyDialog}
        setIsOpen={setIsOpenCopyDialog}
        articleId={articleConfig._id || ''}
      />
      <DeleteDialog
        isOpen={isOpenDeleteDialog}
        setIsOpen={setIsOpenDeleteDialog}
        articleId={articleConfig._id || ''}
      />
    </>
  );
};

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
    cell: (props) => <ActionsCell {...props} />,
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
