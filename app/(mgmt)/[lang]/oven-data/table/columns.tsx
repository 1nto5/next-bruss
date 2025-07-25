'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { OvenProcessDataType } from '../lib/types';

export const ovenColumns: ColumnDef<OvenProcessDataType>[] = [
  {
    accessorKey: 'oven',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Oven
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <div>{String(row.getValue('oven')).toUpperCase()}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      // Capitalize the first letter
      const statusLabel = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : '';
      return (
        <Badge
          variant={status === 'running' ? 'default' : 'secondary'}
          className={
            status === 'running'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }
        >
          {statusLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'article',
    header: 'Article',
    cell: ({ row }) => <div>{row.getValue('article')}</div>,
  },
  {
    accessorKey: 'hydraBatch',
    header: 'Hydra Batch',
    cell: ({ row }) => <div>{row.getValue('hydraBatch')}</div>,
  },
  {
    accessorKey: 'operator',
    header: 'Operators',
    cell: ({ row }) => {
      // Render operators as a comma-separated string
      const operators = row.getValue('operator') as string[];
      return (
        <div>{Array.isArray(operators) ? operators.join(', ') : operators}</div>
      );
    },
  },
  {
    accessorKey: 'startTimeLocaleString',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Start Time
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('startTimeLocaleString')}</div>,
  },
  {
    accessorKey: 'endTimeLocaleString',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        End Time
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const endTime = row.getValue('endTimeLocaleString') as string;
      return (
        <div>
          {endTime || <span className='text-gray-400'>In progress</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => {
      const duration = row.getValue('duration') as number;
      if (!duration) {
        return <span className='text-gray-400'>-</span>;
      }
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return (
        <div>
          {hours}h {minutes}m
        </div>
      );
    },
  },
  {
    accessorKey: 'targetTemp',
    header: 'Target Temp',
    cell: ({ row }) => {
      const targetTemp = row.original.targetTemp;
      const tempTolerance = row.original.tempTolerance;
      if (!targetTemp || !tempTolerance) {
        return <span className='text-gray-400'>-</span>;
      }
      return (
        <div>
          <div>{targetTemp}°C</div>
          <div className='text-xs text-gray-500'>±{tempTolerance}°C</div>
        </div>
      );
    },
  },
];
