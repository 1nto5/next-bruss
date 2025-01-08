'use client';

import { Button } from '@/components/ui/button';
import { ScanTableDataType } from '@/lib/types/dmcheck-data';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, List, Table } from 'lucide-react';
import Link from 'next/link';

export const dmcColumns: ColumnDef<ScanTableDataType>[] = [
  {
    accessorKey: 'dmc',
    header: 'DMC',
    filterFn: (row, columnId, value) => {
      return row.getValue(columnId) === value;
    },
  },

  {
    accessorKey: 'workplace',
    header: 'Stanowisko',
    filterFn: (row, columnId, value) => {
      return row.getValue(columnId) === value;
    },
    cell: ({ row }) => {
      const workplace = row.original.workplace;
      return workplace.toUpperCase();
    },
  },
  {
    accessorKey: 'timeLocaleString',
    header: 'Czas',
  },
  {
    accessorKey: 'operator',
    header: 'Operator',
  },
];
