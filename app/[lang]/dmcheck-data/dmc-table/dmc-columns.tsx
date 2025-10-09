import { DmcTableDataType } from '@/app/[lang]/dmcheck-data/lib/dmcheck-data-types';
import { ColumnDef } from '@tanstack/react-table';
import type { Dictionary } from '../lib/dict';

// Helper function to format operator(s) - handles both string and array
function formatOperators(operator: string | string[] | undefined): string {
  if (!operator) return '';
  if (Array.isArray(operator)) {
    return operator.join(', ');
  }
  return operator;
}

export function getDmcColumns(dict: Dictionary): ColumnDef<DmcTableDataType>[] {
  return [
    {
      accessorKey: 'status',
      header: dict.columns.status,
    },

    {
      accessorKey: 'dmc',
      header: dict.columns.dmc,
      // filterFn: (row, columnId, value) => {
      //   return row.getValue(columnId) === value;
      // },
    },
    {
      accessorKey: 'timeLocaleString',
      header: dict.columns.time,
    },
    {
      accessorKey: 'article',
      header: dict.columns.article,
    },
    {
      accessorKey: 'operator',
      header: dict.columns.operator,
      cell: ({ row }) => {
        return formatOperators(row.original.operator);
      },
    },
    {
      accessorKey: 'workplace',
      header: dict.columns.workplace,
      cell: ({ row }) => {
        return row.original.workplace.toUpperCase();
      },
    },

    {
      accessorKey: 'hydra_batch',
      header: dict.columns.hydraBatch,
    },
    {
      accessorKey: 'hydra_operator',
      header: dict.columns.hydraOperator,
      cell: ({ row }) => {
        return formatOperators(row.original.hydra_operator);
      },
    },
    {
      accessorKey: 'hydraTimeLocaleString',
      header: dict.columns.hydraTime,
    },
    {
      accessorKey: 'pallet_batch',
      header: dict.columns.palletBatch,
    },
    {
      accessorKey: 'pallet_operator',
      header: dict.columns.palletOperator,
      cell: ({ row }) => {
        return formatOperators(row.original.pallet_operator);
      },
    },
    {
      accessorKey: 'palletTimeLocaleString',
      header: dict.columns.palletTime,
    },
    {
      accessorKey: 'rework_reason',
      header: dict.columns.reworkReason,
    },
    {
      accessorKey: 'rework_user',
      header: dict.columns.reworkUser,
    },
    {
      accessorKey: 'reworkTimeLocaleString',
      header: dict.columns.reworkTime,
    },
  ];
}
