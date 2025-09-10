'use client';

import { DmcTableDataType } from '@/app/(mgmt)/[lang]/dmcheck-data/lib/dmcheck-data-types';
import { ColumnDef } from '@tanstack/react-table';

// Helper function to format operator(s) - handles both string and array
function formatOperators(operator: string | string[] | undefined): string {
  if (!operator) return '';
  if (Array.isArray(operator)) {
    return operator.join(', ');
  }
  return operator;
}

export const dmcColumns: ColumnDef<DmcTableDataType>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },

  {
    accessorKey: 'dmc',
    header: 'DMC',
    // filterFn: (row, columnId, value) => {
    //   return row.getValue(columnId) === value;
    // },
  },
  {
    accessorKey: 'timeLocaleString',
    header: 'Time',
  },
  {
    accessorKey: 'article',
    header: 'Article',
  },
  {
    accessorKey: 'operator',
    header: 'Operator',
    cell: ({ row }) => {
      return formatOperators(row.original.operator);
    },
  },
  {
    accessorKey: 'workplace',
    header: 'Workplace',
    cell: ({ row }) => {
      return row.original.workplace.toUpperCase();
    },
  },

  {
    accessorKey: 'hydra_batch',
    header: 'HYDRA batch',
  },
  {
    accessorKey: 'hydra_operator',
    header: 'HYDRA operator',
    cell: ({ row }) => {
      return formatOperators(row.original.hydra_operator);
    },
  },
  {
    accessorKey: 'hydraTimeLocaleString',
    header: 'HYDRA time',
  },
  {
    accessorKey: 'pallet_batch',
    header: 'Pallet batch',
  },
  {
    accessorKey: 'pallet_operator',
    header: 'Pallet operator',
    cell: ({ row }) => {
      return formatOperators(row.original.pallet_operator);
    },
  },
  {
    accessorKey: 'palletTimeLocaleString',
    header: 'Pallet time',
  },
  {
    accessorKey: 'rework_reason',
    header: 'Rework reason',
  },
  {
    accessorKey: 'rework_user',
    header: 'Rework user',
  },
  {
    accessorKey: 'reworkTimeLocaleString',
    header: 'Rework time',
  },
];
