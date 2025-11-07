'use client';

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Table as TableIcon } from 'lucide-react';
import LocalizedLink from '@/components/localized-link';
import CardPositionsTableFilteringAndOptions from '../components/card-positions-table-filtering-and-options';
import { Dictionary } from '../../lib/dict';
import { createColumns } from './columns';

interface DataTableProps<TData, TValue> {
  dict: Dictionary;
  data: TData[];
  fetchTime: Date;
  fetchTimeLocaleString: string;
  lang: string;
  cardNumber: string;
  cardWarehouse: string;
  cardSector: string;
  cardCreators: string[];
}

export function DataTable<TData, TValue>({
  dict,
  data,
  fetchTime,
  fetchTimeLocaleString,
  lang,
  cardNumber,
  cardWarehouse,
  cardSector,
  cardCreators,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const columns = React.useMemo(
    () => createColumns(dict) as ColumnDef<TData, TValue>[],
    [dict],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <div>
            <CardTitle>
              {dict.cardPositions.table.title.replace('{cardNumber}', cardNumber)}
            </CardTitle>
            <CardDescription className='font-bold'>
              {dict.cardPositions.table.cardInfo
                .replace('{warehouse}', cardWarehouse)
                .replace('{sector}', cardSector)
                .replace('{creators}', cardCreators.join(', '))}
            </CardDescription>
          </div>
          <Button variant='outline' asChild>
            <LocalizedLink href='/inventory'>
              <TableIcon /> <span>{dict.cardPositions.table.backToCards}</span>
            </LocalizedLink>
          </Button>
        </div>
        <CardPositionsTableFilteringAndOptions dict={dict} fetchTime={fetchTime} cardNumber={cardNumber} />
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    {dict.common.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        {/* <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ArrowRight className='rotate-180 transform' />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ArrowRight />
        </Button> */}
      </CardFooter>
    </Card>
  );
}
