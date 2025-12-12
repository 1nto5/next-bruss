'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ColumnDef } from '@tanstack/react-table';
import {
  BookOpen,
  Check,
  Eye,
  FileText,
  MoreHorizontal,
  RefreshCcw,
  Trash2,
  X,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Dictionary } from '../../lib/dict';
import { InvoiceStatus, InvoiceType } from '../../lib/types';

const statusColors: Record<InvoiceStatus, string> = {
  'to-confirm': 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  'manager-review': 'bg-orange-100 text-orange-800',
  booked: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
};

export function createColumns(
  dict: Dictionary,
  session: Session | null,
  lang: string,
  onConfirm?: (id: string) => void,
  onReject?: (id: string) => void,
  onBook?: (id: string) => void,
  onReopen?: (id: string) => void,
  onDelete?: (id: string) => void,
): ColumnDef<InvoiceType>[] {
  const isBookkeeper = session?.user?.roles?.includes('bookkeeper') || false;
  const isPlantManager =
    session?.user?.roles?.includes('plant-manager') || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;

  return [
    {
      accessorKey: 'invoiceNumber',
      header: dict.tableColumns.invoiceNumber,
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.invoiceNumber}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: dict.tableColumns.status,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={statusColors[status]}>
            {dict.tableColumns.statuses[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'supplierName',
      header: dict.tableColumns.supplier,
      cell: ({ row }) =>
        row.original.supplierName || (
          <span className='text-muted-foreground'>—</span>
        ),
    },
    {
      accessorKey: 'value',
      header: dict.tableColumns.value,
      cell: ({ row }) => (
        <span className='font-medium'>
          {row.original.value.toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
          })}{' '}
          {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: 'receiver',
      header: dict.tableColumns.receiver,
      cell: ({ row }) => extractNameFromEmail(row.original.receiver),
    },
    {
      accessorKey: 'addedAt',
      header: dict.tableColumns.addedAt,
      cell: ({ row }) => {
        const date = row.original.addedAt;
        if (!date) return '—';
        return new Date(date).toLocaleDateString('pl-PL');
      },
    },
    {
      accessorKey: 'confirmationType',
      header: dict.tableColumns.confirmationType,
      cell: ({ row }) => {
        const type = row.original.confirmationType;
        if (!type) return <span className='text-muted-foreground'>—</span>;
        if (type === 'pr')
          return (
            <Badge variant='outline'>
              <FileText className='mr-1 h-3 w-3' />
              PR: {row.original.linkedPrNumber}
            </Badge>
          );
        if (type === 'sc')
          return (
            <Badge variant='outline'>SC: {row.original.linkedScCode}</Badge>
          );
        return <Badge variant='secondary'>{type}</Badge>;
      },
    },
    {
      id: 'actions',
      header: dict.tableColumns.actions,
      cell: ({ row }) => {
        const invoice = row.original;
        const isReceiver = invoice.receiver === session?.user?.email;
        const isSender = invoice.sender === session?.user?.email;

        const canConfirm = invoice.status === 'to-confirm' && isReceiver;
        const canApproveReview =
          invoice.status === 'manager-review' && (isPlantManager || isAdmin);
        const canReject =
          ['to-confirm', 'manager-review'].includes(invoice.status) &&
          (isReceiver || isPlantManager || isAdmin);
        const canBook =
          invoice.status === 'confirmed' && (isBookkeeper || isAdmin);
        const canReopen =
          invoice.status === 'rejected' && (isBookkeeper || isAdmin);
        const canDelete =
          invoice.status === 'to-confirm' && (isSender || isAdmin);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/invoices/${invoice._id}`}>
                  <Eye className='mr-2 h-4 w-4' />
                  {dict.common.details}
                </Link>
              </DropdownMenuItem>

              {(canConfirm || canApproveReview) && (
                <>
                  <DropdownMenuSeparator />
                  {canConfirm && onConfirm && (
                    <DropdownMenuItem onClick={() => onConfirm(invoice._id)}>
                      <Check className='mr-2 h-4 w-4' />
                      {dict.confirmDialog.action}
                    </DropdownMenuItem>
                  )}
                  {canApproveReview && onConfirm && (
                    <DropdownMenuItem onClick={() => onConfirm(invoice._id)}>
                      <Check className='mr-2 h-4 w-4' />
                      {dict.managerReviewDialog.approve}
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {canReject && onReject && (
                <DropdownMenuItem
                  onClick={() => onReject(invoice._id)}
                  className='text-red-600'
                >
                  <X className='mr-2 h-4 w-4' />
                  {dict.rejectDialog.action}
                </DropdownMenuItem>
              )}

              {canBook && onBook && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onBook(invoice._id)}>
                    <BookOpen className='mr-2 h-4 w-4' />
                    {dict.bookDialog.action}
                  </DropdownMenuItem>
                </>
              )}

              {canReopen && onReopen && (
                <DropdownMenuItem onClick={() => onReopen(invoice._id)}>
                  <RefreshCcw className='mr-2 h-4 w-4' />
                  {dict.common.reopen}
                </DropdownMenuItem>
              )}

              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(invoice._id)}
                    className='text-red-600'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    {dict.common.delete}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
