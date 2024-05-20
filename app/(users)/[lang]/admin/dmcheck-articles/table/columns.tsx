'use client';

import { useState } from 'react';
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
  // AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const onDeleteArticle = async (articleId: string) => {
  try {
    const res = await deleteArticle(articleId);
    if (!res) {
      toast.error('Failed to delete article!');
    }
    if (res && res.error === 'not found') {
      toast.error('Article not found!');
    }
    if (res && res.success === 'deleted') {
      toast.success('Article deleted successfully!');
    }
  } catch (error) {
    toast.error('Failed to delete article!');
  }
};

const ActionsCell = ({ row }: { row: any }) => {
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
          <Link href={`/admin/dmcheck-articles/edit/${articleConfig._id}`}>
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
              This action will permanently delete this article.
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
                  onDeleteArticle(articleConfig._id);
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
