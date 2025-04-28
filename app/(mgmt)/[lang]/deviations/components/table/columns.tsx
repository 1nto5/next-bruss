'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DeviationType } from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ExternalLink, Pencil } from 'lucide-react';
import Link from 'next/link';

export const columns: ColumnDef<DeviationType>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let statusLabel;

      switch (status) {
        case 'in approval':
          statusLabel = (
            <Badge variant='outline' className='text-nowrap'>
              Oczekujące
            </Badge>
          );
          break;
        case 'approved':
          statusLabel = (
            <Badge
              variant='default'
              className='bg-green-100 text-green-800 hover:bg-green-100'
            >
              Zatwierdzone
            </Badge>
          );
          break;
        case 'in progress':
          statusLabel = (
            <Badge
              variant='default'
              className='bg-blue-100 text-blue-800 hover:bg-blue-100'
            >
              Obowiązuje
            </Badge>
          );
          break;
        case 'closed':
          statusLabel = (
            <Badge
              variant='default'
              className='bg-gray-100 text-gray-800 hover:bg-gray-100'
            >
              Zamknięte
            </Badge>
          );
          break;
        case 'rejected':
          statusLabel = (
            <Badge
              variant='destructive'
              className='bg-red-100 text-red-800 hover:bg-red-100'
            >
              Odrzucone
            </Badge>
          );
          break;
        case 'to approve':
          statusLabel = (
            <Badge
              variant='outline'
              className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
            >
              Do zatwierdzenia
            </Badge>
          );
          break;
        case 'draft':
          statusLabel = (
            <Badge
              variant='outline'
              className='bg-purple-100 text-purple-800 hover:bg-purple-100'
            >
              Szkic
            </Badge>
          );
          break;
        default:
          statusLabel = <Badge variant='outline'>{status}</Badge>;
      }

      return statusLabel;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const deviation = row.original;

      return (
        <Button variant='outline' size={'icon'} asChild>
          <Link
            href={
              deviation.status === 'draft'
                ? `/deviations/edit/${deviation._id}`
                : `/deviations/${deviation._id}`
            }
          >
            {deviation.status === 'draft' ? <Pencil /> : <ExternalLink />}
            <span className='sr-only'>
              {deviation.status === 'draft' ? 'Edytuj' : 'Otwórz'}
            </span>
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: 'timePeriodLocalDateString.from',
    header: 'Od',
  },
  {
    accessorKey: 'timePeriodLocalDateString.to',
    header: 'Do',
  },
  {
    accessorKey: 'articleNumber',
    header: 'Art. / Materiał',
    cell: ({ row }) => {
      const articleNumber = row.original.articleNumber;
      const articleName = row.original.articleName;
      return (
        <span className='whitespace-nowrap'>
          {articleNumber} - {articleName}
        </span>
      );
    },
  },
  {
    accessorKey: 'quantity.value',
    header: 'Ilość',
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const value = quantity?.value;
      const unit = quantity?.unit;

      return (
        <span className='text-nowrap'>
          {value} {unit && ` ${unit === 'pcs' ? 'szt.' : unit}`}
        </span>
      );
    },
  },
  {
    accessorKey: 'area',
    header: 'Obszar',
    cell: ({ row, table }) => {
      const area = row.original.area;
      const lang = table.options.meta?.lang as string;
      const areaOptions = table.options.meta?.areaOptions || [];

      if (area) {
        const areaOption = areaOptions.find((option) => option.value === area);
        if (areaOption) {
          return lang === 'pl' ? areaOption.pl : areaOption.label;
        }
        return area;
      }

      return '-';
    },
  },
  {
    accessorKey: 'reason',
    header: 'Powód',
    cell: ({ row, table }) => {
      const reason = row.original.reason;
      const lang = table.options.meta?.lang as string;
      const reasonOptions = table.options.meta?.reasonOptions || [];

      if (reason) {
        const reasonOption = reasonOptions.find(
          (option) => option.value === reason,
        );
        if (reasonOption) {
          return (
            <div className='w-[250px] text-justify'>
              {lang === 'pl' ? reasonOption.pl : reasonOption.label}
            </div>
          );
        }
        return <div className='w-[250px] text-justify'>{reason}</div>;
      }

      return '-';
    },
  },
  {
    accessorKey: 'owner',
    header: 'Właściciel',
    cell: ({ row }) => {
      const owner = row.original.owner;
      const name = extractNameFromEmail(owner);
      return <span className='whitespace-nowrap'>{name}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Utworzono',
    cell: ({ row, table }) => {
      const createdAt = row.original.createdAt;
      const lang = table.options.meta?.lang as string;
      return (
        <span className='whitespace-nowrap'>
          {createdAt ? new Date(createdAt).toLocaleDateString(lang) : ''}
        </span>
      );
    },
  },
  {
    accessorKey: '_id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.original._id?.toString();

      return id ? id.toUpperCase() : 'Brak';
    },
  },
];
