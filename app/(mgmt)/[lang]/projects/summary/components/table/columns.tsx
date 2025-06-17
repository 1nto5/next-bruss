'use client';

import { ColumnDef } from '@tanstack/react-table';

import { ProjectsSummaryType } from '../../../lib/types';

export const columns: ColumnDef<ProjectsSummaryType>[] = [
  {
    accessorKey: 'project',
    header: 'Project',
    cell: ({ row }) => {
      const note = row.getValue('project');
      return <div className='w-[500px] text-justify'>{note as string}</div>;
    },
  },
  {
    accessorKey: 'time',
    header: 'Time [h]',
  },
];
