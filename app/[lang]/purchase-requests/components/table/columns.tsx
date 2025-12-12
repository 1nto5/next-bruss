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
  Check,
  CheckCheck,
  Eye,
  MoreHorizontal,
  Pencil,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { PurchaseRequestStatus, PurchaseRequestType } from '../../lib/types';
import { Dictionary } from '../../lib/dict';

const statusColors: Record<PurchaseRequestStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  'pre-approved': 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  ordered: 'bg-blue-100 text-blue-800',
  received: 'bg-purple-100 text-purple-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export function createColumns(
  dict: Dictionary,
  session: Session | null,
  lang: string,
  onPreApprove?: (id: string) => void,
  onFinalApprove?: (id: string) => void,
  onReject?: (id: string) => void,
  onMarkOrdered?: (id: string) => void,
  onDelete?: (id: string) => void,
): ColumnDef<PurchaseRequestType>[] {
  const isManager = session?.user?.roles?.includes('manager') || false;
  const isPlantManager =
    session?.user?.roles?.includes('plant-manager') || false;
  const isBuyer = session?.user?.roles?.includes('buyer') || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;

  return [
    {
      accessorKey: 'internalId',
      header: dict.tableColumns.id,
      cell: ({ row }) => {
        const id = row.original.internalId;
        return id ? (
          <span className='font-medium'>{id}</span>
        ) : (
          <span className='text-muted-foreground'>—</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: dict.tableColumns.status,
      cell: ({ row }) => {
        const status = row.original.status as PurchaseRequestStatus;
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
      accessorKey: 'total',
      header: dict.tableColumns.total,
      cell: ({ row }) => {
        const total = row.original.total;
        const currency = row.original.currency;
        return (
          <span className='font-medium'>
            {total.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}{' '}
            {currency}
          </span>
        );
      },
    },
    {
      accessorKey: 'itemCount',
      header: dict.tableColumns.itemCount,
    },
    {
      accessorKey: 'manager',
      header: dict.tableColumns.manager,
      cell: ({ row }) => extractNameFromEmail(row.original.manager),
    },
    {
      accessorKey: 'requestedBy',
      header: dict.tableColumns.requestedBy,
      cell: ({ row }) => extractNameFromEmail(row.original.requestedBy),
    },
    {
      accessorKey: 'requestedAt',
      header: dict.tableColumns.requestedAt,
      cell: ({ row }) => {
        const date = row.original.requestedAt;
        if (!date) return '—';
        return new Date(date).toLocaleDateString('pl-PL');
      },
    },
    {
      id: 'actions',
      header: dict.tableColumns.actions,
      cell: ({ row }) => {
        const request = row.original;
        const canPreApprove =
          request.status === 'pending' &&
          (isManager || isAdmin) &&
          (request.manager === session?.user?.email || isAdmin);
        const canFinalApprove =
          request.status === 'pre-approved' && (isPlantManager || isAdmin);
        const canReject =
          ['pending', 'pre-approved'].includes(request.status) &&
          (isManager || isPlantManager || isAdmin);
        const canMarkOrdered =
          request.status === 'approved' && (isBuyer || isAdmin);
        const canEdit =
          ['draft', 'pending'].includes(request.status) &&
          request.requestedBy === session?.user?.email;
        const canDelete =
          request.status === 'draft' &&
          request.requestedBy === session?.user?.email;

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
                <Link href={`/${lang}/purchase-requests/${request._id}`}>
                  <Eye className='mr-2 h-4 w-4' />
                  Szczegóły
                </Link>
              </DropdownMenuItem>

              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/purchase-requests/${request._id}/edit`}>
                    <Pencil className='mr-2 h-4 w-4' />
                    {dict.common.edit}
                  </Link>
                </DropdownMenuItem>
              )}

              {(canPreApprove || canFinalApprove || canMarkOrdered) && (
                <DropdownMenuSeparator />
              )}

              {canPreApprove && onPreApprove && (
                <DropdownMenuItem onClick={() => onPreApprove(request._id)}>
                  <Check className='mr-2 h-4 w-4' />
                  {dict.preApproveDialog.action}
                </DropdownMenuItem>
              )}

              {canFinalApprove && onFinalApprove && (
                <DropdownMenuItem onClick={() => onFinalApprove(request._id)}>
                  <CheckCheck className='mr-2 h-4 w-4' />
                  {dict.finalApproveDialog.action}
                </DropdownMenuItem>
              )}

              {canReject && onReject && (
                <DropdownMenuItem
                  onClick={() => onReject(request._id)}
                  className='text-red-600'
                >
                  <X className='mr-2 h-4 w-4' />
                  {dict.rejectDialog.action}
                </DropdownMenuItem>
              )}

              {canMarkOrdered && onMarkOrdered && (
                <DropdownMenuItem onClick={() => onMarkOrdered(request._id)}>
                  <ShoppingCart className='mr-2 h-4 w-4' />
                  {dict.markOrderedDialog.action}
                </DropdownMenuItem>
              )}

              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(request._id)}
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
