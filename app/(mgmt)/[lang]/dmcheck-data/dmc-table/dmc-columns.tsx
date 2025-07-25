'use client';

import { DmcTableDataType } from '@/app/(mgmt)/[lang]/dmcheck-data/lib/dmcheck-data-types';
import { ColumnDef } from '@tanstack/react-table';

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
    accessorKey: 'hydraTimeLocaleString',
    header: 'HYDRA time',
  },
  {
    accessorKey: 'pallet_batch',
    header: 'Pallet batch',
  },
  {
    accessorKey: 'palletTimeLocaleString',
    header: 'Pallet time',
  },
  {
    accessorKey: 'reworkReason',
    header: 'Rework reason',
  },
  {
    accessorKey: 'reworkTimeLocaleString',
    header: 'Rework time',
  },
];
