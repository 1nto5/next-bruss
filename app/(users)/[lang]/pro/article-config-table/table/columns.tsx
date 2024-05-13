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
import { deleteArticle } from '.././actions';
import { ArticleConfigType } from '@/lib/types/articleConfig';
//TODO: implement or delete :)
// import { useHotkeys } from 'react-hotkeys-hook';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<ArticleConfigType>[] = [
  {
    accessorKey: 'articleNumber',
    header: 'Article number',
  },
  {
    accessorKey: 'articleName',
    header: 'Article name',
  },
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
    accessorKey: 'piecesPerBox',
    header: 'Pieces per box',
  },
  {
    accessorKey: 'amount',
    header: () => <div className='text-right'>Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      return <div className='text-right font-medium'>{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const articleConfig = row.original;

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
            <Link href={`/pro/article-config-table/edit/${articleConfig._id}`}>
              <DropdownMenuItem>
                <Pencil className='mr-2 h-4 w-4' />
                <span>Edit</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => deleteArticle(articleConfig._id)}
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
