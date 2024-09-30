'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CopyPlus, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { revalidateDeviations } from '../actions';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fetchTime: string;
  lang: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchTime,
  lang,
}: DataTableProps<TData, TValue>) {
  useEffect(() => {
    const interval = setInterval(() => {
      revalidateDeviations();
    }, 1000 * 30); // 30 seconds

    return () => clearInterval(interval);
  }, []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 14,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odchylenia</CardTitle>
        <CardDescription>Ostatnia synchronizacja: {fetchTime}</CardDescription>
        <div className='flex items-center justify-between'>
          <div className='flex flex-row space-x-1'>
            <Input
              placeholder='id'
              value={(table.getColumn('_id')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('_id')?.setFilterValue(event.target.value)
              }
              className='w-24'
            />
            <Input
              placeholder='numer art.'
              value={
                (table
                  .getColumn('articleNumber')
                  ?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table
                  .getColumn('articleNumber')
                  ?.setFilterValue(event.target.value)
              }
              className='w-28'
            />
            <Input
              placeholder='nazwa art.'
              value={
                (table.getColumn('articleName')?.getFilterValue() as string) ??
                ''
              }
              onChange={(event) =>
                table
                  .getColumn('articleName')
                  ?.setFilterValue(event.target.value)
              }
              className='w-32'
            />
            {/* <Input
              placeholder='stanowisko'
              value={
                (table.getColumn('workplace')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('workplace')?.setFilterValue(event.target.value)
              }
              className='mr-2 max-w-xs'
            /> */}
          </div>
          <div className='flex items-center space-x-1'>
            <Link href='/deviations/add'>
              <Button variant='outline' size='icon'>
                <CopyPlus />
              </Button>
            </Link>
            <Button
              variant='outline'
              onClick={() => revalidateDeviations()}
              size='icon'
            >
              <RefreshCcw />
            </Button>
          </div>
        </div>
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
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
        </Button>
      </CardFooter>
    </Card>
  );
}
